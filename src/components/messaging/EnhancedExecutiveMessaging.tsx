import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Send, Phone, Video, Coffee, Plus,
  Search, MoreVertical, Smile, User, CheckCircle, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { toast } from '@/hooks/use-toast';
import { VideoCallManager } from '@/components/calling/VideoCallManager';
import { SimpleCallButtons } from '@/components/calling/SimpleCallButtons';

// Define interfaces for type safety
interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read?: boolean;
  message_type?: string;
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  last_message_at?: string;
}

const EnhancedExecutiveMessaging = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Use real database hooks
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { messages, isLoading: messagesLoading, isSending, sendMessage, deleteMessage } = useMessages(selectedConversationId);

  const loading = conversationsLoading || messagesLoading;
  
  // Get selected conversation details
  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.id === selectedConversationId) 
    : null;

  // Get recipient info for calls
  const getRecipientInfo = () => {
    if (!selectedConversation || !user?.id) return null;
    
    const recipientId = selectedConversation.participant_1 === user.id 
      ? selectedConversation.participant_2 
      : selectedConversation.participant_1;
      
    return {
      id: recipientId,
      name: 'Professional Connection' // Could be enhanced with actual user data
    };
  };

  // Auto-select first conversation when conversations load
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      console.log('Auto-selecting first conversation:', conversations[0].id);
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully'
      });
    } catch (error) {
      toast({
        title: 'Send Failed', 
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle deleting messages
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const success = await deleteMessage(messageId);
      if (success) {
        console.log('Message deleted successfully via database');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  // Conversation item component
  const ConversationItem = ({ conversation }: { conversation: Conversation }) => (
    <div 
      className={`p-4 cursor-pointer transition-all border-l-4 ${
        selectedConversationId === conversation.id 
          ? 'bg-purple-500/5 border-purple-500' 
          : 'hover:bg-gray-100/5 border-transparent'
      }`}
      onClick={() => {
        console.log('Selecting conversation:', conversation.id);
        setSelectedConversationId(conversation.id);
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">
            Professional Connection
          </h4>
          <p className="text-sm text-gray-300 truncate">
            Executive • Active now
          </p>
          <span className="text-xs text-gray-400">
            {new Date(conversation.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  // Message bubble component
  const MessageBubble = ({ message }: { message: Message }) => {
    const isMe = message.sender_id === user?.id;
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 group`}>
        <div className={`relative max-w-xs lg:max-w-md ${
          isMe 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
            : 'bg-gray-700 text-white'
        } rounded-2xl px-4 py-2 shadow-sm`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-70">
              {new Date(message.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {isMe && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 opacity-70" />
              </div>
            )}
          </div>
          
          {/* Delete button - only show for user's own messages */}
          {isMe && (
            <div className="absolute -right-2 -top-2">
              <div className="relative">
                <button
                  onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700/90 hover:bg-slate-600/90 rounded-full p-1 shadow-lg"
                >
                  <MoreVertical className="w-3 h-3 text-white" />
                </button>
                
                {showDeleteMenu && (
                  <div className="absolute top-8 right-0 bg-slate-800/95 backdrop-blur-xl border border-gray-600/30 rounded-lg p-1 shadow-2xl z-50 min-w-[120px]">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
                          handleDeleteMessage(message.id);
                        }
                        setShowDeleteMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-all text-red-400 text-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300">Loading executive conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1 bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-gray-600/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-white">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <span>Messages</span>
            </CardTitle>
            <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10 bg-slate-700/50 border-slate-600/30 text-white placeholder-gray-400"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-white mb-2">No Conversations</h3>
                <p className="text-sm text-gray-300">Start discovering to begin executive conversations</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2 bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-gray-600/30">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b border-gray-600/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Professional Connection</h3>
                    <p className="text-sm text-gray-300">Active now</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getRecipientInfo() && (
                    <SimpleCallButtons
                      recipientId={getRecipientInfo()!.id}
                      recipientName={getRecipientInfo()!.name}
                    />
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50"
                  >
                    <Coffee className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-4">
              <div className="h-80 overflow-y-auto mb-4 space-y-2">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <Input 
                  placeholder="Type your professional message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-slate-700/50 border-slate-600/30 text-white placeholder-gray-400"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
              <p className="text-gray-300">Choose a match to start your professional conversation</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default EnhancedExecutiveMessaging;