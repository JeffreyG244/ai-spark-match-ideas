
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { waitForVideoElement } from './cameraValidation';

export const loadFaceModel = async (): Promise<faceLandmarksDetection.FaceLandmarksDetector> => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const logToConsole = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
  };

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

export const testModelWithVideo = async (
  model: faceLandmarksDetection.FaceLandmarksDetector,
  videoRef: React.RefObject<HTMLVideoElement>
): Promise<void> => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const logToConsole = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
  };

  logToConsole('Testing face detection with video...');
  
  try {
    const video = await waitForVideoElement(videoRef);
    
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
