
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Import TensorFlow.js and face detection models
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

const FacialVerificationCapture = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState('Look straight at the camera');
  const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const initializeCamera = useCallback(async () => {
    try {
      console.log('Initializing camera for Android device...');
      setIsModelLoading(true);
      setCameraError(null);
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Request camera permissions with Android-specific constraints
      const constraints = {
        video: { 
          width: { ideal: 640, min: 320, max: 1280 }, 
          height: { ideal: 480, min: 240, max: 720 }, 
          facingMode: 'user',
          frameRate: { ideal: 15, min: 10, max: 30 } // Lower framerate for Android
        },
        audio: false
      };

      console.log('Requesting camera permission...');
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Wait for video metadata and ensure it's playing
        await new Promise<void>((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('Video metadata loaded');
              if (videoRef.current) {
                videoRef.current.play()
                  .then(() => {
                    console.log('Video playing successfully');
                    resolve();
                  })
                  .catch(reject);
              }
            };
            videoRef.current.onerror = () => reject(new Error('Video loading error'));
          }
        });

        // Additional check to ensure video is actually playing
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Initialize TensorFlow.js with CPU backend for better Android compatibility
      console.log('Initializing TensorFlow.js...');
      try {
        await tf.setBackend('cpu');
        await tf.ready();
        console.log('TensorFlow.js ready with CPU backend');
      } catch (tfError) {
        console.error('TensorFlow.js initialization failed:', tfError);
        throw new Error('AI model initialization failed');
      }
      
      // Load face detection model with Android-optimized settings
      console.log('Loading face detection model...');
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs' as const,
        refineLandmarks: false,
        maxFaces: 1,
        shouldLoadIrisModel: false
      };
      
      const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      setDetector(faceDetector);
      setIsInitialized(true);
      setIsModelLoading(false);
      
      console.log('Face detection initialized successfully');
      toast({
        title: 'Camera Ready',
        description: 'Face detection is now active. Position your face in the camera.',
      });
    } catch (error) {
      console.error('Camera initialization error:', error);
      setIsModelLoading(false);
      
      let errorMessage = 'Unable to access camera or initialize face detection.';
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.message.includes('not found') || error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.message.includes('not supported')) {
          errorMessage = 'Camera not supported on this device.';
        }
      }
      
      setCameraError(errorMessage);
      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, []);

  const detectFace = useCallback(async () => {
    if (!detector || !videoRef.current || !isInitialized || isCapturing) return;

    try {
      const video = videoRef.current;
      
      // Ensure video is ready and has valid dimensions
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        console.log('Video not ready for detection');
        return;
      }

      // Perform face detection
      const faces = await detector.estimateFaces(video);
      console.log(`Face detection result: ${faces.length} faces found`);
      
      if (faces.length > 0) {
        const face = faces[0];
        // Check face quality and size
        if (face.keypoints && face.keypoints.length >= 10) {
          // Additional check for face size (ensure it's not too small)
          if (face.box && face.box.width > 80 && face.box.height > 80) {
            setFaceDetected(true);
            setCurrentInstruction('Perfect! Face detected clearly. Ready to capture.');
          } else {
            setFaceDetected(false);
            setCurrentInstruction('Move closer - your face needs to be larger in the frame');
          }
        } else {
          setFaceDetected(false);
          setCurrentInstruction('Face partially detected - position yourself better');
        }
      } else {
        setFaceDetected(false);
        setCurrentInstruction('No face detected - look directly at the camera');
      }
    } catch (error) {
      console.error('Face detection error:', error);
      setFaceDetected(false);
      setCurrentInstruction('Detection error - please refresh and try again');
    }
  }, [detector, isInitialized, isCapturing]);

  useEffect(() => {
    let detectionInterval: NodeJS.Timeout;
    
    if (isInitialized && !isCapturing && detector && !cameraError) {
      // Start detection with longer interval for Android performance
      detectionInterval = setInterval(detectFace, 500);
    }
    
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [detectFace, isInitialized, isCapturing, detector, cameraError]);

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
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');

      // Final face detection before capture
      const faces = await detector.estimateFaces(video);
      if (faces.length === 0) {
        throw new Error('No face detected during capture. Please ensure your face is visible and try again.');
      }

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Capture the image
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob with higher quality for Android
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob'));
        }, 'image/jpeg', 0.9);
      });

      // Generate filename and upload
      const timestamp = Date.now();
      const filename = `${user.id}/${timestamp}_photo_${photoCount + 1}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, blob);

      if (uploadError) throw uploadError;

      // Get public URL and update profile
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);

      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('photos')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentPhotos = currentProfile?.photos || [];
      const updatedPhotos = [...currentPhotos, publicUrl];

      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          photos: updatedPhotos,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      setPhotoCount(prev => prev + 1);
      
      toast({
        title: 'Photo Captured Successfully',
        description: `Photo ${photoCount + 1}/5 has been verified and uploaded.`,
      });

    } catch (error) {
      console.error('Error capturing/uploading photo:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to capture or upload photo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCapturing(false);
      setIsUploading(false);
    }
  };

  const resetVerification = () => {
    setCurrentInstruction('Look straight at the camera');
    setFaceDetected(false);
    setCameraError(null);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsInitialized(false);
    setDetector(null);
  };

  const retryCamera = () => {
    stopCamera();
    setCameraError(null);
    setFaceDetected(false);
    initializeCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const canCapture = faceDetected && photoCount < 5 && !isCapturing && !isUploading && !cameraError;

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
            <Button 
              onClick={retryCamera}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry Camera
            </Button>
          </div>
        ) : !isInitialized ? (
          <div className="text-center">
            <Button 
              onClick={initializeCamera} 
              disabled={isModelLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isModelLoading ? (
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
                
                <div className="absolute top-2 left-2 right-2">
                  <Badge 
                    variant={faceDetected ? "default" : "destructive"}
                    className="mb-2"
                  >
                    {faceDetected ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Face Detected</>
                    ) : (
                      <><AlertCircle className="h-3 w-3 mr-1" /> No Face</>
                    )}
                  </Badge>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-purple-800 mb-4">
                  {currentInstruction}
                </p>

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

                  <Button
                    variant="outline"
                    onClick={resetVerification}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>

                  <Button
                    variant="outline"
                    onClick={retryCamera}
                  >
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FacialVerificationCapture;
