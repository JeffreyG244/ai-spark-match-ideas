
import { useState, useRef, useCallback } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { toast } from '@/hooks/use-toast';
import { getOptimizedConstraints, initializeTensorFlow, setupVideoStream } from '@/utils/cameraUtils';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const initializeCamera = useCallback(async () => {
    try {
      console.log('🚀 === CAMERA INITIALIZATION STARTED ===');
      setIsModelLoading(true);
      setCameraError(null);
      setIsInitialized(false);
      
      // Log browser and device info
      console.log('🌐 Browser info:', {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      });
      
      // Check HTTPS requirement
      console.log('🔒 Security context:', {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        isSecureContext: window.isSecureContext
      });
      
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        throw new Error('Camera requires HTTPS. Please access this site via HTTPS.');
      }
      
      // Get camera constraints
      const constraints = getOptimizedConstraints();
      console.log('📋 Using camera constraints:', constraints);
      
      // Setup video stream first
      console.log('📹 === VIDEO STREAM SETUP ===');
      const mediaStream = await setupVideoStream(videoRef, constraints);
      setStream(mediaStream);
      console.log('✅ Video stream setup complete');

      // Wait for video to be truly ready
      if (videoRef.current) {
        const video = videoRef.current;
        let attempts = 0;
        const maxAttempts = 50;
        
        console.log('⏳ Waiting for video to be ready...');
        while (attempts < maxAttempts) {
          if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && !video.paused) {
            console.log(`✅ Video ready after ${attempts} attempts`);
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (attempts >= maxAttempts) {
          throw new Error('Video stream not ready after waiting');
        }
        
        console.log('🎬 Final video verification:', {
          readyState: video.readyState,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          paused: video.paused,
          ended: video.ended
        });
      }

      // Then initialize TensorFlow and load the model
      console.log('🧠 === TENSORFLOW INITIALIZATION ===');
      const faceDetector = await initializeTensorFlow();
      setDetector(faceDetector);
      setIsInitialized(true);
      setIsModelLoading(false);
      
      console.log('🎉 === CAMERA AND AI FULLY INITIALIZED ===');
      toast({
        title: 'Camera Ready',
        description: 'Face detection is now active. Position your face in the camera.',
      });
    } catch (error) {
      console.error('❌ === CAMERA INITIALIZATION FAILED ===');
      console.error('Error details:', error);
      setIsModelLoading(false);
      setIsInitialized(false);
      
      let errorMessage = 'Unable to access camera or initialize face detection.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setCameraError(errorMessage);
      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log('🛑 === STOPPING CAMERA ===');
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log(`⏹️ Stopping track: ${track.kind} (${track.label})`);
        track.stop();
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsInitialized(false);
    setDetector(null);
    setCameraError(null);
    console.log('✅ Camera stopped successfully');
  }, [stream]);

  const retryCamera = useCallback(() => {
    console.log('🔄 === RETRYING CAMERA INITIALIZATION ===');
    stopCamera();
    setTimeout(() => {
      initializeCamera();
    }, 1500);
  }, [stopCamera, initializeCamera]);

  return {
    videoRef,
    isInitialized,
    isModelLoading,
    cameraError,
    detector,
    initializeCamera,
    stopCamera,
    retryCamera,
    setCameraError
  };
};
