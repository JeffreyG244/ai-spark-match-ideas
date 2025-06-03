
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Bug, AlertTriangle, RefreshCw } from 'lucide-react';
import { useCameraSetup } from '@/hooks/useCameraSetup';
import { useFaceDetectionLoop } from '@/hooks/useFaceDetectionLoop';
import { usePhotoCapture } from '@/hooks/usePhotoCapture';
import CameraDisplay from './CameraDisplay';
import PhotoCaptureSection from './PhotoCaptureSection';
import FaceDetectionTest from '../debug/FaceDetectionTest';

const FacialVerificationCapture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTestMode, setShowTestMode] = useState(false);

  const { 
    videoRef, 
    status, 
    model, 
    stream, 
    error,
    isRetrying,
    startCamera, 
    stopCamera 
  } = useCameraSetup();

  const { isUploading, photoCount, captureAndUploadPhoto } = usePhotoCapture();
  
  const { 
    faceDetected, 
    currentInstruction, 
    detectionAttempts, 
    resetDetection 
  } = useFaceDetectionLoop(model, videoRef, isUploading);

  const handleCapturePhoto = () => {
    captureAndUploadPhoto(videoRef, canvasRef);
  };

  const handleReset = () => {
    resetDetection();
  };

  const handleRetryCamera = () => {
    stopCamera();
    setTimeout(startCamera, 1000);
  };

  const canCapture = (faceDetected || detectionAttempts > 20) && photoCount < 5 && !isUploading;
  const isRunning = !!stream && !!model && status.includes('✅');

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
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryCamera}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Status Display */}
        <div className="text-sm font-medium p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            {isRetrying && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
            )}
            <span>Status: {status}</span>
          </div>
        </div>

        {!isRunning ? (
          <div className="text-center space-y-4">
            <div className="flex gap-2 justify-center flex-wrap">
              <Button 
                onClick={startCamera} 
                disabled={!!stream || isRetrying}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isRetrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Initializing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => setShowTestMode(true)}
                variant="outline"
                size="sm"
              >
                <Bug className="h-4 w-4 mr-2" />
                Debug Mode
              </Button>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p>✓ Production-ready camera initialization</p>
              <p>✓ Cross-platform compatibility (Android, iOS, Desktop)</p>
              <p>✓ Automatic retry on failure (up to 3 attempts)</p>
              <p>✓ Detailed logging for troubleshooting</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CameraDisplay
              videoRef={videoRef}
              canvasRef={canvasRef}
              faceDetected={faceDetected}
              detectionAttempts={detectionAttempts}
              currentInstruction={currentInstruction}
            />

            <PhotoCaptureSection
              canCapture={canCapture}
              isUploading={isUploading}
              photoCount={photoCount}
              detectionAttempts={detectionAttempts}
              onCapture={handleCapturePhoto}
              onReset={handleReset}
              onStop={stopCamera}
              onShowTestMode={() => setShowTestMode(true)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FacialVerificationCapture;
