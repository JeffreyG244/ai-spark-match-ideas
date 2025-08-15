
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Circle, AlertTriangle } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { useAuth } from '@/hooks/useAuth';
import { sanitizeForDisplay, LIMITS } from '@/utils/security';

interface ChatWindowProps {
  conversationId: string | null;
  otherUserId: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, otherUserId }) => {
  const { user } = useAuth();
  const { messages, isLoading, isSending, sendMessage } = useMessages(conversationId);
  const { isUserOnline } = usePresence();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    await sendMessage(newMessage);
    setNewMessage('');
  };

  const isMessageTooLong = newMessage.length > LIMITS.MESSAGE_MAX_LENGTH;
  const charactersRemaining = LIMITS.MESSAGE_MAX_LENGTH - newMessage.length;

  if (!conversationId) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <p className="text-gray-500 text-center">
            Select a conversation to start messaging
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">
                {otherUserId?.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <Circle 
              className={`absolute -bottom-1 -right-1 h-3 w-3 ${
                isUserOnline(otherUserId!) 
                  ? 'text-green-500 fill-green-500' 
                  : 'text-gray-400 fill-gray-400'
              }`}
            />
          </div>
          <div>
            <div>User {otherUserId?.slice(0, 8)}</div>
            <div className="text-xs font-normal text-gray-500">
              {isUserOnline(otherUserId!) ? 'Online' : 'Offline'}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-gray-200 rounded max-w-xs"></div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 text-center">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {/* Removed dangerouslySetInnerHTML and replacing with safe text rendering */}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {sanitizeForDisplay(message.content)}
                  </p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`${isMessageTooLong ? 'border-red-500' : ''}`}
                  disabled={isSending}
                  maxLength={LIMITS.MESSAGE_MAX_LENGTH + 100} // Allow slight overflow for warning
                />
                {isMessageTooLong && (
                  <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              <Button 
                type="submit" 
                size="icon" 
                disabled={isSending || !newMessage.trim() || isMessageTooLong}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Character counter */}
            <div className="flex justify-between text-xs text-gray-500">
              <span></span>
              <span className={charactersRemaining < 0 ? 'text-red-500 font-medium' : ''}>
                {charactersRemaining} characters remaining
              </span>
            </div>
            
            {/* Warning for long messages */}
            {isMessageTooLong && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Message is too long. Please keep it under {LIMITS.MESSAGE_MAX_LENGTH} characters.
              </p>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
