
import { useState, useCallback, useEffect } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export const useFaceDetectionLoop = (
  model: faceLandmarksDetection.FaceLandmarksDetector | null,
  videoRef: React.RefObject<HTMLVideoElement>,
  isUploading: boolean
) => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('Look straight at the camera');
  const [detectionAttempts, setDetectionAttempts] = useState(0);

  const startSimpleDetectionLoop = useCallback((faceDetector: faceLandmarksDetection.FaceLandmarksDetector) => {
    console.log('🔄 MAIN: Starting simple detection loop...');
    
    const detectFaces = async () => {
      if (!videoRef.current || !faceDetector || isUploading) return;
      
      try {
        const video = videoRef.current;
        if (video.readyState >= 2 && video.videoWidth > 0 && !video.paused) {
          setDetectionAttempts(prev => prev + 1);
          
          const faces = await faceDetector.estimateFaces(video, {
            flipHorizontal: false,
            staticImageMode: false
          });
          
          console.log(`👥 MAIN: Detection result: ${faces.length} faces found`);
          
          if (faces.length > 0) {
            setFaceDetected(true);
            setCurrentInstruction('✅ Perfect! Face detected clearly. Ready to capture.');
            setDetectionAttempts(0);
          } else {
            setFaceDetected(false);
            if (detectionAttempts > 15) {
              setCurrentInstruction('🔄 Having trouble detecting face - try better lighting');
            } else {
              setCurrentInstruction('👁️ No face detected - look directly at the camera');
            }
          }
        }
      } catch (error) {
        console.error('❌ MAIN: Face detection error:', error);
        setFaceDetected(false);
        setCurrentInstruction('🔧 Detection error - try restarting the camera');
      }
    };
    
    setInterval(detectFaces, 2000);
  }, [videoRef, isUploading, detectionAttempts]);

  const resetDetection = useCallback(() => {
    setCurrentInstruction('Look straight at the camera');
    setFaceDetected(false);
    setDetectionAttempts(0);
  }, []);

  useEffect(() => {
    if (model) {
      startSimpleDetectionLoop(model);
    }
  }, [model, startSimpleDetectionLoop]);

  return {
    faceDetected,
    currentInstruction,
    detectionAttempts,
    resetDetection,
    startSimpleDetectionLoop
  };
};
