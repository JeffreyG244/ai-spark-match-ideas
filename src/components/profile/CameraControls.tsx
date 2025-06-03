
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, RotateCcw } from 'lucide-react';

interface CameraControlsProps {
  canCapture: boolean;
  isUploading: boolean;
  onCapture: () => void;
  onReset: () => void;
  onRestart: () => void;
  detectionAttempts: number;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  canCapture,
  isUploading,
  onCapture,
  onReset,
  onRestart,
  detectionAttempts
}) => {
  return (
    <div className="text-center">
      {detectionAttempts > 10 && (
        <p className="text-xs text-gray-600 mb-4">
          💡 Having trouble? Try: better lighting, different angle, or click capture anyway
        </p>
      )}

      <div className="flex gap-2 justify-center flex-wrap">
        <Button
          onClick={onCapture}
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

        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>

        <Button variant="outline" onClick={onRestart}>
          <Camera className="h-4 w-4 mr-2" />
          Restart Camera
        </Button>
      </div>
    </div>
  );
};

export default CameraControls;
