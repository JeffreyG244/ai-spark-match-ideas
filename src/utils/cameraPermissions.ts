
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
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      logToConsole('Video setup timeout after 10 seconds');
      reject(new Error('Video setup timeout - video element not available'));
    }, 10000);

    const checkVideoElement = () => {
      if (videoRef.current) {
        const video = videoRef.current;
        logToConsole('Video element found, setting up...', {
          readyState: video.readyState,
          width: video.clientWidth,
          height: video.clientHeight
        });

        // Set up the video source
        video.srcObject = stream;

        // Handle video metadata loaded
        const onLoadedMetadata = () => {
          logToConsole('Video metadata loaded', {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
          });
          
          if (video.videoWidth === 0 || video.videoHeight === 0) {
            clearTimeout(timeoutId);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onVideoError);
            reject(new Error('Invalid video dimensions - camera may not be working'));
            return;
          }
          
          clearTimeout(timeoutId);
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onVideoError);
          logToConsole('Video setup completed successfully');
          resolve();
        };

        const onVideoError = (event: Event) => {
          clearTimeout(timeoutId);
          const error = 'Video playback failed';
          logToConsole(error, event);
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onVideoError);
          reject(new Error(error));
        };

        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('error', onVideoError);

        // Start playing the video
        video.play().catch((playError) => {
          clearTimeout(timeoutId);
          logToConsole('Video play failed', playError);
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onVideoError);
          reject(new Error('Video play failed: ' + playError.message));
        });
      } else {
        // Video element not ready yet, check again in 100ms
        setTimeout(checkVideoElement, 100);
      }
    };

    // Start checking for video element
    checkVideoElement();
  });
};
