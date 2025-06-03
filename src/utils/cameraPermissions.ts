
export const requestCameraPermission = async (): Promise<MediaStream> => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const logToConsole = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
  };

  logToConsole('Starting camera permission request...');
  
  try {
    const constraints = {
      video: {
        width: { ideal: 640, min: 320 },
        height: { ideal: 480, min: 240 },
        facingMode: 'user'
      }
    };

    logToConsole('Calling getUserMedia with constraints:', constraints);
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    logToConsole('Camera permission granted successfully', { 
      tracks: stream.getVideoTracks().length,
      active: stream.active
    });
    
    if (stream.getVideoTracks().length === 0) {
      throw new Error('No video tracks in stream');
    }
    
    return stream;
  } catch (error: any) {
    logToConsole('Camera permission failed', error);
    
    let userMessage = 'Camera access failed: ';
    if (error.name === 'NotAllowedError') {
      userMessage += 'Permission denied. Please allow camera access and try again.';
    } else if (error.name === 'NotFoundError') {
      userMessage += 'No camera found. Please check your device has a camera.';
    } else if (error.name === 'NotReadableError') {
      userMessage += 'Camera is being used by another application. Please close other apps and try again.';
    } else if (error.name === 'OverconstrainedError') {
      userMessage += 'Camera constraints not supported. Trying with basic settings...';
      try {
        const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
        logToConsole('Basic camera access successful');
        return basicStream;
      } catch (basicError) {
        logToConsole('Basic camera access also failed', basicError);
        throw new Error('Camera not accessible with any settings');
      }
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

  logToConsole('Setting up video element...');
  
  return new Promise(async (resolve, reject) => {
    try {
      if (!videoRef.current) {
        reject(new Error('Video element not available'));
        return;
      }

      const video = videoRef.current;
      video.srcObject = stream;
      
      const timeoutId = setTimeout(() => {
        logToConsole('Video setup timeout after 10 seconds');
        reject(new Error('Video setup timeout - camera may not be responding'));
      }, 10000);

      const onLoadedData = () => {
        clearTimeout(timeoutId);
        logToConsole('Video data loaded successfully', {
          width: video.videoWidth,
          height: video.videoHeight,
          readyState: video.readyState
        });
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          const error = 'Invalid video dimensions - camera may not be working';
          logToConsole(error);
          reject(new Error(error));
          return;
        }
        
        video.removeEventListener('loadeddata', onLoadedData);
        video.removeEventListener('error', onVideoError);
        resolve();
      };

      const onVideoError = (event: Event) => {
        clearTimeout(timeoutId);
        const error = 'Video playback failed';
        logToConsole(error, event);
        video.removeEventListener('loadeddata', onLoadedData);
        video.removeEventListener('error', onVideoError);
        reject(new Error(error));
      };

      video.addEventListener('loadeddata', onLoadedData);
      video.addEventListener('error', onVideoError);

      video.play().catch((playError) => {
        clearTimeout(timeoutId);
        logToConsole('Video play failed', playError);
        video.removeEventListener('loadeddata', onLoadedData);
        video.removeEventListener('error', onVideoError);
        reject(new Error('Video play failed: ' + playError.message));
      });
    } catch (error) {
      logToConsole('Video element setup failed', error);
      reject(error);
    }
  });
};
