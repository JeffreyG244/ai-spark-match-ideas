import React, { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface VideoCallManagerProps {
  recipientId: string;
  recipientName: string;
  onCallEnd?: () => void;
}

export const VideoCallManager: React.FC<VideoCallManagerProps> = ({
  recipientId,
  recipientName,
  onCallEnd
}) => {
  const { user } = useAuth();
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'receiving' | 'connected'>('idle');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const signalChannelRef = useRef<any>(null);

  // WebRTC Configuration (using free STUN servers)
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun.stunprotocol.org:3478' },
    ]
  };

  // Initialize WebRTC
  const initializePeerConnection = () => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && signalChannelRef.current) {
        signalChannelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            callId: `${user?.id}_${recipientId}`,
            from: user?.id
          }
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        setCallStatus('connected');
        setIsInCall(true);
      } else if (peerConnection.connectionState === 'disconnected') {
        endCall();
      }
    };

    return peerConnection;
  };

  // Get user media (camera/microphone)
  const getUserMedia = async (video: boolean = true, audio: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: video ? { width: 640, height: 480 } : false, 
        audio: audio 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Camera/Microphone Error",
        description: "Could not access camera or microphone. Please check permissions.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Start video call
  const startVideoCall = async () => {
    try {
      setCallStatus('calling');
      
      // Get user media
      const stream = await getUserMedia(true, true);
      localStreamRef.current = stream;
      
      // Initialize peer connection
      const peerConnection = initializePeerConnection();
      peerConnectionRef.current = peerConnection;
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Send call invitation through Supabase realtime
      const callChannel = supabase.channel(`call_${user?.id}_${recipientId}`);
      signalChannelRef.current = callChannel;
      
      callChannel
        .on('broadcast', { event: 'call-answer' }, async (payload) => {
          if (payload.payload.answer && peerConnection.signalingState === 'have-local-offer') {
            await peerConnection.setRemoteDescription(payload.payload.answer);
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, async (payload) => {
          if (payload.payload.candidate && payload.payload.from !== user?.id) {
            await peerConnection.addIceCandidate(payload.payload.candidate);
          }
        })
        .on('broadcast', { event: 'call-end' }, () => {
          endCall();
        })
        .subscribe();
      
      // Send call invitation
      callChannel.send({
        type: 'broadcast',
        event: 'call-invitation',
        payload: {
          offer,
          callId: `${user?.id}_${recipientId}`,
          from: user?.id,
          fromName: user?.user_metadata?.full_name || 'Anonymous',
          type: 'video'
        }
      });
      
      toast({
        title: "Calling...",
        description: `Video calling ${recipientName}`,
      });
      
    } catch (error) {
      console.error('Error starting video call:', error);
      setCallStatus('idle');
    }
  };

  // Start audio call
  const startAudioCall = async () => {
    try {
      setCallStatus('calling');
      
      // Get user media (audio only)
      const stream = await getUserMedia(false, true);
      localStreamRef.current = stream;
      
      // Initialize peer connection
      const peerConnection = initializePeerConnection();
      peerConnectionRef.current = peerConnection;
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Send call invitation through Supabase realtime
      const callChannel = supabase.channel(`call_${user?.id}_${recipientId}`);
      signalChannelRef.current = callChannel;
      
      callChannel
        .on('broadcast', { event: 'call-answer' }, async (payload) => {
          if (payload.payload.answer && peerConnection.signalingState === 'have-local-offer') {
            await peerConnection.setRemoteDescription(payload.payload.answer);
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, async (payload) => {
          if (payload.payload.candidate && payload.payload.from !== user?.id) {
            await peerConnection.addIceCandidate(payload.payload.candidate);
          }
        })
        .on('broadcast', { event: 'call-end' }, () => {
          endCall();
        })
        .subscribe();
      
      // Send call invitation
      callChannel.send({
        type: 'broadcast',
        event: 'call-invitation',
        payload: {
          offer,
          callId: `${user?.id}_${recipientId}`,
          from: user?.id,
          fromName: user?.user_metadata?.full_name || 'Anonymous',
          type: 'audio'
        }
      });
      
      toast({
        title: "Calling...",
        description: `Audio calling ${recipientName}`,
      });
      
    } catch (error) {
      console.error('Error starting audio call:', error);
      setCallStatus('idle');
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  // End call
  const endCall = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Unsubscribe from channel
    if (signalChannelRef.current) {
      signalChannelRef.current.send({
        type: 'broadcast',
        event: 'call-end',
        payload: { from: user?.id }
      });
      signalChannelRef.current.unsubscribe();
      signalChannelRef.current = null;
    }
    
    setIsInCall(false);
    setCallStatus('idle');
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    
    onCallEnd?.();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  if (isInCall) {
    return (
      <Card className="fixed inset-0 z-50 bg-black">
        <CardContent className="h-full p-0 relative">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Local Video */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border border-gray-300"
          />
          
          {/* Call Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
            <Button
              variant={isAudioEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-14 h-14"
            >
              {isAudioEnabled ? <Mic /> : <MicOff />}
            </Button>
            
            <Button
              variant={isVideoEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14"
            >
              {isVideoEnabled ? <Video /> : <VideoOff />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="rounded-full w-14 h-14"
            >
              <PhoneOff />
            </Button>
          </div>
          
          {/* Call Status */}
          <div className="absolute top-4 left-4 text-white">
            <p className="text-lg font-semibold">{recipientName}</p>
            <p className="text-sm opacity-75">
              {callStatus === 'connected' ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={startAudioCall}
        disabled={callStatus !== 'idle'}
        className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50"
      >
        <Phone className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={startVideoCall}
        disabled={callStatus !== 'idle'}
        className="bg-slate-700/50 border-slate-600/30 text-white hover:bg-slate-600/50"
      >
        <Video className="w-4 h-4" />
      </Button>
    </div>
  );
};