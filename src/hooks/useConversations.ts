
import { useState, useEffect } from 'react';
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
    if (!user) return;

    loadConversations();

    // Subscribe to conversation changes
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    conversations,
    isLoading,
    createOrGetConversation,
    loadConversations
  };
};
