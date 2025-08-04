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
    // Always load conversations immediately
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Create professional executive conversations (mix of real matches and demo data)
      const executiveProfiles = [
        {
          id: '1',
          name: 'Alexandra Sterling',
          title: 'Chief Technology Officer',
          company: 'Meta',
          photo: 'https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
          lastMessage: "Looking forward to our coffee meeting this Friday!",
          timestamp: '2 min ago',
          unreadCount: 2,
          isOnline: true,
          isVerified: true,
          isPremium: true
        },
        {
          id: '2',
          name: 'Marcus Chen',
          title: 'Managing Director',
          company: 'Goldman Sachs',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
          lastMessage: "Thanks for the connection, would love to discuss synergies...",
          timestamp: '1 hour ago',
          unreadCount: 1,
          isOnline: true,
          isVerified: true,
          isPremium: true
        },
        {
          id: '3',
          name: 'Sofia Rodriguez',
          title: 'VP of Marketing',
          company: 'Netflix',
          photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
          lastMessage: "Your profile caught my attention. Great work on the sustainability initiative!",
          timestamp: '3 hours ago',
          unreadCount: 0,
          isOnline: false,
          isVerified: true,
          isPremium: true
        },
        {
          id: '4',
          name: 'David Park',
          title: 'Senior VP Sales',
          company: 'Salesforce',
          photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
          lastMessage: "Great to match with you! Would love to explore collaboration opportunities.",
          timestamp: '1 day ago',
          unreadCount: 0,
          isOnline: false,
          isVerified: true,
          isPremium: false
        },
        {
          id: '5',
          name: 'Jennifer Walsh',
          title: 'Chief Financial Officer',
          company: 'JPMorgan',
          photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
          lastMessage: "Impressive background! Let's schedule a call to discuss potential partnerships.",
          timestamp: '2 days ago',
          unreadCount: 0,
          isOnline: false,
          isVerified: true,
          isPremium: false
        }
      ];

      // Add any real matches if they exist
      const realMatches = matches.slice(0, 3).map((match, index) => ({
        id: `real_${match.id}`,
        name: match.match_profile?.first_name || 'Executive Professional',
        title: 'Senior Executive',
        company: 'Fortune 500',
        photo: match.match_profile?.photos?.[0] || 'https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        lastMessage: "Great to match with you!",
        timestamp: `${index + 3} days ago`,
        unreadCount: 0,
        isOnline: false,
        isVerified: true,
        isPremium: true
      }));

      const allConversations = [...executiveProfiles, ...realMatches];
      setConversations(allConversations);
      
      if (allConversations.length > 0) {
        setSelectedConversation(allConversations[0]);
        loadMessages(allConversations[0].id);
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
    // Professional executive messages based on conversation
    const conversationMessages: Record<string, Message[]> = {
      '1': [
        {
          id: '1',
          senderId: 'other',
          content: "Hello! I noticed we have a lot in common professionally. Your leadership experience in digital transformation really caught my attention.",
          timestamp: '10:30 AM',
          type: 'text',
          status: 'read'
        },
        {
          id: '2',
          senderId: user?.id || 'me',
          content: "Thank you! I'd be happy to connect. Your background in enterprise solutions at Meta is impressive - I've been following your work on AR/VR integration.",
          timestamp: '10:45 AM',
          type: 'text',
          status: 'read'
        },
        {
          id: '3',
          senderId: 'other',
          content: "Thank you! I've been passionate about the intersection of technology and business strategy. Perhaps we could schedule a coffee meeting to discuss potential synergies?",
          timestamp: '11:00 AM',
          type: 'text',
          status: 'read'
        },
        {
          id: '4',
          senderId: user?.id || 'me',
          content: "That sounds perfect. I'm free this Friday afternoon if that works for you. I know a great place downtown - The Executive Lounge at the Marriott.",
          timestamp: '11:15 AM',
          type: 'text',
          status: 'delivered'
        },
        {
          id: '5',
          senderId: 'other',
          content: "Perfect! Looking forward to our coffee meeting this Friday at 3 PM at The Executive Lounge. I'll bring some insights on our upcoming Q4 initiatives.",
          timestamp: '2 min ago',
          type: 'meeting',
          status: 'sent'
        }
      ],
      '2': [
        {
          id: '1',
          senderId: 'other',
          content: "Great to connect! I see we're both in the finance sector. Your experience with global markets alignment would be valuable for our upcoming expansion.",
          timestamp: '9:15 AM',
          type: 'text',
          status: 'read'
        },
        {
          id: '2',
          senderId: user?.id || 'me',
          content: "Absolutely! Goldman Sachs has always been at the forefront of financial innovation. I'd love to hear about your expansion plans.",
          timestamp: '9:30 AM',
          type: 'text',
          status: 'read'
        },
        {
          id: '3',
          senderId: 'other',
          content: "Thanks for the connection, would love to discuss synergies between our organizations. Are you available for a brief call this week?",
          timestamp: '1 hour ago',
          type: 'text',
          status: 'sent'
        }
      ]
    };

    const defaultMessages: Message[] = [
      {
        id: '1',
        senderId: 'other',
        content: "Great to match with you! Your professional background is impressive.",
        timestamp: '2:00 PM',
        type: 'text',
        status: 'read'
      },
      {
        id: '2',
        senderId: user?.id || 'me',
        content: "Thank you! Looking forward to connecting and exploring potential collaborations.",
        timestamp: '2:15 PM',
        type: 'text',
        status: 'delivered'
      }
    ];
    
    setMessages(conversationMessages[conversationId] || defaultMessages);
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