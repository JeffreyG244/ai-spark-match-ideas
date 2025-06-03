
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  message_type: string;
}

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const currentConversationId = useRef<string | null>(null);

  const loadMessages = async () => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conversation_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .neq('sender_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  useEffect(() => {
    // Clean up previous subscription if conversation changed
    if (currentConversationId.current !== conversationId) {
      console.log('useMessages: Conversation changed, cleaning up previous subscription');
      if (channelRef.current && isSubscribedRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          isSubscribedRef.current = false;
        } catch (error) {
          console.error('Error cleaning up previous messages channel:', error);
        }
      }
      currentConversationId.current = conversationId;
    }

    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    console.log('useMessages: Setting up for conversation', conversationId);
    loadMessages();

    // Only subscribe if not already subscribed for this conversation
    if (!isSubscribedRef.current) {
      try {
        // Subscribe to new messages with unique channel name
        const channelName = `messages-${conversationId}-${Date.now()}`;
        channelRef.current = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'conversation_messages',
              filter: `conversation_id=eq.${conversationId}`
            },
            (payload) => {
              console.log('New message:', payload);
              setMessages(prev => [...prev, payload.new as Message]);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'conversation_messages',
              filter: `conversation_id=eq.${conversationId}`
            },
            (payload) => {
              console.log('Message updated:', payload);
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === payload.new.id ? payload.new as Message : msg
                )
              );
            }
          )
          .subscribe((status, err) => {
            if (err) {
              console.error('Messages subscription error:', err);
            } else {
              console.log('Messages subscription status:', status);
              if (status === 'SUBSCRIBED') {
                isSubscribedRef.current = true;
              }
            }
          });
      } catch (error) {
        console.error('Error setting up messages subscription:', error);
      }
    }

    return () => {
      console.log('useMessages: Cleaning up');
      if (channelRef.current && isSubscribedRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          isSubscribedRef.current = false;
        } catch (error) {
          console.error('Error cleaning up messages channel:', error);
        }
      }
    };
  }, [conversationId]);

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead
  };
};
