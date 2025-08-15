
export const checkCameraSupport = (): boolean => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const logToConsole = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
  };

  logToConsole('Checking camera support...');
  
  if (!navigator.mediaDevices) {
    logToConsole('navigator.mediaDevices not available');
    return false;
  }
  
  if (!navigator.mediaDevices.getUserMedia) {
    logToConsole('getUserMedia not available');
    return false;
  }
  
  logToConsole('Camera support confirmed');
  return true;
};

export const waitForVideoElement = async (
  videoRef: React.RefObject<HTMLVideoElement>,
  maxWaitTime = 5000
): Promise<HTMLVideoElement> => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const logToConsole = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
  };

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      if (videoRef.current) {
        logToConsole('Video element found', { 
          readyState: videoRef.current.readyState,
          currentTime: Date.now() - startTime 
        });
        resolve(videoRef.current);
        return;
      }
      
      if (Date.now() - startTime > maxWaitTime) {
        logToConsole('Video element wait timeout');
        reject(new Error('Video element not available after waiting'));
        return;
      }
      
      setTimeout(checkElement, 100);
    };
    
    checkElement();
  });
};
