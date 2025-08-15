import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
const SecurityStatus = ({ sessionValid, deviceTrusted }) => {
    return (<>
      {!sessionValid && (<Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>
            Your session appears to be invalid or expired. Please refresh the page or log in again.
          </AlertDescription>
        </Alert>)}
      
      {!deviceTrusted && (<Alert variant="default" className="mb-4">
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>
            This device hasn't been verified. Using features may be limited.
          </AlertDescription>
        </Alert>)}
    </>);
};
export default SecurityStatus;
