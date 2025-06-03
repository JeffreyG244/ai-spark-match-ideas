
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { validateMessageContent, sanitizeInput, logSecurityEvent, rateLimiter } from '@/utils/security';
import { toast } from '@/hooks/use-toast';

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
  const [isSending, setIsSending] = useState(false);
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
      logSecurityEvent('message_load_error', `Failed to load messages: ${error}`, 'medium');
    } finally {
      setIsLoading(false);
    }
  };

  const checkRateLimit = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_message_rate_limit', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return;

    // Client-side rate limiting
    const rateLimitKey = `messages_${user.id}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 10, 60000)) {
      const remaining = rateLimiter.getRemainingAttempts(rateLimitKey, 10, 60000);
      toast({
        title: 'Rate limit exceeded',
        description: `Please wait before sending another message. ${remaining} attempts remaining.`,
        variant: 'destructive'
      });
      logSecurityEvent('rate_limit_exceeded', `User ${user.id} exceeded message rate limit`, 'high');
      return;
    }

    setIsSending(true);

    try {
      // Sanitize input
      const sanitizedContent = sanitizeInput(content.trim());
      
      // Validate content
      const validation = validateMessageContent(sanitizedContent);
      if (!validation.isValid) {
        toast({
          title: 'Invalid message',
          description: validation.error,
          variant: 'destructive'
        });
        logSecurityEvent('invalid_message_content', `User ${user.id}: ${validation.error}`, 'medium');
        return;
      }

      // Server-side rate limit check
      const isAllowed = await checkRateLimit();
      if (!isAllowed) {
        toast({
          title: 'Rate limit exceeded',
          description: 'You are sending messages too quickly. Please wait a moment.',
          variant: 'destructive'
        });
        logSecurityEvent('server_rate_limit_exceeded', `User ${user.id} exceeded server rate limit`, 'high');
        return;
      }

      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: sanitizedContent,
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        logSecurityEvent('message_send_error', `User ${user.id}: ${error.message}`, 'high');
        toast({
          title: 'Failed to send message',
          description: 'Please try again later.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      logSecurityEvent('message_send_exception', `User ${user.id}: ${error}`, 'high');
      toast({
        title: 'Failed to send message',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
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
      logSecurityEvent('mark_read_error', `User ${user.id}: ${error}`, 'low');
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
              logSecurityEvent('realtime_subscription_error', `Messages: ${err.message}`, 'medium');
            } else {
              console.log('Messages subscription status:', status);
              if (status === 'SUBSCRIBED') {
                isSubscribedRef.current = true;
              }
            }
          });
      } catch (error) {
        console.error('Error setting up messages subscription:', error);
        logSecurityEvent('realtime_setup_error', `Messages: ${error}`, 'medium');
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
    isSending,
    sendMessage,
    markAsRead
  };
};
