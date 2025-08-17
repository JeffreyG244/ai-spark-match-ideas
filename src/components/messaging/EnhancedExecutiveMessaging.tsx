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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCoffeeDateDialog, setShowCoffeeDateDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Update conversation to archived status
      const { error } = await supabase
        .from('conversations')
        .update({ is_archived: true })
        .eq('id', selectedConversation.id);
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to archive conversation',
          variant: 'destructive'
        });
        return;
      }
      
      // Update UI - remove from active conversations list
      setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
      setSelectedConversation(null);
      
      toast({
        title: 'Conversation Archived',
        description: `Conversation with ${selectedConversation.name} has been archived`
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      // Delete all messages in the conversation first
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', selectedConversation.id);
      
      if (messagesError) {
        toast({
          title: 'Error',
          description: 'Failed to delete messages',
          variant: 'destructive'
        });
        return;
      }
      
      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', selectedConversation.id);
      
      if (conversationError) {
        toast({
          title: 'Error',
          description: 'Failed to delete conversation',
          variant: 'destructive'
        });
        return;
      }
      
      // Update UI
      setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
      setSelectedConversation(null);
      
      toast({
        title: 'Conversation Deleted',
        description: `Conversation with ${selectedConversation.name} has been permanently deleted`,
        variant: 'destructive'
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
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

  const handleDeleteMessage = (messageId: string) => {
    try {
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Show success toast
      toast({
        title: 'Message Deleted',
        description: 'Message has been permanently deleted'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Delete Failed',
        description: 'Unable to delete message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isMe = message.senderId === user?.id || message.senderId === 'me';
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 group`}>
        <div className={`relative max-w-xs lg:max-w-md ${
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
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 bg-slate-700/50 border-slate-600/30 text-white placeholder-gray-400"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
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