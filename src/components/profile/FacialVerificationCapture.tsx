
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

  const initializeCamera = useCallback(async () => {
    try {
      console.log('Initializing camera and TensorFlow.js...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }

      // Initialize TensorFlow.js backends
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('TensorFlow.js ready with backend:', tf.getBackend());
      
      // Load face landmarks detection model
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs' as const,
        refineLandmarks: true,
        maxFaces: 1
      };
      
      console.log('Loading face detection model...');
      const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      setDetector(faceDetector);
      setIsInitialized(true);
      
      toast({
        title: 'Camera Initialized',
        description: 'Face detection is ready. You can now capture photos.',
      });
    } catch (error) {
      console.error('Error initializing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera or initialize face detection. Please check permissions.',
        variant: 'destructive'
      });
    }
  }, []);

  const detectFace = useCallback(async () => {
    if (!detector || !videoRef.current || !isInitialized) return;

    try {
      const faces = await detector.estimateFaces(videoRef.current);
      
      if (faces.length > 0) {
        setFaceDetected(true);
        setCurrentInstruction('Face detected! You can now capture photos.');
      } else {
        setFaceDetected(false);
        setCurrentInstruction('Please position your face in the camera');
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  }, [detector, isInitialized]);

  useEffect(() => {
    if (isInitialized && !isCapturing) {
      const interval = setInterval(detectFace, 100);
      return () => clearInterval(interval);
    }
  }, [detectFace, isInitialized, isCapturing]);

  const captureAndUploadPhoto = async () => {
    if (!faceDetected || !detector || !videoRef.current || !canvasRef.current || !user) {
      toast({
        title: 'Cannot Capture',
        description: 'Face not detected or camera not ready.',
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

      // Get face detection for cropping
      const faces = await detector.estimateFaces(video);
      if (faces.length === 0) throw new Error('No face detected during capture');

      const face = faces[0];
      const box = face.box;
      
      // Add padding around face
      const padding = 50;
      const cropX = Math.max(0, box.xMin - padding);
      const cropY = Math.max(0, box.yMin - padding);
      const cropWidth = Math.min(video.videoWidth - cropX, box.width + 2 * padding);
      const cropHeight = Math.min(video.videoHeight - cropY, box.height + 2 * padding);

      // Set canvas size to cropped dimensions
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw cropped face to canvas
      ctx.drawImage(
        video,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      // Convert to compressed JPEG blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.7);
      });

      // Generate timestamped filename
      const timestamp = Date.now();
      const filename = `${user.id}/${timestamp}_photo_${photoCount + 1}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);

      // Update user profile with new photo URL
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
        title: 'Photo Uploaded Successfully',
        description: `Photo ${photoCount + 1}/5 has been verified and uploaded.`,
      });

    } catch (error) {
      console.error('Error capturing/uploading photo:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to capture or upload photo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCapturing(false);
      setIsUploading(false);
    }
  };

  const resetVerification = () => {
    setCurrentInstruction('Look straight at the camera');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const canCapture = faceDetected && photoCount < 5;

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-purple-600" />
          Facial Verification Photos ({photoCount}/5)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isInitialized ? (
          <div className="text-center">
            <Button onClick={initializeCamera} className="bg-purple-600 hover:bg-purple-700">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
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

                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={captureAndUploadPhoto}
                    disabled={!canCapture || isUploading}
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
                        Capture & Upload Photo
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
                </div>
              </div>

              {photoCount > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-green-700">
                    {photoCount}/5 verified photos uploaded
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
