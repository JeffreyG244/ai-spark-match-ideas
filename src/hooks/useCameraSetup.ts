
import { useState, useRef, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { toast } from '@/hooks/use-toast';

export const useCameraSetup = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Click Start Camera to begin');
  const [model, setModel] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setStatus('Step 1: Requesting camera...');
      console.log('🧪 MAIN: Requesting camera...');
      
      const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('✅ MAIN: Camera stream OK');
      setStream(testStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = testStream;
        await videoRef.current.play();
        setStatus('Step 2: Camera active, setting up AI...');
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('✅ MAIN: Video metadata loaded');
              console.log('📐 MAIN: Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
              resolve(true);
            };
          }
        });
      }
      
      setStatus('Step 3: Setting TFJS backend...');
      console.log('🧪 MAIN: Setting TFJS backend to WebGL...');
      
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('✅ MAIN: WebGL backend ready');
      } catch (webglError) {
        console.warn('⚠️ MAIN: WebGL failed, using CPU:', webglError);
        await tf.setBackend('cpu');
        await tf.ready();
      }
      
      console.log('🔍 MAIN: Current backend:', tf.getBackend());
      
      setStatus('Step 4: Loading face detection model...');
      console.log('🧪 MAIN: Loading FaceMesh model...');
      
      const loadedModel = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          refineLandmarks: false,
          maxFaces: 1
        }
      );
      
      setModel(loadedModel);
      console.log('✅ MAIN: Model loaded successfully');
      setStatus('Step 5: Testing face detection...');
      
      setTimeout(async () => {
        if (videoRef.current && loadedModel) {
          try {
            const faces = await loadedModel.estimateFaces(videoRef.current, {
              flipHorizontal: false,
              staticImageMode: false
            });
            console.log('🧪 MAIN: Face detection test result:', faces);
            setStatus(`✅ Camera ready! Face detection active`);
            
            toast({
              title: 'Camera Ready',
              description: 'Face detection is now active. Position your face in the camera.',
            });
            
            return loadedModel;
            
          } catch (detectionError) {
            console.error('❌ MAIN: Face detection test failed:', detectionError);
            setStatus('❌ Face detection test failed');
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ MAIN: Error:', error);
      setStatus(`❌ Camera failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Camera Error',
        description: error instanceof Error ? error.message : 'Camera initialization failed',
        variant: 'destructive'
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log('🛑 MAIN: Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setModel(null);
    setStatus('Camera stopped');
  }, [stream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    videoRef,
    status,
    model,
    stream,
    startCamera,
    stopCamera
  };
};
