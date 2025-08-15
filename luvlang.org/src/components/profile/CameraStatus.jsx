import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
const CameraStatus = ({ faceDetected, detectionAttempts, currentInstruction }) => {
    return (<>
      <div className="absolute top-2 left-2 right-2">
        <Badge variant={faceDetected ? "default" : "destructive"} className="mb-2">
          {faceDetected ? (<><CheckCircle className="h-3 w-3 mr-1"/> Face Detected</>) : (<><AlertCircle className="h-3 w-3 mr-1"/> No Face</>)}
        </Badge>
        
        {detectionAttempts > 10 && (<div className="mt-1">
            <Badge variant="outline" className="text-xs">
              Android Mode: Lenient Detection
            </Badge>
          </div>)}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-purple-800 mb-2">
          {currentInstruction}
        </p>
      </div>
    </>);
};
export default CameraStatus;
