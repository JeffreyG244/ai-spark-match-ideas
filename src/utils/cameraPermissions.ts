
export const requestCameraPermission = async (): Promise<MediaStream> => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const logToConsole = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
  };

  logToConsole('🧪 SIMPLE: Requesting camera...');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    logToConsole('✅ SIMPLE: Camera stream OK');
    return stream;
  } catch (error: any) {
    logToConsole('❌ SIMPLE: Camera permission failed', error);
    
    let userMessage = 'Camera access failed: ';
    if (error.name === 'NotAllowedError') {
      userMessage += 'Permission denied. Please allow camera access and try again.';
    } else if (error.name === 'NotFoundError') {
      userMessage += 'No camera found. Please check your device has a camera.';
    } else if (error.name === 'NotReadableError') {
      userMessage += 'Camera is being used by another application. Please close other apps and try again.';
    } else {
      userMessage += error.message || 'Unknown camera error';
    }
    
    throw new Error(userMessage);
  }
};

export const setupVideo = async (
  stream: MediaStream,
  videoRef: React.RefObject<HTMLVideoElement>
): Promise<void> => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const logToConsole = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
  };

  logToConsole('🧪 SIMPLE: Setting up video...');
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      logToConsole('❌ SIMPLE: Video setup timeout');
      reject(new Error('Video setup timeout'));
    }, 5000);

    const checkVideo = () => {
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
          logToConsole('✅ SIMPLE: Video metadata loaded');
          logToConsole('📐 SIMPLE: Video dimensions:', video.videoWidth, 'x', video.videoHeight);
          clearTimeout(timeoutId);
          resolve();
        };
        
        video.onerror = (error) => {
          logToConsole('❌ SIMPLE: Video error', error);
          clearTimeout(timeoutId);
          reject(new Error('Video playback failed'));
        };
        
        video.play().catch((playError) => {
          logToConsole('❌ SIMPLE: Video play failed', playError);
          clearTimeout(timeoutId);
          reject(new Error('Video play failed: ' + playError.message));
        });
      } else {
        setTimeout(checkVideo, 100);
      }
    };

    checkVideo();
  });
};
