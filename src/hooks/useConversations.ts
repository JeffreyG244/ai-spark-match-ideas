
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  other_participant?: string;
  last_message?: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Add other participant info
      const conversationsWithOtherParticipant = data?.map(conv => ({
        ...conv,
        other_participant: conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1
      })) || [];

      setConversations(conversationsWithOtherParticipant);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrGetConversation = async (otherUserId: string) => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
        .single();

      if (existing) return existing;

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: otherUserId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    console.log('useConversations: Setting up for user', user.id);
    loadConversations();

    // Only subscribe if not already subscribed
    if (!isSubscribedRef.current) {
      try {
        // Clean up existing channel if it exists
        if (channelRef.current) {
          console.log('useConversations: Cleaning up existing channel');
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        // Subscribe to conversation changes with unique channel name
        const channelName = `conversations-${user.id}-${Date.now()}`;
        channelRef.current = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'conversations'
            },
            (payload) => {
              console.log('Conversation change:', payload);
              loadConversations();
            }
          )
          .subscribe((status, err) => {
            if (err) {
              console.error('Conversations subscription error:', err);
            } else {
              console.log('Conversations subscription status:', status);
              if (status === 'SUBSCRIBED') {
                isSubscribedRef.current = true;
              }
            }
          });
      } catch (error) {
        console.error('Error setting up conversations subscription:', error);
      }
    }

    return () => {
      console.log('useConversations: Cleaning up');
      if (channelRef.current && isSubscribedRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          isSubscribedRef.current = false;
        } catch (error) {
          console.error('Error cleaning up conversations channel:', error);
        }
      }
    };
  }, [user?.id]);

  return {
    conversations,
    isLoading,
    createOrGetConversation,
    loadConversations
  };
};
