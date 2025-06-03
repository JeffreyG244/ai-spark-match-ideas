
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
      console.log('🔍 Skipping detection - prerequisites not met:', {
        hasDetector: !!detector,
        hasVideo: !!videoRef.current,
        isInitialized,
        isCapturing
      });
      return;
    }

    try {
      const video = videoRef.current;
      
      // Enhanced video readiness check with detailed logging
      const videoReady = video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && !video.paused && !video.ended;
      
      if (!videoReady) {
        console.log('⏳ Video not ready for detection:', {
          readyState: video.readyState,
          dimensions: `${video.videoWidth}x${video.videoHeight}`,
          paused: video.paused,
          ended: video.ended,
          currentTime: video.currentTime
        });
        setCurrentInstruction('Preparing camera...');
        return;
      }

      setDetectionAttempts(prev => {
        const newAttempts = prev + 1;
        console.log(`🔍 Face detection attempt #${newAttempts}`);
        return newAttempts;
      });

      const faces = await performFaceDetection(detector, video);
      console.log(`👥 Detection result: ${faces.length} faces found`);
      
      if (faces.length > 0) {
        console.log('😊 Face details:', {
          keypoints: faces[0].keypoints?.length || 0,
          box: faces[0].box ? {
            width: faces[0].box.width,
            height: faces[0].box.height,
            xMin: faces[0].box.xMin,
            yMin: faces[0].box.yMin
          } : 'No bounding box'
        });
      }
      
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
      // Start detection after a longer delay to ensure everything is stable
      setTimeout(() => {
        detectionInterval = setInterval(detectFace, 1500); // Slower detection rate for debugging
      }, 3000);
    }
    
    return () => {
      if (detectionInterval) {
        console.log('⏹️ Stopping face detection loop');
        clearInterval(detectionInterval);
      }
    };
  }, [detectFace, isInitialized, isCapturing, detector, cameraError]);

  const resetDetection = () => {
    console.log('🔄 Resetting face detection state');
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
