
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export interface CameraConstraints {
  video: {
    width: { ideal: number; min: number; max: number };
    height: { ideal: number; min: number; max: number };
    facingMode: string;
    frameRate: { ideal: number; min: number; max: number };
  };
  audio: boolean;
}

export const getOptimizedConstraints = (): CameraConstraints => ({
  video: { 
    width: { ideal: 640, min: 320, max: 1280 }, 
    height: { ideal: 480, min: 240, max: 720 }, 
    facingMode: 'user',
    frameRate: { ideal: 15, min: 10, max: 30 }
  },
  audio: false
});

export const initializeTensorFlow = async (): Promise<faceLandmarksDetection.FaceLandmarksDetector> => {
  console.log('🧠 Step 1: Initializing TensorFlow.js...');
  
  try {
    console.log('🔧 Setting TFJS backend to WebGL...');
    await tf.setBackend('webgl');
    await tf.ready();
    console.log('✅ TensorFlow.js ready with WebGL backend');
    console.log('🔍 Current backend:', tf.getBackend());
  } catch (webglError) {
    console.warn('⚠️ WebGL backend failed, falling back to CPU:', webglError);
    try {
      console.log('🔧 Setting TFJS backend to CPU...');
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('✅ TensorFlow.js ready with CPU backend');
      console.log('🔍 Current backend:', tf.getBackend());
    } catch (cpuError) {
      console.error('❌ Both WebGL and CPU backends failed:', cpuError);
      throw new Error('TensorFlow.js initialization failed - no working backend found');
    }
  }
  
  console.log('📦 Step 2: Loading face detection model...');
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: 'tfjs' as const,
    refineLandmarks: false,
    maxFaces: 1,
    shouldLoadIrisModel: false
  };
  
  try {
    console.log('⏳ Creating face detector with config:', detectorConfig);
    const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    console.log('🎯 Face detection model loaded successfully');
    return faceDetector;
  } catch (modelError) {
    console.error('❌ Face detection model loading failed:', modelError);
    throw new Error(`Face detection model failed to load: ${modelError.message}`);
  }
};

export const setupVideoStream = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  constraints: CameraConstraints
): Promise<MediaStream> => {
  console.log('📷 Step 3: Setting up camera stream...');
  
  // Check if mediaDevices is supported
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('❌ MediaDevices API not supported');
    throw new Error('Camera not supported on this device');
  }

  console.log('🔐 Checking camera permissions...');
  console.log('📋 Requesting camera with constraints:', JSON.stringify(constraints, null, 2));
  
  let mediaStream: MediaStream;
  try {
    console.log('⏳ Requesting camera access...');
    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('✅ Camera permission granted, stream obtained');
    console.log('📊 Stream details:', {
      active: mediaStream.active,
      id: mediaStream.id,
      tracks: mediaStream.getTracks().map(track => ({
        kind: track.kind,
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState
      }))
    });
  } catch (permissionError) {
    console.error('❌ Camera permission error:', permissionError);
    if (permissionError.name === 'NotAllowedError') {
      throw new Error('Camera permission denied. Please allow camera access in your browser settings and refresh the page.');
    } else if (permissionError.name === 'NotFoundError') {
      throw new Error('No camera found. Please connect a camera device and refresh the page.');
    } else if (permissionError.name === 'NotReadableError') {
      throw new Error('Camera is being used by another application. Please close other camera apps and refresh.');
    } else {
      throw new Error(`Camera error: ${permissionError.message}`);
    }
  }

  console.log('📱 Step 4: Setting up video element...');
  if (videoRef.current) {
    const video = videoRef.current;
    console.log('🔗 Connecting stream to video element...');
    video.srcObject = mediaStream;
    
    await new Promise<void>((resolve, reject) => {
      const handleLoadedMetadata = () => {
        console.log('📹 Video metadata loaded');
        console.log('📐 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
        console.log('📊 Video properties:', {
          readyState: video.readyState,
          paused: video.paused,
          ended: video.ended,
          duration: video.duration
        });
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.error('❌ Invalid video dimensions');
          reject(new Error('Camera stream has invalid dimensions'));
          return;
        }
        
        console.log('▶️ Starting video playback...');
        video.play()
          .then(() => {
            console.log('✅ Video playing successfully');
            console.log('📊 Final video state:', {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState,
              paused: video.paused
            });
            // Give video more time to stabilize
            setTimeout(() => resolve(), 1000);
          })
          .catch(playError => {
            console.error('❌ Video play error:', playError);
            reject(new Error('Failed to start video playback'));
          });
      };
      
      const handleError = (error: Event) => {
        console.error('❌ Video loading error:', error);
        reject(new Error('Video stream loading failed'));
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      video.addEventListener('error', handleError, { once: true });
      
      // Timeout after 20 seconds
      setTimeout(() => {
        console.error('⏱️ Camera setup timeout after 20 seconds');
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
        reject(new Error('Camera initialization timeout - video did not load'));
      }, 20000);
    });
  }

  console.log('🎉 Camera stream setup complete!');
  return mediaStream;
};
