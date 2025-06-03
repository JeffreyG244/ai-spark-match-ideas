
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
    logToConsole('Checking camera support...');
    
    if (!navigator.mediaDevices) {
      logToConsole('navigator.mediaDevices not available');
      return false;
    }
    
    if (!navigator.mediaDevices.getUserMedia) {
      logToConsole('getUserMedia not available');
      return false;
    }
    
    logToConsole('Camera support confirmed');
    return true;
  };

  const waitForVideoElement = async (maxWaitTime = 5000): Promise<HTMLVideoElement> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        if (videoRef.current) {
          logToConsole('Video element found', { 
            readyState: videoRef.current.readyState,
            currentTime: Date.now() - startTime 
          });
          resolve(videoRef.current);
          return;
        }
        
        if (Date.now() - startTime > maxWaitTime) {
          logToConsole('Video element wait timeout');
          reject(new Error('Video element not available after waiting'));
          return;
        }
        
        // Check again in 100ms
        setTimeout(checkElement, 100);
      };
      
      checkElement();
    });
  };

  const requestCameraPermission = async (): Promise<MediaStream> => {
    logToConsole('Starting camera permission request...');
    
    try {
      const constraints = {
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user'
        }
      };

      logToConsole('Calling getUserMedia with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      logToConsole('Camera permission granted successfully', { 
        tracks: stream.getVideoTracks().length,
        active: stream.active
      });
      
      if (stream.getVideoTracks().length === 0) {
        throw new Error('No video tracks in stream');
      }
      
      return stream;
    } catch (error: any) {
      logToConsole('Camera permission failed', error);
      
      let userMessage = 'Camera access failed: ';
      if (error.name === 'NotAllowedError') {
        userMessage += 'Permission denied. Please allow camera access and try again.';
      } else if (error.name === 'NotFoundError') {
        userMessage += 'No camera found. Please check your device has a camera.';
      } else if (error.name === 'NotReadableError') {
        userMessage += 'Camera is being used by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        userMessage += 'Camera constraints not supported. Trying with basic settings...';
        // Try again with minimal constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
          logToConsole('Basic camera access successful');
          return basicStream;
        } catch (basicError) {
          logToConsole('Basic camera access also failed', basicError);
          throw new Error('Camera not accessible with any settings');
        }
      } else {
        userMessage += error.message || 'Unknown camera error';
      }
      
      throw new Error(userMessage);
    }
  };

  const setupVideo = async (stream: MediaStream): Promise<void> => {
    logToConsole('Setting up video element...');
    
    return new Promise(async (resolve, reject) => {
      try {
        // Wait for video element to be available
        const video = await waitForVideoElement();
        
        video.srcObject = stream;
        
        // Set up timeout
        const timeoutId = setTimeout(() => {
          logToConsole('Video setup timeout after 10 seconds');
          reject(new Error('Video setup timeout - camera may not be responding'));
        }, 10000);

        // Handle successful video load
        const onLoadedData = () => {
          clearTimeout(timeoutId);
          logToConsole('Video data loaded successfully', {
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState
          });
          
          if (video.videoWidth === 0 || video.videoHeight === 0) {
            const error = 'Invalid video dimensions - camera may not be working';
            logToConsole(error);
            reject(new Error(error));
            return;
          }
          
          video.removeEventListener('loadeddata', onLoadedData);
          video.removeEventListener('error', onVideoError);
          resolve();
        };

        // Handle video errors
        const onVideoError = (event: Event) => {
          clearTimeout(timeoutId);
          const error = 'Video playback failed';
          logToConsole(error, event);
          video.removeEventListener('loadeddata', onLoadedData);
          video.removeEventListener('error', onVideoError);
          reject(new Error(error));
        };

        video.addEventListener('loadeddata', onLoadedData);
        video.addEventListener('error', onVideoError);

        // Start playing the video
        video.play().catch((playError) => {
          clearTimeout(timeoutId);
          logToConsole('Video play failed', playError);
          video.removeEventListener('loadeddata', onLoadedData);
          video.removeEventListener('error', onVideoError);
          reject(new Error('Video play failed: ' + playError.message));
        });
      } catch (error) {
        logToConsole('Video element setup failed', error);
        reject(error);
      }
    });
  };

  const setupTensorflow = async (): Promise<void> => {
    logToConsole('Setting up TensorFlow backend...');
    
    try {
      // Try WebGL first
      try {
        logToConsole('Attempting WebGL backend...');
        await tf.setBackend('webgl');
        await tf.ready();
        logToConsole('WebGL backend ready successfully');
      } catch (webglError) {
        logToConsole('WebGL failed, falling back to CPU backend', webglError);
        await tf.setBackend('cpu');
        await tf.ready();
        logToConsole('CPU backend ready');
      }
      
      const currentBackend = tf.getBackend();
      logToConsole('TensorFlow backend active:', currentBackend);
      
      if (!currentBackend) {
        throw new Error('No TensorFlow backend available');
      }
      
    } catch (error) {
      logToConsole('TensorFlow setup completely failed', error);
      throw new Error('AI backend initialization failed: ' + (error as Error).message);
    }
  };

  const loadFaceModel = async (): Promise<faceLandmarksDetection.FaceLandmarksDetector> => {
    logToConsole('Loading face detection model...');
    
    try {
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
      throw new Error('Face detection model failed to load: ' + (error as Error).message);
    }
  };

  const testModelWithVideo = async (model: faceLandmarksDetection.FaceLandmarksDetector): Promise<void> => {
    logToConsole('Testing face detection with video...');
    
    try {
      // Wait for video element to be available
      const video = await waitForVideoElement();
      
      // Wait a moment for video to be fully ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const faces = await model.estimateFaces(video, {
        flipHorizontal: false,
        staticImageMode: false
      });
      
      logToConsole('Face detection test completed successfully', { 
        facesFound: faces.length,
        videoReady: video.readyState >= 2,
        videoDimensions: `${video.videoWidth}x${video.videoHeight}`
      });
      
    } catch (error) {
      logToConsole('Face detection test failed', error);
      throw new Error('Face detection test failed: ' + (error as Error).message);
    }
  };

  const performCameraSetup = async (attemptNumber: number) => {
    logToConsole(`=== Starting camera setup process (Attempt ${attemptNumber}/${maxRetries}) ===`);
    
    if (!checkCameraSupport()) {
      throw new Error('Camera not supported in this browser');
    }

    try {
      // Clear any previous errors
      setState(prev => ({ 
        ...prev, 
        error: null,
        retryCount: attemptNumber,
        status: `Step 1/5: Requesting camera access... (Attempt ${attemptNumber}/${maxRetries})`
      }));

      // Step 1: Get camera stream
      logToConsole('=== STEP 1: Requesting camera permission ===');
      const stream = await requestCameraPermission();
      setState(prev => ({ 
        ...prev, 
        stream, 
        status: 'Step 2/5: Setting up video display...' 
      }));

      // Step 2: Setup video element
      logToConsole('=== STEP 2: Setting up video element ===');
      await setupVideo(stream);
      setState(prev => ({ 
        ...prev, 
        status: 'Step 3/5: Initializing AI backend...' 
      }));

      // Step 3: Setup TensorFlow
      logToConsole('=== STEP 3: Setting up TensorFlow ===');
      await setupTensorflow();
      setState(prev => ({ 
        ...prev, 
        status: 'Step 4/5: Loading face detection model...' 
      }));

      // Step 4: Load face detection model
      logToConsole('=== STEP 4: Loading face detection model ===');
      const model = await loadFaceModel();
      setState(prev => ({ 
        ...prev, 
        model, 
        status: 'Step 5/5: Testing face detection...' 
      }));

      // Step 5: Test the model
      logToConsole('=== STEP 5: Testing face detection ===');
      await testModelWithVideo(model);
      
      // Success!
      setState(prev => ({ 
        ...prev, 
        status: '✅ Camera ready! Face detection active',
        retryCount: 0
      }));

      logToConsole('=== CAMERA SETUP COMPLETE ===');

      toast({
        title: 'Camera Ready',
        description: 'Face detection is now active. Position your face in the camera.',
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown camera error';
      logToConsole(`Camera setup failed on attempt ${attemptNumber}:`, error);
      throw new Error(errorMessage);
    }
  };

  const startCamera = useCallback(async () => {
    const currentRetry = state.retryCount + 1;
    
    try {
      await performCameraSetup(currentRetry);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown camera error';
      setState(prev => ({ ...prev, error: errorMessage }));

      // Retry logic
      if (currentRetry < maxRetries) {
        const retryDelay = currentRetry * 1000; // Increasing delay
        setState(prev => ({ 
          ...prev, 
          status: `❌ ${errorMessage}. Retrying in ${retryDelay/1000} seconds...` 
        }));
        
        logToConsole(`Will retry in ${retryDelay}ms`);
        setTimeout(() => {
          startCamera();
        }, retryDelay);
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
  }, []); // Remove dependency on state.retryCount to prevent recreation

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
    
    logToConsole('Camera stopped successfully');
  }, [state.stream]);

  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
