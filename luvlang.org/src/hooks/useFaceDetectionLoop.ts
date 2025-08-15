
import { useState, useCallback, useEffect, useRef } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export const useFaceDetectionLoop = (
  model: faceLandmarksDetection.FaceLandmarksDetector | null,
  videoRef: React.RefObject<HTMLVideoElement>,
  isUploading: boolean
) => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('Look straight at the camera');
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [consecutiveDetections, setConsecutiveDetections] = useState(0);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isProduction = process.env.NODE_ENV === 'production';

  const logDetection = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel} DETECTION: ${message}`, data || '');
  };

  const validateVideoReady = (): boolean => {
    if (!videoRef.current) return false;
    
    const video = videoRef.current;
    const isReady = video.readyState >= 2 && 
                   video.videoWidth > 0 && 
                   video.videoHeight > 0 && 
                   !video.paused;
    
    if (!isReady) {
      logDetection('Video not ready for detection', {
        readyState: video.readyState,
        dimensions: `${video.videoWidth}x${video.videoHeight}`,
        paused: video.paused
      });
    }
    
    return isReady;
  };

  const performFaceDetection = async (): Promise<number> => {
    if (!model || !validateVideoReady() || isUploading) {
      return 0;
    }

    try {
      const video = videoRef.current!;
      const faces = await model.estimateFaces(video, {
        flipHorizontal: false,
        staticImageMode: false
      });

      logDetection(`Detection result: ${faces.length} face(s) found`);
      return faces.length;
    } catch (error) {
      logDetection('Face detection error', error);
      return 0;
    }
  };

  const updateInstructions = (facesFound: number, attempts: number) => {
    if (facesFound > 0) {
      setFaceDetected(true);
      setCurrentInstruction('✅ Perfect! Face detected clearly. Ready to capture.');
      setConsecutiveDetections(prev => prev + 1);
      setDetectionAttempts(0);
    } else {
      setFaceDetected(false);
      setConsecutiveDetections(0);
      
      if (attempts > 20) {
        setCurrentInstruction('💡 Having trouble? Try: better lighting, different angle, or capture anyway');
      } else if (attempts > 10) {
        setCurrentInstruction('🔄 Adjusting detection - try better lighting or different angle');
      } else {
        setCurrentInstruction('👁️ Position your face in the camera and look directly at it');
      }
    }
  };

  const runDetectionLoop = useCallback(async () => {
    if (!model || isUploading) return;

    const facesFound = await performFaceDetection();
    const newAttempts = detectionAttempts + 1;
    
    setDetectionAttempts(newAttempts);
    updateInstructions(facesFound, newAttempts);

    logDetection('Detection loop completed', {
      facesFound,
      attempts: newAttempts,
      consecutiveDetections: facesFound > 0 ? consecutiveDetections + 1 : 0
    });
  }, [model, isUploading, detectionAttempts, consecutiveDetections]);

  const startDetectionLoop = useCallback(() => {
    if (!model) return;

    logDetection('Starting face detection loop');
    
    // Clear any existing interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Start new detection loop every 1.5 seconds
    detectionIntervalRef.current = setInterval(runDetectionLoop, 1500);
  }, [model, runDetectionLoop]);

  const stopDetectionLoop = useCallback(() => {
    logDetection('Stopping face detection loop');
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  const resetDetection = useCallback(() => {
    logDetection('Resetting detection state');
    
    setCurrentInstruction('Look straight at the camera');
    setFaceDetected(false);
    setDetectionAttempts(0);
    setConsecutiveDetections(0);
    stopDetectionLoop();
  }, [stopDetectionLoop]);

  // Auto-start detection when model is available
  useEffect(() => {
    if (model && !isUploading) {
      startDetectionLoop();
    } else {
      stopDetectionLoop();
    }

    return stopDetectionLoop;
  }, [model, isUploading, startDetectionLoop, stopDetectionLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return stopDetectionLoop;
  }, [stopDetectionLoop]);

  return {
    faceDetected,
    currentInstruction,
    detectionAttempts,
    consecutiveDetections,
    resetDetection,
    startDetectionLoop,
    stopDetectionLoop
  };
};
