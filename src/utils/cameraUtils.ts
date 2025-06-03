
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

export const getAndroidOptimizedConstraints = (): CameraConstraints => ({
  video: { 
    width: { ideal: 480, min: 240, max: 640 }, 
    height: { ideal: 360, min: 180, max: 480 }, 
    facingMode: 'user',
    frameRate: { ideal: 10, min: 5, max: 15 }
  },
  audio: false
});

export const initializeTensorFlow = async (): Promise<faceLandmarksDetection.FaceLandmarksDetector> => {
  console.log('🧠 Initializing TensorFlow.js...');
  await tf.setBackend('cpu');
  await tf.ready();
  console.log('✅ TensorFlow.js ready with CPU backend');
  
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
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera not supported on this device');
  }

  console.log('📷 Requesting camera with constraints:', constraints);
  const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
  
  if (videoRef.current) {
    videoRef.current.srcObject = mediaStream;
    
    await new Promise<void>((resolve, reject) => {
      if (videoRef.current) {
        const video = videoRef.current;
        video.onloadedmetadata = () => {
          console.log('📹 Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
          video.play()
            .then(() => {
              console.log('▶️ Video playing successfully');
              resolve();
            })
            .catch(reject);
        };
        video.onerror = () => reject(new Error('Video loading error'));
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return mediaStream;
};
