import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Mic, 
  Camera, 
  Image as ImageIcon, 
  Smile, 
  Heart, 
  ThumbsUp, 
  Laugh,
  Play,
  Pause,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: 'text' | 'photo' | 'voice' | 'video';
  media_url?: string;
  duration?: number;
  reactions?: Array<{ user_id: string; reaction: string; }>;
}

interface EnhancedMessagingProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, type: 'text' | 'photo' | 'voice' | 'video', mediaUrl?: string) => void;
  onReaction: (messageId: string, reaction: string) => void;
}

const EnhancedMessaging: React.FC<EnhancedMessagingProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  onReaction
}) => {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const reactions = ['❤️', '👍', '😂', '😮', '😢', '😡'];

  const handleSendText = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage, 'text');
      setNewMessage('');
    }
  };

  const handleFileUpload = (type: 'photo' | 'video') => {
    const input = type === 'photo' ? fileInputRef.current : videoInputRef.current;
    if (input) {
      input.click();
    }
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload the file and get a URL
      const mockUrl = URL.createObjectURL(file);
      onSendMessage(`Shared a ${type}`, type, mockUrl);
      toast({
        title: `${type === 'photo' ? 'Photo' : 'Video'} shared`,
        description: `Your ${type} has been sent`
      });
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // In a real app, you'd start recording audio
    toast({
      title: "Recording started",
      description: "Tap the mic again to send your voice message"
    });

    // Mock recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      onSendMessage('Voice message', 'voice', 'mock-audio-url');
      toast({
        title: "Voice message sent",
        description: "Your voice message has been sent"
      });
    }, 3000);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleReaction = (messageId: string, reaction: string) => {
    onReaction(messageId, reaction);
    setShowEmojiPicker(null);
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.sender_id === currentUserId;
    const reactions = message.reactions || [];

    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          {/* Message Content */}
          {message.message_type === 'text' && (
            <p>{message.content}</p>
          )}

          {message.message_type === 'photo' && (
            <div>
              <img 
                src={message.media_url} 
                alt="Shared photo" 
                className="rounded-lg max-w-full h-auto mb-2"
              />
              {message.content !== 'Shared a photo' && (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          )}

          {message.message_type === 'voice' && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="p-1">
                <Play className="h-4 w-4" />
              </Button>
              <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2">
                <div className="bg-white bg-opacity-60 h-2 rounded-full w-1/3"></div>
              </div>
              <span className="text-xs">
                {formatDuration(message.duration || 0)}
              </span>
            </div>
          )}

          {message.message_type === 'video' && (
            <div>
              <div className="relative bg-black rounded-lg mb-2">
                <video 
                  src={message.media_url} 
                  className="rounded-lg max-w-full h-auto"
                  controls
                  style={{ maxHeight: '200px' }}
                />
              </div>
              {message.content !== 'Shared a video' && (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          )}

          {/* Reactions */}
          {reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(reactions.reduce((acc: { [key: string]: number }, reaction) => {
                acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
                return acc;
              }, {})).map(([emoji, count]) => (
                <Badge key={emoji} variant="secondary" className="text-xs">
                  {emoji} {count}
                </Badge>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>

          {/* Reaction Button */}
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className="p-1 mt-1 opacity-70 hover:opacity-100"
              onClick={() => setShowEmojiPicker(
                showEmojiPicker === message.id ? null : message.id
              )}
            >
              <Smile className="h-3 w-3" />
            </Button>

            {showEmojiPicker === message.id && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                {reactions.map((reaction) => (
                  <button
                    key={reaction}
                    className="hover:bg-gray-100 p-1 rounded"
                    onClick={() => handleReaction(message.id, reaction)}
                  >
                    {reaction}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          {/* Media Buttons */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFileUpload('photo')}
              title="Send photo"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFileUpload('video')}
              title="Send video"
            >
              <Video className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={startVoiceRecording}
              disabled={isRecording}
              title="Send voice message"
              className={isRecording ? 'bg-red-100 text-red-600' : ''}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>

          {/* Text Input */}
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isRecording ? "Recording..." : "Type a message..."}
            disabled={isRecording}
            onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
            className="flex-1"
          />

          {/* Send Button */}
          <Button
            onClick={handleSendText}
            disabled={!newMessage.trim() || isRecording}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {isRecording && (
          <div className="mt-2 flex items-center gap-2 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm">Recording voice message...</span>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelected(e, 'photo')}
      />
      
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileSelected(e, 'video')}
      />
    </div>
  );
};

export default EnhancedMessaging;