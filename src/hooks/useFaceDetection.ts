
import { useState, useCallback, useEffect } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { validateFaceDetection, performFaceDetection } from '@/utils/faceDetectionUtils';

export const useFaceDetection = (
  detector: faceLandmarksDetection.FaceLandmarksDetector | null,
  videoRef: React.RefObject<HTMLVideoElement>,
  isInitialized: boolean,
  isCapturing: boolean,
  cameraError: string | null
) => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('Look straight at the camera');
  const [detectionAttempts, setDetectionAttempts] = useState(0);

  const detectFace = useCallback(async () => {
    if (!detector || !videoRef.current || !isInitialized || isCapturing) {
      return;
    }

    try {
      const video = videoRef.current;
      
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0 || video.paused) {
        console.log('⏳ Video not ready for detection, readyState:', video.readyState);
        setCurrentInstruction('Loading camera...');
        return;
      }

      setDetectionAttempts(prev => prev + 1);
      console.log(`🔍 Face detection attempt #${detectionAttempts + 1}`);

      const faces = await performFaceDetection(detector, video);
      const result = validateFaceDetection(faces, detectionAttempts);
      
      setFaceDetected(result.faceDetected);
      setCurrentInstruction(result.instruction);
      
      if (result.shouldResetAttempts) {
        setDetectionAttempts(0);
      }
    } catch (error) {
      console.error('❌ Face detection error:', error);
      setFaceDetected(false);
      if (error instanceof Error && error.message.includes('timeout')) {
        setCurrentInstruction('⏱️ Detection slow - check your internet connection');
      } else {
        setCurrentInstruction('🔧 Detection error - try restarting the camera');
      }
    }
  }, [detector, isInitialized, isCapturing, detectionAttempts, videoRef]);

  useEffect(() => {
    let detectionInterval: NodeJS.Timeout;
    
    if (isInitialized && !isCapturing && detector && !cameraError) {
      console.log('🔄 Starting face detection loop...');
      detectionInterval = setInterval(detectFace, 1000);
    }
    
    return () => {
      if (detectionInterval) {
        console.log('⏹️ Stopping face detection loop');
        clearInterval(detectionInterval);
      }
    };
  }, [detectFace, isInitialized, isCapturing, detector, cameraError]);

  const resetDetection = () => {
    setCurrentInstruction('Look straight at the camera');
    setFaceDetected(false);
    setDetectionAttempts(0);
  };

  return {
    faceDetected,
    currentInstruction,
    detectionAttempts,
    resetDetection
  };
};
