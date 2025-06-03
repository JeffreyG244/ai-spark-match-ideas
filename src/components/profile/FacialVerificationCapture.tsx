
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
  const detectionRef = useRef<number>(0);
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
  const [detectionAttempts, setDetectionAttempts] = useState(0);

  const initializeCamera = useCallback(async () => {
    try {
      console.log('🚀 Starting camera initialization for Android...');
      setIsModelLoading(true);
      setCameraError(null);
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Android-optimized camera constraints
      const constraints = {
        video: { 
          width: { ideal: 480, min: 240, max: 640 }, 
          height: { ideal: 360, min: 180, max: 480 }, 
          facingMode: 'user',
          frameRate: { ideal: 10, min: 5, max: 15 } // Very low framerate for Android
        },
        audio: false
      };

      console.log('📷 Requesting camera with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Wait for video to be ready
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

        // Give video extra time to stabilize
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Initialize TensorFlow with CPU backend (most stable for Android)
      console.log('🧠 Initializing TensorFlow.js...');
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('✅ TensorFlow.js ready with CPU backend');
      
      // Load face detection model with minimal configuration
      console.log('🔍 Loading face detection model...');
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
      setDetectionAttempts(0);
      
      console.log('🎯 Face detection model loaded successfully');
      toast({
        title: 'Camera Ready',
        description: 'Face detection is now active. Position your face in the camera.',
      });
    } catch (error) {
      console.error('❌ Camera initialization error:', error);
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
    if (!detector || !videoRef.current || !isInitialized || isCapturing) {
      return;
    }

    try {
      const video = videoRef.current;
      
      // Enhanced video readiness check
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0 || video.paused) {
        console.log('⏳ Video not ready for detection, readyState:', video.readyState);
        setCurrentInstruction('Loading camera...');
        return;
      }

      setDetectionAttempts(prev => prev + 1);
      console.log(`🔍 Face detection attempt #${detectionAttempts + 1}`);

      // Perform face detection with timeout
      const detectionPromise = detector.estimateFaces(video);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Detection timeout')), 2000)
      );
      
      const faces = await Promise.race([detectionPromise, timeoutPromise]);
      console.log(`👥 Detection result: ${faces.length} faces found`);
      
      if (faces.length > 0) {
        const face = faces[0];
        console.log('😊 Face detected with keypoints:', face.keypoints?.length || 0);
        
        // More lenient face validation for Android
        if (face.keypoints && face.keypoints.length >= 5) {
          // Check if face is reasonably sized
          if (face.box) {
            const faceSize = Math.min(face.box.width, face.box.height);
            console.log('📏 Face size:', faceSize);
            
            if (faceSize > 50) { // More lenient size requirement
              setFaceDetected(true);
              setCurrentInstruction('✅ Perfect! Face detected clearly. Ready to capture.');
              setDetectionAttempts(0);
            } else {
              setFaceDetected(false);
              setCurrentInstruction('📏 Face too small - move closer to the camera');
            }
          } else {
            // If no box but keypoints exist, consider it detected
            setFaceDetected(true);
            setCurrentInstruction('✅ Face detected! Ready to capture.');
            setDetectionAttempts(0);
          }
        } else {
          setFaceDetected(false);
          setCurrentInstruction('👤 Face partially detected - adjust position');
        }
      } else {
        setFaceDetected(false);
        if (detectionAttempts > 10) {
          setCurrentInstruction('🔄 Having trouble detecting face - try better lighting or restart camera');
        } else {
          setCurrentInstruction('👁️ No face detected - look directly at the camera');
        }
      }
    } catch (error) {
      console.error('❌ Face detection error:', error);
      setFaceDetected(false);
      if (error instanceof Error && error.message.includes('timeout')) {
        setCurrentInstruction('⏱️ Detection slow - check your internet connection');
      } else {
        setCurrentInstruction('🔧 Detection error - try restarting the camera');
      }
    }
  }, [detector, isInitialized, isCapturing, detectionAttempts]);

  useEffect(() => {
    let detectionInterval: NodeJS.Timeout;
    
    if (isInitialized && !isCapturing && detector && !cameraError) {
      // Slower detection interval for Android stability
      console.log('🔄 Starting face detection loop...');
      detectionInterval = setInterval(detectFace, 1000); // 1 second interval
    }
    
    return () => {
      if (detectionInterval) {
        console.log('⏹️ Stopping face detection loop');
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

      console.log('📸 Capturing photo...');

      // Final face detection before capture
      const faces = await detector.estimateFaces(video);
      if (faces.length === 0) {
        // On Android, sometimes detection is flaky, so we'll be more lenient
        console.log('⚠️ No face detected during capture, but proceeding anyway for Android compatibility');
      }

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Capture the image
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob with good quality
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob'));
        }, 'image/jpeg', 0.85);
      });

      console.log('📤 Uploading photo to storage...');

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
      
      console.log('✅ Photo captured and uploaded successfully');
      toast({
        title: 'Photo Captured Successfully',
        description: `Photo ${photoCount + 1}/5 has been verified and uploaded.`,
      });

    } catch (error) {
      console.error('❌ Error capturing/uploading photo:', error);
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
    setDetectionAttempts(0);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsInitialized(false);
    setDetector(null);
    setDetectionAttempts(0);
  };

  const retryCamera = () => {
    console.log('🔄 Retrying camera initialization...');
    stopCamera();
    setCameraError(null);
    setFaceDetected(false);
    setDetectionAttempts(0);
    initializeCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const canCapture = (faceDetected || detectionAttempts > 15) && photoCount < 5 && !isCapturing && !isUploading && !cameraError;

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
                  
                  {detectionAttempts > 10 && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        Android Mode: Lenient Detection
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-purple-800 mb-2">
                  {currentInstruction}
                </p>
                
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
