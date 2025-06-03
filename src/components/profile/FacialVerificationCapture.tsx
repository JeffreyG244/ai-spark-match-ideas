
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, AlertCircle, Settings, Bug, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { capturePhotoFromVideo, uploadPhotoToStorage, updateUserProfile } from '@/utils/photoCapture';
import CameraStatus from './CameraStatus';
import FaceDetectionTest from '../debug/FaceDetectionTest';

const FacialVerificationCapture = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Face detection state
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('Look straight at the camera');
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  
  // Capture state
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  
  // Debug state
  const [showTestMode, setShowTestMode] = useState(false);

  // Direct camera initialization (similar to working debug component)
  const initializeCamera = async () => {
    try {
      console.log('🚀 Starting camera initialization...');
      setIsInitializing(true);
      setCameraError(null);
      setIsInitialized(false);
      
      // Step 1: Get camera stream
      console.log('📷 Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640, min: 320, max: 1280 }, 
          height: { ideal: 480, min: 240, max: 720 }, 
          facingMode: 'user',
          frameRate: { ideal: 15, min: 10, max: 30 }
        },
        audio: false
      });
      
      console.log('✅ Camera stream obtained');
      setStream(mediaStream);
      
      // Step 2: Setup video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('📹 Video metadata loaded:', {
                width: videoRef.current?.videoWidth,
                height: videoRef.current?.videoHeight
              });
              resolve();
            };
          }
        });
      }
      
      // Step 3: Initialize TensorFlow
      console.log('🧠 Setting up TensorFlow...');
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('✅ WebGL backend ready');
      } catch (webglError) {
        console.warn('⚠️ WebGL failed, using CPU:', webglError);
        await tf.setBackend('cpu');
        await tf.ready();
      }
      
      console.log('🔍 Current backend:', tf.getBackend());
      
      // Step 4: Load face detection model
      console.log('📦 Loading face detection model...');
      const faceDetector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          refineLandmarks: false,
          maxFaces: 1
        }
      );
      
      setDetector(faceDetector);
      setIsInitialized(true);
      setIsInitializing(false);
      
      console.log('🎉 Camera and AI fully initialized');
      toast({
        title: 'Camera Ready',
        description: 'Face detection is now active. Position your face in the camera.',
      });
      
      // Start face detection loop
      startFaceDetection(faceDetector);
      
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      setIsInitializing(false);
      setIsInitialized(false);
      
      let errorMessage = 'Unable to access camera or initialize face detection.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setCameraError(errorMessage);
      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Face detection loop
  const startFaceDetection = (faceDetector: faceLandmarksDetection.FaceLandmarksDetector) => {
    const detectFaces = async () => {
      if (!videoRef.current || !faceDetector || isCapturing) return;
      
      try {
        const video = videoRef.current;
        if (video.readyState >= 2 && video.videoWidth > 0 && !video.paused) {
          setDetectionAttempts(prev => prev + 1);
          
          const faces = await faceDetector.estimateFaces(video, {
            flipHorizontal: false,
            staticImageMode: false
          });
          
          console.log(`👥 Detection result: ${faces.length} faces found`);
          
          if (faces.length > 0) {
            setFaceDetected(true);
            setCurrentInstruction('✅ Perfect! Face detected clearly. Ready to capture.');
            setDetectionAttempts(0);
          } else {
            setFaceDetected(false);
            if (detectionAttempts > 15) {
              setCurrentInstruction('🔄 Having trouble detecting face - try better lighting or restart camera');
            } else {
              setCurrentInstruction('👁️ No face detected - look directly at the camera');
            }
          }
        }
      } catch (error) {
        console.error('❌ Face detection error:', error);
        setFaceDetected(false);
        setCurrentInstruction('🔧 Detection error - try restarting the camera');
      }
    };
    
    // Start detection loop
    const detectionInterval = setInterval(detectFaces, 1000);
    
    // Store interval for cleanup
    return () => clearInterval(detectionInterval);
  };

  const stopCamera = () => {
    console.log('🛑 Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsInitialized(false);
    setDetector(null);
    setCameraError(null);
    setFaceDetected(false);
    setCurrentInstruction('Look straight at the camera');
    setDetectionAttempts(0);
  };

  const captureAndUploadPhoto = async () => {
    if (!detector || !videoRef.current || !canvasRef.current || !user) {
      toast({
        title: 'Cannot Capture',
        description: 'Camera or face detection not ready.',
        variant: 'destructive'
      });
      return;
    }

    if (photoCount >= 5) {
      toast({
        title: 'Photo Limit Reached',
        description: 'Maximum of 5 photos allowed.',
        variant: 'destructive'
      });
      return;
    }

    setIsCapturing(true);
    setIsUploading(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      console.log('📸 Capturing photo...');
      const blob = await capturePhotoFromVideo(video, canvas);
      
      console.log('📤 Uploading photo to storage...');
      const publicUrl = await uploadPhotoToStorage(user.id, photoCount, blob);
      await updateUserProfile(user.id, user.email || '', publicUrl);

      setPhotoCount(prev => prev + 1);
      
      toast({
        title: 'Photo Captured Successfully',
        description: `Photo ${photoCount + 1}/5 has been verified and uploaded.`,
      });

    } catch (error) {
      console.error('❌ Error capturing/uploading photo:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to capture or upload photo.',
        variant: 'destructive'
      });
    } finally {
      setIsCapturing(false);
      setIsUploading(false);
    }
  };

  const resetDetection = () => {
    setCurrentInstruction('Look straight at the camera');
    setFaceDetected(false);
    setDetectionAttempts(0);
    setCameraError(null);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const canCapture = (faceDetected || detectionAttempts > 20) && photoCount < 5 && !isCapturing && !isUploading && !cameraError;

  if (showTestMode) {
    return (
      <div className="space-y-4">
        <Button onClick={() => setShowTestMode(false)} variant="outline">
          ← Back to Main Camera
        </Button>
        <FaceDetectionTest />
      </div>
    );
  }

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-purple-600" />
          Facial Verification Photos ({photoCount}/5)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cameraError ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-red-800 font-medium">Camera Error</p>
              <p className="text-red-600 text-sm mt-1">{cameraError}</p>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button onClick={initializeCamera} className="bg-purple-600 hover:bg-purple-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Camera
              </Button>
              <Button onClick={() => setShowTestMode(true)} variant="outline">
                <Bug className="h-4 w-4 mr-2" />
                Test Mode
              </Button>
            </div>
          </div>
        ) : !isInitialized ? (
          <div className="text-center space-y-4">
            <Button 
              onClick={initializeCamera} 
              disabled={isInitializing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isInitializing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                  Loading Camera & AI...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </>
              )}
            </Button>
            
            {!isInitializing && (
              <Button 
                onClick={() => setShowTestMode(true)}
                variant="outline"
                size="sm"
              >
                <Bug className="h-4 w-4 mr-2" />
                Test Mode
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-sm mx-auto rounded-lg border-2 border-purple-200"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <CameraStatus
                  faceDetected={faceDetected}
                  detectionAttempts={detectionAttempts}
                  currentInstruction={currentInstruction}
                />
              </div>

              <div className="text-center">
                {detectionAttempts > 10 && (
                  <p className="text-xs text-gray-600 mb-4">
                    💡 Having trouble? Try: better lighting, different angle, or click capture anyway
                  </p>
                )}

                <div className="flex gap-2 justify-center flex-wrap">
                  <Button
                    onClick={captureAndUploadPhoto}
                    disabled={!canCapture}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Capture Photo
                      </Button>

                  <Button variant="outline" onClick={resetDetection}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>

                  <Button variant="outline" onClick={stopCamera}>
                    <Camera className="h-4 w-4 mr-2" />
                    Restart Camera
                  </Button>
                </div>
              </div>

              {photoCount > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-green-700">
                    {photoCount}/5 verified photos uploaded successfully
                  </p>
                </div>
              )}
              
              <div className="text-center">
                <Button 
                  onClick={() => setShowTestMode(true)}
                  variant="ghost"
                  size="sm"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Debug Test Mode
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FacialVerificationCapture;
