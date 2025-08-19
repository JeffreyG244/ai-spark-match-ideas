import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Phone, Video, Calendar, Coffee, Plus,
  Search, Filter, MoreVertical, Smile, Paperclip, Star,
  Shield, Crown, CheckCircle, Clock, MapPin, Briefcase,
  FileText, Image, Mic, X, Check, Archive, Trash2, Flag,
  Settings, User, UserMinus, Volume2, VolumeX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const EnhancedExecutiveMessaging = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCoffeeDateDialog, setShowCoffeeDateDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use real database hooks
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { messages, isLoading: messagesLoading, isSending, sendMessage, deleteMessage } = useMessages(selectedConversationId);

  const loading = conversationsLoading || messagesLoading;
  
  // Get selected conversation details
  const selectedConversation = selectedConversationId 
    ? conversations.find(c => c.id === selectedConversationId) 
    : null;

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

  // Professional emoji set for executives
  const professionalEmojis = ['👋', '👍', '💼', '📅', '☕', '🤝', '💡', '🎯', '📊', '✅', '🚀', '💯', '🔥', '⭐', '👏', '🙌'];
  
  // Handler functions for buttons
  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user?.id || 'me',
        content: `📎 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        status: 'sent'
      };
      setMessages(prev => [...prev, message]);
      setShowAttachmentMenu(false);
      toast({
        title: 'File Attached',
        description: `${file.name} has been attached to your message`
      });
    }
  };

  const handlePhoneCall = () => {
    toast({
      title: 'Phone Call Initiated',
      description: `Calling ${selectedConversation?.name}...`
    });
    // In a real app, this would integrate with a calling service
  };

  const handleVideoCall = () => {
    toast({
      title: 'Video Call Initiated',
      description: `Starting video call with ${selectedConversation?.name}...`
    });
    // In a real app, this would integrate with a video service like Zoom/Teams
  };

  const handleCoffeeDate = () => {
    setShowCoffeeDateDialog(true);
  };

  const scheduleCoffeeDate = () => {
    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'me',
      content: `☕ Would you like to meet for coffee this Friday at 3 PM? I know a great executive lounge downtown.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'meeting',
      status: 'sent'
    };
    setMessages(prev => [...prev, message]);
    setShowCoffeeDateDialog(false);
    toast({
      title: 'Coffee Date Suggested',
      description: `Meeting proposal sent to ${selectedConversation?.name}`
    });
  };

  const handleArchiveConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      // Remove conversation from active list
      setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
      setSelectedConversation(null);
      setMessages([]);
      
      toast({
        title: 'Conversation Archived',
        description: `Conversation with ${selectedConversation.name} has been archived`
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive conversation',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      // Remove conversation from local state
      setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
      setSelectedConversation(null);
      setMessages([]);
      
      toast({
        title: 'Conversation Deleted',
        description: `Conversation with ${selectedConversation.name} has been deleted`
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive'
      });
    }
  };

  const handleBlockUser = () => {
    toast({
      title: 'User Blocked',
      description: `${selectedConversation?.name} has been blocked and removed from your matches`,
      variant: 'destructive'
    });
  };

  // UI Components
  const EmojiPicker = () => (
    showEmojiPicker && (
      <div className="absolute bottom-16 left-0 bg-slate-800/95 backdrop-blur-xl border border-gray-600/30 rounded-xl p-4 shadow-2xl z-50">
        <div className="grid grid-cols-8 gap-2 w-64">
          {professionalEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-700/50 rounded-lg transition-all text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    )
  );

  const AttachmentMenu = () => (
    showAttachmentMenu && (
      <div className="absolute bottom-16 left-12 bg-slate-800/95 backdrop-blur-xl border border-gray-600/30 rounded-xl p-2 shadow-2xl z-50">
        <div className="space-y-1 w-48">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-all text-white"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Document</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-all text-white"
          >
            <Image className="w-4 h-4 text-green-400" />
            <span className="text-sm">Photo</span>
          </button>
          <button
            onClick={() => {
              // Voice recording functionality - removed toast notification
              setShowAttachmentMenu(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-all text-white"
          >
            <Mic className="w-4 h-4 text-red-400" />
            <span className="text-sm">Voice Message</span>
          </button>
        </div>
      </div>
    )
  );

  const MoreMenu = () => (
    showMoreMenu && (
      <div className="absolute top-16 right-0 bg-slate-800/95 backdrop-blur-xl border border-gray-600/30 rounded-xl p-2 shadow-2xl z-50">
        <div className="space-y-1 w-52">
          <button
            onClick={() => {
              // View profile functionality - removed toast notification
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-all text-white"
          >
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-sm">View Profile</span>
          </button>
          <button
            onClick={() => {
              handleArchiveConversation();
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-all text-white"
          >
            <Archive className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">Archive Conversation</span>
          </button>
          <button
            onClick={() => {
              handleDeleteConversation();
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-all text-white"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span className="text-sm">Delete Conversation</span>
          </button>
          <button
            onClick={() => {
              // Mute notifications functionality - removed toast notification
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-all text-white"
          >
            <VolumeX className="w-4 h-4 text-gray-400" />
            <span className="text-sm">Mute Notifications</span>
          </button>
          <hr className="border-gray-600/30" />
          <button
            onClick={() => {
              // Report user functionality - removed toast notification
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-all text-white"
          >
            <Flag className="w-4 h-4 text-orange-400" />
            <span className="text-sm">Report User</span>
          </button>
          <button
            onClick={() => {
              handleBlockUser();
              setShowMoreMenu(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition-all text-red-400"
          >
            <UserMinus className="w-4 h-4" />
            <span className="text-sm">Block User</span>
          </button>
        </div>
      </div>
    )
  );

  const CoffeeDateDialog = () => (
    showCoffeeDateDialog && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800/95 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 w-96 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-4">☕ Schedule Coffee Date</h3>
          <p className="text-gray-300 mb-6">
            Suggest a professional coffee meeting with {selectedConversation?.name}
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Suggested Time</label>
              <input
                type="datetime-local"
                className="w-full bg-slate-700/50 border border-gray-600/30 rounded-lg px-3 py-2 text-white"
                defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input
                type="text"
                placeholder="Executive Lounge, Downtown"
                className="w-full bg-slate-700/50 border border-gray-600/30 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowCoffeeDateDialog(false)}
              className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={scheduleCoffeeDate}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 rounded-lg transition-all"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    )
  );

  const ConversationItem = ({ conversation }: { conversation: { id: string; created_at: string; last_message?: string } }) => (
    <div 
      className={`p-4 cursor-pointer transition-all border-l-4 ${
        selectedConversationId === conversation.id 
          ? 'bg-love-primary/5 border-love-primary' 
          : 'hover:bg-muted/50 border-transparent'
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
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-foreground truncate">
                Professional Connection
              </h4>
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {new Date(conversation.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate">
              {conversation.last_message || "Start your professional conversation"}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <Briefcase className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Executive Professional</span>
          </div>
        </div>
      </div>
    </div>
  );


  const MessageBubble = ({ message }: { message: { id: string; sender_id: string; content: string; created_at: string } }) => {
    const isMe = message.sender_id === user?.id;
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 group`}>
        <div className={`relative max-w-xs lg:max-w-md ${
          isMe 
            ? 'bg-gradient-to-r from-love-primary to-love-secondary text-white' 
            : 'bg-muted text-foreground'
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
      <Card className="lg:col-span-1 bg-gradient-to-br from-background to-secondary border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-love-primary" />
              <span>Messages</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-10" />
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
      <Card className="lg:col-span-2 bg-gradient-to-br from-background to-secondary border-border">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border border-background rounded-full"></div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">Professional Connection</h3>
                      <Shield className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Active now
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePhoneCall}
                    className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleVideoCall}
                    className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCoffeeDate}
                    className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50"
                  >
                    <Coffee className="w-4 h-4" />
                  </Button>
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    <MoreMenu />
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-4">
              <div className="h-80 overflow-y-auto mb-4 space-y-2">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>

              {/* Message Input */}
              <div className="relative flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <AttachmentMenu />
                </div>
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <EmojiPicker />
                </div>
                
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
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a match to start your professional conversation</p>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Overlays */}
      <CoffeeDateDialog />
    </div>
  );
};

export default EnhancedExecutiveMessaging;