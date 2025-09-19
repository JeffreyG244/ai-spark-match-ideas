import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface IncomingCall {
  offer: RTCSessionDescriptionInit;
  callId: string;
  from: string;
  fromName: string;
  type: 'audio' | 'video';
}

export const CallReceiver: React.FC = () => {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callChannelRef = useRef<any>(null);

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun.stunprotocol.org:3478' },
    ]
  };

  // Listen for incoming calls
  useEffect(() => {
    if (!user?.id) return;

    const setupCallListener = async () => {
      const channels: any[] = [];
      
      // Listen on all possible call channels for this user
      const callChannel = supabase.channel(`call_listener_${user.id}`);
      
      callChannel
        .on('broadcast', { event: 'call-invitation' }, (payload) => {
          const callData = payload.payload as IncomingCall;
          
          // Only accept calls meant for this user
          if (callData.callId.includes(user.id) && callData.from !== user.id) {
            setIncomingCall(callData);
            
            // Play notification sound
            playNotificationSound();
            
            toast({
              title: `Incoming ${callData.type} call`,
              description: `${callData.fromName} is calling you`,
              duration: 10000,
            });
          }
        })
        .on('broadcast', { event: 'call-end' }, () => {
          rejectCall();
        })
        .subscribe();
      
      channels.push(callChannel);
      
      return () => {
        channels.forEach(channel => channel.unsubscribe());
      };
    };

    const cleanup = setupCallListener();
    
    return () => {
      cleanup.then(fn => fn());
    };
  }, [user?.id]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {
        // Fallback: create beep sound if file doesn't exist
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      });
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.type === 'video',
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = peerConnection;
      
      // Add local stream
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && callChannelRef.current) {
          callChannelRef.current.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: {
              candidate: event.candidate,
              callId: incomingCall.callId,
              from: user?.id
            }
          });
        }
      };

      // Monitor connection state
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
          setIsInCall(true);
          toast({
            title: "Call Connected",
            description: `Connected to ${incomingCall.fromName}`,
          });
        } else if (['disconnected', 'failed', 'closed'].includes(peerConnection.connectionState)) {
          endCall();
        }
      };

      // Set up signaling channel
      const callChannel = supabase.channel(`call_${incomingCall.from}_${user.id}`);
      callChannelRef.current = callChannel;
      
      callChannel
        .on('broadcast', { event: 'ice-candidate' }, async (payload) => {
          if (payload.payload.candidate && payload.payload.from !== user?.id) {
            try {
              await peerConnection.addIceCandidate(payload.payload.candidate);
            } catch (error) {
              console.warn('Error adding ICE candidate:', error);
            }
          }
        })
        .on('broadcast', { event: 'call-end' }, () => {
          endCall();
        })
        .subscribe();

      // Set remote description and create answer
      await peerConnection.setRemoteDescription(incomingCall.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer
      callChannel.send({
        type: 'broadcast',
        event: 'call-answer',
        payload: {
          answer,
          callId: incomingCall.callId,
          from: user?.id
        }
      });

      setIncomingCall(null);
      setIsVideoEnabled(incomingCall.type === 'video');
      
    } catch (error) {
      console.error('Error accepting call:', error);
      toast({
        title: "Call Error",
        description: "Could not connect to the call. Please try again.",
        variant: "destructive"
      });
      rejectCall();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (incomingCall && callChannelRef.current) {
      callChannelRef.current.send({
        type: 'broadcast',
        event: 'call-rejected',
        payload: {
          callId: incomingCall.callId,
          from: user?.id
        }
      });
    }
    
    setIncomingCall(null);
    endCall();
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
    if (callChannelRef.current) {
      callChannelRef.current.send({
        type: 'broadcast',
        event: 'call-end',
        payload: { from: user?.id }
      });
      callChannelRef.current.unsubscribe();
      callChannelRef.current = null;
    }
    
    setIsInCall(false);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
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

  // Incoming call UI
  if (incomingCall && !isInCall) {
    return (
      <Card className="fixed inset-x-4 top-4 z-50 bg-white/95 backdrop-blur border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-center">
            Incoming {incomingCall.type} call
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="text-2xl">
              {incomingCall.fromName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <p className="font-semibold text-lg">{incomingCall.fromName}</p>
            <p className="text-sm text-gray-500">
              {incomingCall.type === 'video' ? 'Video Call' : 'Voice Call'}
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={rejectCall}
              className="rounded-full w-14 h-14"
            >
              <PhoneOff />
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={acceptCall}
              className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700"
            >
              {incomingCall.type === 'video' ? <Video /> : <Phone />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // In-call UI
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
              {isAudioEnabled ? <Phone /> : <PhoneOff />}
            </Button>
            
            {incomingCall?.type === 'video' && (
              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-14 h-14"
              >
                {isVideoEnabled ? <Video /> : <VideoOff />}
              </Button>
            )}
            
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
            <p className="text-lg font-semibold">{incomingCall?.fromName}</p>
            <p className="text-sm opacity-75">Connected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};