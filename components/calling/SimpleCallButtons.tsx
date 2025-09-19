import React from 'react';
import { Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface SimpleCallButtonsProps {
  recipientId: string;
  recipientName: string;
}

export const SimpleCallButtons: React.FC<SimpleCallButtonsProps> = ({
  recipientId,
  recipientName
}) => {
  
  const handleAudioCall = async () => {
    console.log('Audio call clicked', { recipientId, recipientName });
    
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      toast({
        title: "Audio Call Started",
        description: `Calling ${recipientName}... (Demo mode - calling system active)`,
        duration: 3000
      });
      
      // Stop stream for demo
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      toast({
        title: "Microphone Permission Denied",
        description: "Please allow microphone access to make calls",
        variant: "destructive"
      });
    }
  };

  const handleVideoCall = async () => {
    console.log('Video call clicked', { recipientId, recipientName });
    
    try {
      // Request camera and microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      toast({
        title: "Video Call Started",
        description: `Video calling ${recipientName}... (Demo mode - calling system active)`,
        duration: 3000
      });
      
      // Stop stream for demo
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      toast({
        title: "Camera/Microphone Permission Denied",
        description: "Please allow camera and microphone access to make video calls",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleAudioCall}
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
    </div>
  );
};