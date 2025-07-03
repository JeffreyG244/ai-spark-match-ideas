
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { validateMessageContent, sanitizeInputAsync, logSecurityEvent, rateLimiter, LIMITS } from '@/utils/security';
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
  const previousMessagesCountRef = useRef<number>(0);

  const loadMessages = async () => {
    if (!conversationId || !user) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      // Security check: ensure the conversation belongs to the current user
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .eq('id', conversationId)
        .single();
        
      if (conversationError || !conversationData) {
        logSecurityEvent('unauthorized_conversation_access', `User ${user.id} attempted to access unauthorized conversation ${conversationId}`, 'high');
        toast({
          title: "Access denied",
          description: "You don't have permission to view this conversation",
          variant: "destructive"
        });
        setMessages([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Check for suspicious message injection
      if (data && previousMessagesCountRef.current > 0 && 
          data.length > previousMessagesCountRef.current + 5) {
        logSecurityEvent('message_injection_suspected', 
          `Abnormal message count increase in conversation ${conversationId}`, 'high');
      }
      
      previousMessagesCountRef.current = data?.length || 0;
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

    // First check client-side rate limiting
    const rateLimitKey = `messages_${user.id}`;
    if (!rateLimiter.isAllowed(rateLimitKey)) {
      logSecurityEvent('client_rate_limit_exceeded', `User ${user.id} exceeded client message rate limit`, 'medium');
      return false;
    }

    try {
      // Use the secure rate limiting function that exists in the database
      const { data, error } = await supabase.rpc('secure_rate_limit_check', {
        p_user_id: user.id,
        p_action: 'send_message',
        p_max_requests: 10,
        p_window_seconds: 60
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return;

    // Client-side rate limiting
    const rateLimitKey = `messages_${user.id}`;
    if (!rateLimiter.isAllowed(rateLimitKey)) {
      toast({
        title: 'Rate limit exceeded',
        description: 'You are sending messages too quickly. Please wait a moment.',
        variant: 'destructive'
      });
      logSecurityEvent('rate_limit_exceeded', `User ${user.id} exceeded message rate limit`, 'high');
      return;
    }

    setIsSending(true);

    try {
      // Security check: ensure user has access to this conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .eq('id', conversationId)
        .single();
        
      if (conversationError || !conversationData) {
        logSecurityEvent('unauthorized_message_send', `User ${user.id} attempted to send message to unauthorized conversation ${conversationId}`, 'high');
        toast({
          title: "Access denied",
          description: "You don't have permission to send messages in this conversation",
          variant: "destructive"
        });
        return;
      }
      
      // Sanitize input - await the async function
      const sanitizedContent = await sanitizeInputAsync(content.trim());
      
      // Validate content - await the async function
      const validation = await validateMessageContent(sanitizedContent);
      if (!validation.isValid) {
        toast({
          title: 'Invalid message',
          description: validation.errors.join(', '),
          variant: 'destructive'
        });
        logSecurityEvent('invalid_message_content', `User ${user.id}: ${validation.errors.join(', ')}`, 'medium');
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
      // Security: Only mark messages as read if the user is a participant
      const { data: message, error: messageError } = await supabase
        .from('conversation_messages')
        .select('conversation_id, sender_id')
        .eq('id', messageId)
        .single();
        
      if (messageError || !message) {
        return;
      }
      
      // Get the conversation to verify user is a participant
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .eq('id', message.conversation_id)
        .single();
        
      if (conversationError || !conversation || message.sender_id === user.id) {
        return;
      }

      const { error } = await supabase
        .from('conversation_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);

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
      previousMessagesCountRef.current = 0;
    }

    if (!conversationId || !user) {
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
              
              // Security check: Don't add messages with invalid structure
              if (!payload.new || typeof payload.new !== 'object' || !payload.new.id) {
                logSecurityEvent('invalid_message_received', 
                  `Invalid message structure received in conversation ${conversationId}`, 'medium');
                return;
              }
              
              // Only add the message if it belongs to the current conversation
              if (payload.new.conversation_id === conversationId) {
                setMessages(prev => [...prev, payload.new as Message]);
                previousMessagesCountRef.current += 1;
              }
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
              
              // Security check: Don't update messages with invalid structure
              if (!payload.new || typeof payload.new !== 'object' || !payload.new.id) {
                logSecurityEvent('invalid_message_update', 
                  `Invalid message update received in conversation ${conversationId}`, 'medium');
                return;
              }
              
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
  }, [conversationId, user]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    markAsRead
  };
};
