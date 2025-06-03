
import { useState, useEffect } from 'react';
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

  // Update user's online status
  const updatePresence = async (isOnline: boolean) => {
    if (!user) return;

    const { error } = await supabase.rpc('upsert_user_presence', {
      p_user_id: user.id,
      p_is_online: isOnline
    });

    if (error) {
      console.error('Error updating presence:', error);
    }
  };

  // Load initial presence data
  const loadPresence = async () => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setOnlineUsers(data || []);
    } catch (error) {
      console.error('Error loading presence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Set user as online when component mounts
    updatePresence(true);
    loadPresence();

    // Subscribe to presence changes
    const channel = supabase
      .channel('user-presence-changes')
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
      .subscribe();

    // Set user as offline when page is about to unload
    const handleBeforeUnload = () => updatePresence(false);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updatePresence(false);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      supabase.removeChannel(channel);
    };
  }, [user]);

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
