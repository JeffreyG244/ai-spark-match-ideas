
import { useState, useRef, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { toast } from '@/hooks/use-toast';

interface CameraSetupState {
  status: string;
  model: faceLandmarksDetection.FaceLandmarksDetector | null;
  stream: MediaStream | null;
  error: string | null;
  retryCount: number;
}

export const useCameraSetup = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CameraSetupState>({
    status: 'Click Start Camera to begin',
    model: null,
    stream: null,
    error: null,
    retryCount: 0
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const maxRetries = 3;

  const logToConsole = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
  };

  const checkCameraSupport = (): boolean => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      logToConsole('Camera API not supported in this browser');
      return false;
    }
    return true;
  };

  const requestCameraPermission = async (): Promise<MediaStream> => {
    try {
      logToConsole('Requesting camera permission...');
      
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      logToConsole('Camera permission granted', { 
        tracks: stream.getVideoTracks().length,
        settings: stream.getVideoTracks()[0]?.getSettings()
      });
      
      return stream;
    } catch (error: any) {
      logToConsole('Camera permission error', error);
      
      let userMessage = 'Camera access denied. ';
      if (error.name === 'NotAllowedError') {
        userMessage += 'Please allow camera access and refresh the page.';
      } else if (error.name === 'NotFoundError') {
        userMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        userMessage += 'Camera is being used by another application.';
      } else {
        userMessage += 'Please check camera permissions in browser settings.';
      }
      
      throw new Error(userMessage);
    }
  };

  const setupVideo = async (stream: MediaStream): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Video element not available'));
        return;
      }

      const video = videoRef.current;
      video.srcObject = stream;
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Video setup timeout'));
      }, 10000);

      video.onloadeddata = () => {
        clearTimeout(timeoutId);
        logToConsole('Video loaded', {
          width: video.videoWidth,
          height: video.videoHeight,
          readyState: video.readyState
        });
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          reject(new Error('Invalid video dimensions'));
          return;
        }
        
        resolve();
      };

      video.onerror = (error) => {
        clearTimeout(timeoutId);
        logToConsole('Video error', error);
        reject(new Error('Video playback failed'));
      };

      video.play().catch(reject);
    });
  };

  const setupTensorflow = async (): Promise<void> => {
    try {
      logToConsole('Setting up TensorFlow backend...');
      
      // Try WebGL first, fallback to CPU
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        logToConsole('WebGL backend ready');
      } catch (webglError) {
        logToConsole('WebGL failed, using CPU backend', webglError);
        await tf.setBackend('cpu');
        await tf.ready();
      }
      
      logToConsole('TensorFlow backend active', { backend: tf.getBackend() });
    } catch (error) {
      logToConsole('TensorFlow setup failed', error);
      throw new Error('AI backend initialization failed');
    }
  };

  const loadFaceModel = async (): Promise<faceLandmarksDetection.FaceLandmarksDetector> => {
    try {
      logToConsole('Loading face detection model...');
      
      const model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          refineLandmarks: false,
          maxFaces: 1
        }
      );
      
      logToConsole('Face detection model loaded successfully');
      return model;
    } catch (error) {
      logToConsole('Face model loading failed', error);
      throw new Error('Face detection model failed to load');
    }
  };

  const testModelWithVideo = async (model: faceLandmarksDetection.FaceLandmarksDetector): Promise<void> => {
    if (!videoRef.current) throw new Error('Video not ready for testing');
    
    try {
      logToConsole('Testing face detection...');
      const faces = await model.estimateFaces(videoRef.current, {
        flipHorizontal: false,
        staticImageMode: false
      });
      
      logToConsole('Face detection test completed', { facesFound: faces.length });
    } catch (error) {
      logToConsole('Face detection test failed', error);
      throw new Error('Face detection test failed');
    }
  };

  const startCamera = useCallback(async () => {
    if (!checkCameraSupport()) {
      setState(prev => ({ ...prev, error: 'Camera not supported in this browser' }));
      return;
    }

    const retryAttempt = state.retryCount + 1;
    
    try {
      setState(prev => ({ 
        ...prev, 
        status: `Step 1: Requesting camera access... (Attempt ${retryAttempt}/${maxRetries})`,
        error: null,
        retryCount: retryAttempt
      }));

      // Step 1: Get camera stream
      const stream = await requestCameraPermission();
      setState(prev => ({ ...prev, stream, status: 'Step 2: Setting up video...' }));

      // Step 2: Setup video element
      await setupVideo(stream);
      setState(prev => ({ ...prev, status: 'Step 3: Initializing AI backend...' }));

      // Step 3: Setup TensorFlow
      await setupTensorflow();
      setState(prev => ({ ...prev, status: 'Step 4: Loading face detection model...' }));

      // Step 4: Load face detection model
      const model = await loadFaceModel();
      setState(prev => ({ ...prev, model, status: 'Step 5: Testing face detection...' }));

      // Step 5: Test the model
      await testModelWithVideo(model);
      
      setState(prev => ({ 
        ...prev, 
        status: '✅ Camera ready! Face detection active',
        retryCount: 0
      }));

      toast({
        title: 'Camera Ready',
        description: 'Face detection is now active. Position your face in the camera.',
      });

    } catch (error: any) {
      logToConsole('Camera setup failed', error);
      
      const errorMessage = error.message || 'Unknown camera error';
      setState(prev => ({ ...prev, error: errorMessage }));

      // Retry logic
      if (retryAttempt < maxRetries) {
        setState(prev => ({ 
          ...prev, 
          status: `Error: ${errorMessage}. Retrying in 2 seconds...` 
        }));
        
        setTimeout(() => {
          startCamera();
        }, 2000);
      } else {
        setState(prev => ({ 
          ...prev, 
          status: `❌ Camera failed after ${maxRetries} attempts: ${errorMessage}`,
          retryCount: 0
        }));
        
        toast({
          title: 'Camera Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  }, [state.retryCount, maxRetries]);

  const stopCamera = useCallback(() => {
    logToConsole('Stopping camera...');
    
    if (state.stream) {
      state.stream.getTracks().forEach(track => {
        track.stop();
        logToConsole('Track stopped', { kind: track.kind, label: track.label });
      });
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setState({
      status: 'Camera stopped',
      model: null,
      stream: null,
      error: null,
      retryCount: 0
    });
  }, [state.stream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    videoRef,
    status: state.status,
    model: state.model,
    stream: state.stream,
    error: state.error,
    isRetrying: state.retryCount > 0,
    startCamera,
    stopCamera
  };
};
