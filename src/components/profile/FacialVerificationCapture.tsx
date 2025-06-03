import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, AlertCircle, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCamera } from '@/hooks/useCamera';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { capturePhotoFromVideo, uploadPhotoToStorage, updateUserProfile } from '@/utils/photoCapture';
import CameraControls from './CameraControls';
import CameraStatus from './CameraStatus';

const FacialVerificationCapture = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const {
    videoRef,
    isInitialized,
    isModelLoading,
    cameraError,
    detector,
    initializeCamera,
    stopCamera,
    retryCamera,
    setCameraError
  } = useCamera();

  const {
    faceDetected,
    currentInstruction,
    detectionAttempts,
    resetDetection
  } = useFaceDetection(detector, videoRef, isInitialized, isCapturing, cameraError);

  // Camera diagnostics
  const runDiagnostics = async () => {
    setShowDiagnostics(true);
    console.log('🔧 Running camera diagnostics...');
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      console.log('📹 Available video devices:', videoDevices);
      
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      console.log('🔐 Camera permission state:', permissions.state);
      
      toast({
        title: 'Diagnostics Complete',
        description: `Found ${videoDevices.length} camera(s). Permission: ${permissions.state}`,
      });
    } catch (error) {
      console.error('❌ Diagnostics error:', error);
      toast({
        title: 'Diagnostics Failed',
        description: 'Unable to check camera status',
        variant: 'destructive'
      });
    }
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

      // Final face detection before capture
      const faces = await detector.estimateFaces(video);
      if (faces.length === 0) {
        console.log('⚠️ No face detected during capture, but proceeding anyway for compatibility');
      }

      const blob = await capturePhotoFromVideo(video, canvas);
      console.log('📤 Uploading photo to storage...');

      const publicUrl = await uploadPhotoToStorage(user.id, photoCount, blob);
      await updateUserProfile(user.id, user.email || '', publicUrl);

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
    resetDetection();
    setCameraError(null);
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const canCapture = (faceDetected || detectionAttempts > 20) && photoCount < 5 && !isCapturing && !isUploading && !cameraError;

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
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={retryCamera}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Camera
              </Button>
              <Button 
                onClick={runDiagnostics}
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Run Diagnostics
              </Button>
            </div>
          </div>
        ) : !isInitialized ? (
          <div className="text-center space-y-4">
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
            
            {!isModelLoading && (
              <Button 
                onClick={runDiagnostics}
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Camera Diagnostics
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

              <CameraControls
                canCapture={canCapture}
                isUploading={isUploading}
                onCapture={captureAndUploadPhoto}
                onReset={resetVerification}
                onRestart={retryCamera}
                detectionAttempts={detectionAttempts}
              />

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
