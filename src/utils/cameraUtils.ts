
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
  console.log('🧠 Initializing TensorFlow.js...');
  
  try {
    // Try WebGL first, fallback to CPU if needed
    await tf.setBackend('webgl');
    await tf.ready();
    console.log('✅ TensorFlow.js ready with WebGL backend');
  } catch (webglError) {
    console.warn('⚠️ WebGL backend failed, falling back to CPU:', webglError);
    try {
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('✅ TensorFlow.js ready with CPU backend');
    } catch (cpuError) {
      console.error('❌ Both WebGL and CPU backends failed:', cpuError);
      throw new Error('TensorFlow.js initialization failed');
    }
  }
  
  console.log('🔍 Loading face detection model...');
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const detectorConfig = {
    runtime: 'tfjs' as const,
    refineLandmarks: false,
    maxFaces: 1,
    shouldLoadIrisModel: false
  };
  
  const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
  console.log('🎯 Face detection model loaded successfully');
  
  return faceDetector;
};

export const setupVideoStream = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  constraints: CameraConstraints
): Promise<MediaStream> => {
  console.log('📷 Requesting camera access...');
  
  // Check if mediaDevices is supported
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera not supported on this device');
  }

  console.log('📷 Requesting camera with constraints:', constraints);
  
  let mediaStream: MediaStream;
  try {
    // Request camera permission first - this will trigger the permission dialog
    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('✅ Camera permission granted, stream obtained');
  } catch (permissionError) {
    console.error('❌ Camera permission error:', permissionError);
    if (permissionError.name === 'NotAllowedError') {
      throw new Error('Camera permission denied. Please allow camera access in your browser settings.');
    } else if (permissionError.name === 'NotFoundError') {
      throw new Error('No camera found. Please connect a camera device.');
    } else if (permissionError.name === 'NotReadableError') {
      throw new Error('Camera is being used by another application. Please close other camera apps.');
    } else {
      throw new Error(`Camera error: ${permissionError.message}`);
    }
  }

  // Now check available devices AFTER getting permission
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log(`📹 Found ${videoDevices.length} video input devices after permission granted`);
  } catch (deviceError) {
    console.warn('⚠️ Could not enumerate devices, but stream is working:', deviceError);
  }
  
  if (videoRef.current) {
    videoRef.current.srcObject = mediaStream;
    
    await new Promise<void>((resolve, reject) => {
      if (videoRef.current) {
        const video = videoRef.current;
        
        const handleLoadedMetadata = () => {
          console.log('📹 Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
          if (video.videoWidth === 0 || video.videoHeight === 0) {
            reject(new Error('Camera stream has invalid dimensions'));
            return;
          }
          
          video.play()
            .then(() => {
              console.log('▶️ Video playing successfully');
              // Give video a moment to stabilize before resolving
              setTimeout(() => resolve(), 500);
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
        
        // Timeout after 15 seconds
        setTimeout(() => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('error', handleError);
          reject(new Error('Camera initialization timeout'));
        }, 15000);
      }
    });
  }

  return mediaStream;
};
