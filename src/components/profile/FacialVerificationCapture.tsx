
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Bug } from 'lucide-react';
import { useCameraSetup } from '@/hooks/useCameraSetup';
import { useFaceDetectionLoop } from '@/hooks/useFaceDetectionLoop';
import { usePhotoCapture } from '@/hooks/usePhotoCapture';
import CameraDisplay from './CameraDisplay';
import PhotoCaptureSection from './PhotoCaptureSection';
import FaceDetectionTest from '../debug/FaceDetectionTest';

const FacialVerificationCapture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTestMode, setShowTestMode] = useState(false);

  const { videoRef, status, model, stream, startCamera, stopCamera } = useCameraSetup();
  const { isUploading, photoCount, captureAndUploadPhoto } = usePhotoCapture();
  
  const { faceDetected, currentInstruction, detectionAttempts, resetDetection, startSimpleDetectionLoop } = useFaceDetectionLoop(
    model, 
    videoRef, 
    isUploading
  );

  const handleCapturePhoto = () => {
    captureAndUploadPhoto(videoRef, canvasRef);
  };

  const handleStartCamera = async () => {
    await startCamera();
    if (model) {
      startSimpleDetectionLoop(model);
    }
  };

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
                onClick={handleStartCamera} 
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
              onReset={resetDetection}
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
