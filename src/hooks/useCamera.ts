
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
      console.log('🚀 Starting camera initialization...');
      setIsModelLoading(true);
      setCameraError(null);
      setIsInitialized(false);
      
      // Get camera constraints
      const constraints = getOptimizedConstraints();
      console.log('🎯 Setting up video stream...');
      
      // Setup video stream first (this will request permission)
      const mediaStream = await setupVideoStream(videoRef, constraints);
      setStream(mediaStream);
      console.log('📹 Video stream established successfully');

      // Wait a bit more for video to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if video is actually working
      if (videoRef.current) {
        const video = videoRef.current;
        if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
          throw new Error('Video stream not ready after initialization');
        }
        console.log('✅ Video stream verified and ready');
      }

      // Then initialize TensorFlow and load the model
      console.log('🧠 Initializing face detection model...');
      const faceDetector = await initializeTensorFlow();
      setDetector(faceDetector);
      setIsInitialized(true);
      setIsModelLoading(false);
      
      console.log('✅ Camera and face detection fully initialized');
      toast({
        title: 'Camera Ready',
        description: 'Face detection is now active. Position your face in the camera.',
      });
    } catch (error) {
      console.error('❌ Camera initialization error:', error);
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
    console.log('🛑 Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log(`⏹️ Stopping track: ${track.kind}`);
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
  }, [stream]);

  const retryCamera = useCallback(() => {
    console.log('🔄 Retrying camera initialization...');
    stopCamera();
    setTimeout(() => {
      initializeCamera();
    }, 1000);
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
