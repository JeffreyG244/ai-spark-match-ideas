import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Play, Pause, Upload, VolumeX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface VoiceIntroductionCaptureProps {
  onVoiceIntroductionChange: (audioUrl: string) => void;
  currentVoiceIntroduction?: string;
}

const VoiceIntroductionCapture = ({ 
  onVoiceIntroductionChange, 
  currentVoiceIntroduction 
}: VoiceIntroductionCaptureProps) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(currentVoiceIntroduction || null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_DURATION = 30; // 30 seconds

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
      
      toast({
        title: 'Recording Started',
        description: `Record your 30-second voice introduction`,
      });
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to record your voice introduction',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      toast({
        title: 'Recording Complete',
        description: 'Your voice introduction has been recorded successfully',
      });
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob || !user) return;
    
    setIsUploading(true);
    
    try {
      const timestamp = Date.now();
      const filename = `${user.id}/voice_intro_${timestamp}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, audioBlob, {
          contentType: 'audio/webm',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);
      
      onVoiceIntroductionChange(publicUrl);
      
      toast({
        title: 'Voice Introduction Saved',
        description: 'Your voice introduction has been uploaded successfully',
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload your voice introduction',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    onVoiceIntroductionChange('');
    
    toast({
      title: 'Voice Introduction Removed',
      description: 'Your voice introduction has been removed',
    });
  };

  return (
    <Card className="border-primary-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-800">
          <Mic className="h-5 w-5" />
          Voice Introduction
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Record a 30-second introduction to let others hear your voice and personality
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
          {isRecording ? (
            <div className="text-center">
              <div className="animate-pulse">
                <Mic className="h-16 w-16 text-destructive mx-auto mb-4" />
              </div>
              <p className="text-lg font-medium text-destructive mb-2">
                Recording... {MAX_DURATION - recordingTime}s remaining
              </p>
              <Progress 
                value={(recordingTime / MAX_DURATION) * 100} 
                className="w-48 mx-auto mb-4" 
              />
              <Button 
                variant="outline" 
                onClick={stopRecording}
                className="flex items-center gap-2"
              >
                <MicOff className="h-4 w-4" />
                Stop Recording
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              {audioUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <VolumeX className="h-16 w-16 text-primary mx-auto" />
                  </div>
                  <p className="text-lg font-medium">Voice Introduction Ready</p>
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant="outline"
                      onClick={playAudio}
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button 
                      onClick={uploadAudio}
                      disabled={isUploading || !!currentVoiceIntroduction}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Save Voice Intro
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={removeAudio}
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Mic className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-lg font-medium">Ready to Record</p>
                  <p className="text-sm text-muted-foreground">
                    Click to start recording your 30-second voice introduction
                  </p>
                  <Button 
                    onClick={startRecording}
                    className="flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    Start Recording
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
        
        {/* Guidelines */}
        <div className="bg-accent p-4 rounded-lg">
          <h4 className="font-medium mb-2">Tips for a great voice introduction:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Speak clearly and at a natural pace</li>
            <li>• Introduce yourself and share what you're looking for</li>
            <li>• Mention a few hobbies or interests</li>
            <li>• Keep it friendly and authentic</li>
            <li>• Record in a quiet environment</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceIntroductionCapture;