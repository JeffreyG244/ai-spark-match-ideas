
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
  updated_at: string;
}

export const usePresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  // Update user's online status
  const updatePresence = async (isOnline: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('upsert_user_presence', {
        p_user_id: user.id,
        p_is_online: isOnline
      });

      if (error) {
        console.error('Error updating presence:', error);
      }
    } catch (error) {
      console.error('Exception updating presence:', error);
    }
  };

  // Load initial presence data
  const loadPresence = async () => {
    try {
      // Mock presence data since table doesn't exist
      const mockPresenceData = [];
      setOnlineUsers(mockPresenceData);
    } catch (error) {
      console.error('Error loading presence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    console.log('usePresence: Setting up for user', user.id);

    // Set user as online when component mounts
    updatePresence(true);
    loadPresence();

    // Only subscribe if not already subscribed
    if (!isSubscribedRef.current) {
      try {
        // Clean up existing channel if it exists
        if (channelRef.current) {
          console.log('usePresence: Cleaning up existing channel');
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Subscribe to presence changes with unique channel name
        const channelName = `user-presence-${user.id}-${Date.now()}`;
        channelRef.current = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_presence'
            },
            (payload) => {
              console.log('Presence change:', payload);
              loadPresence();
            }
          )
          .subscribe((status, err) => {
            if (err) {
              console.error('Presence subscription error:', err);
            } else {
              console.log('Presence subscription status:', status);
              if (status === 'SUBSCRIBED') {
                isSubscribedRef.current = true;
              }
            }
          });
      } catch (error) {
        console.error('Error setting up presence subscription:', error);
      }
    }

    // Set user as offline when page is about to unload
    const handleBeforeUnload = () => updatePresence(false);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log('usePresence: Cleaning up');
      updatePresence(false);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (channelRef.current && isSubscribedRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          isSubscribedRef.current = false;
        } catch (error) {
          console.error('Error cleaning up presence channel:', error);
        }
      }
    };
  }, [user?.id]);

  const isUserOnline = (userId: string) => {
    const userPresence = onlineUsers.find(p => p.user_id === userId);
    return userPresence?.is_online || false;
  };

  return {
    onlineUsers,
    isLoading,
    updatePresence,
    isUserOnline
  };
};
