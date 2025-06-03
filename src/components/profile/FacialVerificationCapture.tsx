
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, AlertCircle, Bug, Upload } from 'lucide-react';
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
  
  // Simple state - exactly like debug component
  const [status, setStatus] = useState('Click Start Camera to begin');
  const [model, setModel] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Face detection state - simple
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('Look straight at the camera');
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  
  // Capture state
  const [isUploading, setIsUploading] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  
  // Debug state
  const [showTestMode, setShowTestMode] = useState(false);

  // EXACT SAME FUNCTION as debug component - copy the working logic exactly
  const startCamera = async () => {
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
        
        // Wait for video metadata - EXACT SAME as debug
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
      
      // Simple one-time test - EXACT SAME as debug component
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
            
            // Start simple detection loop - NO complex function call
            startSimpleDetectionLoop(loadedModel);
            
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
  };

  // Simple detection loop - inline, no complex external function
  const startSimpleDetectionLoop = (faceDetector: faceLandmarksDetection.FaceLandmarksDetector) => {
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
    
    // Start detection interval
    setInterval(detectFaces, 2000);
  };

  const stopCamera = () => {
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
    setFaceDetected(false);
    setCurrentInstruction('Look straight at the camera');
    setDetectionAttempts(0);
  };

  const captureAndUploadPhoto = async () => {
    if (!model || !videoRef.current || !canvasRef.current || !user) {
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

    setIsUploading(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      console.log('📸 MAIN: Capturing photo...');
      const blob = await capturePhotoFromVideo(video, canvas);
      
      console.log('📤 MAIN: Uploading photo to storage...');
      const publicUrl = await uploadPhotoToStorage(user.id, photoCount, blob);
      await updateUserProfile(user.id, user.email || '', publicUrl);

      setPhotoCount(prev => prev + 1);
      
      toast({
        title: 'Photo Captured Successfully',
        description: `Photo ${photoCount + 1}/5 has been verified and uploaded.`,
      });

    } catch (error) {
      console.error('❌ MAIN: Error capturing/uploading photo:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to capture or upload photo.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetDetection = () => {
    setCurrentInstruction('Look straight at the camera');
    setFaceDetected(false);
    setDetectionAttempts(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const canCapture = (faceDetected || detectionAttempts > 20) && photoCount < 5 && !isUploading;
  const isRunning = !!stream && !!model && status.includes('Camera ready');

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
        {!isRunning ? (
          <div className="text-center space-y-4">
            <div className="text-sm font-medium p-2 bg-gray-100 rounded">
              Status: {status}
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={startCamera} 
                disabled={!!stream}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
              
              <Button 
                onClick={() => setShowTestMode(true)}
                variant="outline"
                size="sm"
              >
                <Bug className="h-4 w-4 mr-2" />
                Test Mode
              </Button>
            </div>
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
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={resetDetection}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>

                  <Button variant="outline" onClick={stopCamera}>
                    <Camera className="h-4 w-4 mr-2" />
                    Stop Camera
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
