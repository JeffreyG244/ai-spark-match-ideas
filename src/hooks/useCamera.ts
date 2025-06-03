
import { useState, useRef, useCallback } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { toast } from '@/hooks/use-toast';
import { getAndroidOptimizedConstraints, initializeTensorFlow, setupVideoStream } from '@/utils/cameraUtils';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const initializeCamera = useCallback(async () => {
    try {
      console.log('🚀 Starting camera initialization for Android...');
      setIsModelLoading(true);
      setCameraError(null);
      
      const constraints = getAndroidOptimizedConstraints();
      const mediaStream = await setupVideoStream(videoRef, constraints);
      setStream(mediaStream);

      const faceDetector = await initializeTensorFlow();
      setDetector(faceDetector);
      setIsInitialized(true);
      setIsModelLoading(false);
      
      toast({
        title: 'Camera Ready',
        description: 'Face detection is now active. Position your face in the camera.',
      });
    } catch (error) {
      console.error('❌ Camera initialization error:', error);
      setIsModelLoading(false);
      
      let errorMessage = 'Unable to access camera or initialize face detection.';
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.message.includes('not found') || error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.message.includes('not supported')) {
          errorMessage = 'Camera not supported on this device.';
        }
      }
      
      setCameraError(errorMessage);
      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsInitialized(false);
    setDetector(null);
  };

  const retryCamera = () => {
    console.log('🔄 Retrying camera initialization...');
    stopCamera();
    setCameraError(null);
    initializeCamera();
  };

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
