import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Send, Phone, Video, Calendar, Coffee, Plus,
  Search, Filter, MoreVertical, Smile, Paperclip, Star,
  Shield, Crown, CheckCircle, Clock, MapPin, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useMatches } from '@/hooks/useMatches';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  photo: string;
  title: string;
  company: string;
  isVerified: boolean;
  isPremium: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'meeting' | 'system';
  status: 'sent' | 'delivered' | 'read';
}

const EnhancedExecutiveMessaging = () => {
  const { user } = useAuth();
  const { matches } = useMatches();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && matches.length > 0) {
      loadConversations();
    }
  }, [user, matches]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Create mock conversations from matches
      const mockConversations: Conversation[] = matches.slice(0, 5).map((match, index) => ({
        id: match.id,
        name: `${match.match_profile?.firstName || 'Executive'} ${match.match_profile?.lastName || 'Professional'}`,
        lastMessage: index === 0 ? "Looking forward to our coffee meeting!" :
                    index === 1 ? "Thanks for the connection, would love to discuss..." :
                    index === 2 ? "Your profile caught my attention..." :
                    "Great to match with you!",
        timestamp: index === 0 ? '2 min ago' :
                  index === 1 ? '1 hour ago' :
                  index === 2 ? '3 hours ago' :
                  '1 day ago',
        unreadCount: index === 0 ? 2 : index === 1 ? 1 : 0,
        isOnline: index <= 1,
        photo: match.match_profile?.photos?.[0] || '/api/placeholder/400/400',
        title: 'Senior Executive',
        company: 'Tech Corporation',
        isVerified: true,
        isPremium: index <= 2
      }));
      
      setConversations(mockConversations);
      
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
        loadMessages(mockConversations[0].id);
      }
      
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = (conversationId: string) => {
    // Mock messages for demonstration
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'other',
        content: "Hello! I noticed we have a lot in common professionally. Would love to connect and discuss potential collaborations.",
        timestamp: '10:30 AM',
        type: 'text',
        status: 'read'
      },
      {
        id: '2',
        senderId: user?.id || 'me',
        content: "Absolutely! I'd be happy to connect. Your background in enterprise solutions is impressive.",
        timestamp: '10:45 AM',
        type: 'text',
        status: 'read'
      },
      {
        id: '3',
        senderId: 'other',
        content: "Thank you! I've been following your work in the industry. Perhaps we could schedule a coffee meeting to discuss further?",
        timestamp: '11:00 AM',
        type: 'text',
        status: 'read'
      },
      {
        id: '4',
        senderId: user?.id || 'me',
        content: "That sounds perfect. I'm free this Friday afternoon if that works for you.",
        timestamp: '11:15 AM',
        type: 'text',
        status: 'delivered'
      },
      {
        id: '5',
        senderId: 'other',
        content: "Perfect! Looking forward to our coffee meeting this Friday at 3 PM.",
        timestamp: '2 min ago',
        type: 'meeting',
        status: 'sent'
      }
    ];
    
    setMessages(mockMessages);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'me',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    toast({
      title: 'Message Sent',
      description: `Message sent to ${selectedConversation.name}`
    });
  };

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => (
    <div 
      className={`p-4 cursor-pointer transition-all border-l-4 ${
        selectedConversation?.id === conversation.id 
          ? 'bg-love-primary/5 border-love-primary' 
          : 'hover:bg-muted/50 border-transparent'
      }`}
      onClick={() => {
        setSelectedConversation(conversation);
        loadMessages(conversation.id);
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img 
            src={conversation.photo} 
            alt={conversation.name}
            className="w-12 h-12 rounded-xl object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = '/api/placeholder/400/400';
            }}
          />
          {conversation.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full"></div>
          )}
          {conversation.isPremium && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-foreground truncate">{conversation.name}</h4>
              {conversation.isVerified && (
                <Shield className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
              {conversation.unreadCount > 0 && (
                <div className="w-5 h-5 bg-love-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{conversation.unreadCount}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <Briefcase className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{conversation.title} at {conversation.company}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const MessageBubble = ({ message }: { message: Message }) => {
    const isMe = message.senderId === user?.id || message.senderId === 'me';
    
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${
          isMe 
            ? 'bg-gradient-to-r from-love-primary to-love-secondary text-white' 
            : 'bg-muted text-foreground'
        } rounded-2xl px-4 py-2 shadow-sm`}>
          {message.type === 'meeting' && (
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Meeting Scheduled</span>
            </div>
          )}
          <p className="text-sm leading-relaxed">{message.content}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-70">{message.timestamp}</span>
            {isMe && (
              <div className="flex items-center space-x-1">
                {message.status === 'sent' && <Clock className="w-3 h-3 opacity-70" />}
                {message.status === 'delivered' && <CheckCircle className="w-3 h-3 opacity-70" />}
                {message.status === 'read' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-love-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
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
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No Conversations</h3>
                <p className="text-sm text-muted-foreground">Start matching to begin conversations</p>
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
                    <img 
                      src={selectedConversation.photo} 
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    {selectedConversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border border-background rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{selectedConversation.name}</h3>
                      {selectedConversation.isVerified && (
                        <Shield className="w-4 h-4 text-emerald-500" />
                      )}
                      {selectedConversation.isPremium && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.isOnline ? 'Active now' : 'Last seen 2 hours ago'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Coffee className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
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
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Smile className="w-4 h-4" />
                </Button>
                <Input 
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white"
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
    </div>
  );
};

export default EnhancedExecutiveMessaging;