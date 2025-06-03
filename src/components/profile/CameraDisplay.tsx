
import React from 'react';
import CameraStatus from './CameraStatus';

interface CameraDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  faceDetected: boolean;
  detectionAttempts: number;
  currentInstruction: string;
}

const CameraDisplay: React.FC<CameraDisplayProps> = ({
  videoRef,
  canvasRef,
  faceDetected,
  detectionAttempts,
  currentInstruction
}) => {
  return (
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
  );
};

export default CameraDisplay;
