import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, RotateCcw, Camera, Bug } from 'lucide-react';
const PhotoCaptureSection = ({ canCapture, isUploading, photoCount, detectionAttempts, onCapture, onReset, onStop, onShowTestMode }) => {
    return (<div className="text-center">
      {detectionAttempts > 10 && (<p className="text-xs text-gray-600 mb-4">
          💡 Having trouble? Try: better lighting, different angle, or click capture anyway
        </p>)}

      <div className="flex gap-2 justify-center flex-wrap">
        <Button onClick={onCapture} disabled={!canCapture} className="bg-purple-600 hover:bg-purple-700">
          {isUploading ? (<>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
              Uploading...
            </>) : (<>
              <Upload className="h-4 w-4 mr-2"/>
              Capture Photo
            </>)}
        </Button>

        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2"/>
          Reset
        </Button>

        <Button variant="outline" onClick={onStop}>
          <Camera className="h-4 w-4 mr-2"/>
          Stop Camera
        </Button>
      </div>

      {photoCount > 0 && (<div className="mt-4 text-center">
          <p className="text-sm text-green-700">
            {photoCount}/5 verified photos uploaded successfully
          </p>
        </div>)}
      
      <div className="text-center mt-4">
        <Button onClick={onShowTestMode} variant="ghost" size="sm">
          <Bug className="h-4 w-4 mr-2"/>
          Debug Test Mode
        </Button>
      </div>
    </div>);
};
export default PhotoCaptureSection;
