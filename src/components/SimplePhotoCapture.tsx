
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const SimplePhotoCapture = () => {
  const { user } = useAuth();
  const [photoCount, setPhotoCount] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isDOMReady, setIsDOMReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxPhotos = 5;

  // Ensure DOM is ready before any camera operations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDOMReady(true);
      console.log('✅ DOM ready state confirmed');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        console.log('🧹 Cleaning up camera stream on unmount');
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Wait for video element with better DOM readiness checks
  const waitForVideoElement = async (): Promise<HTMLVideoElement> => {
    return new Promise((resolve, reject) => {
      if (!isDOMReady) {
        reject(new Error('DOM not ready'));
        return;
      }

      let attempts = 0;
      const maxAttempts = 30;
      
      const checkVideo = () => {
        attempts++;
        console.log(`🔍 Checking for video element (attempt ${attempts}/${maxAttempts})`);
        
        if (videoRef.current && document.contains(videoRef.current)) {
          console.log('✅ Video element found and in DOM');
          resolve(videoRef.current);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.error('❌ Video element not found after maximum attempts');
          reject(new Error('Video element not available - DOM not ready'));
          return;
        }
        
        setTimeout(checkVideo, 100);
      };
      
      // Use requestAnimationFrame to ensure DOM is painted
      requestAnimationFrame(() => {
        setTimeout(checkVideo, 50);
      });
    });
  };

  // Start camera with proper DOM timing
  const startCamera = async () => {
    if (isStartingCamera) {
      console.log('⚠️ Camera start already in progress');
      return;
    }

    if (!isDOMReady) {
      console.error('❌ DOM not ready for camera start');
      toast({
        title: 'Camera Error',
        description: 'Please wait for the page to fully load and try again.',
        variant: 'destructive'
      });
      return;
    }

    console.log('🎥 Starting camera process...');
    setIsStartingCamera(true);
    
    try {
      // Check browser support first
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Wait for video element first, before requesting camera
      console.log('⏳ Waiting for video element...');
      const video = await waitForVideoElement();
      
      // Now request camera permission
      console.log('📷 Requesting camera permission...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      console.log('✅ Camera permission granted, stream obtained');
      setStream(mediaStream);

      // Set up video with the stream
      await new Promise<void>((resolve, reject) => {
        let resolved = false;
        let timeoutId: NodeJS.Timeout;
        
        const handleSuccess = () => {
          if (resolved) return;
          resolved = true;
          console.log('✅ Video setup completed successfully');
          setCameraStarted(true);
          clearTimeout(timeoutId);
          cleanup();
          resolve();
        };

        const handleError = (error: string) => {
          if (resolved) return;
          resolved = true;
          console.error('❌ Video setup failed:', error);
          clearTimeout(timeoutId);
          cleanup();
          reject(new Error(error));
        };

        const cleanup = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('canplay', onCanPlay);
          video.removeEventListener('error', onVideoError);
        };

        const onLoadedMetadata = () => {
          console.log('📐 Video metadata loaded:', {
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState
          });
        };

        const onCanPlay = () => {
          console.log('▶️ Video can play, starting playback...');
          const playPromise = video.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('🎬 Video playing successfully');
                handleSuccess();
              })
              .catch((playError) => {
                console.error('❌ Video play error:', playError);
                handleError(`Video play failed: ${playError.message}`);
              });
          } else {
            // Older browsers that don't return a promise
            setTimeout(() => {
              if (video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2) {
                handleSuccess();
              } else {
                handleError('Video failed to start playing');
              }
            }, 500);
          }
        };

        const onVideoError = (event: Event) => {
          console.error('❌ Video element error:', event);
          const target = event.target as HTMLVideoElement;
          const errorCode = target.error?.code;
          const errorMessage = target.error?.message || 'Unknown video error';
          handleError(`Video element error: ${errorMessage} (code: ${errorCode})`);
        };

        // Add event listeners
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('error', onVideoError);
        
        // Set the stream and load
        console.log('🔗 Connecting stream to video element...');
        video.srcObject = mediaStream;
        video.load();
        
        // Timeout fallback
        timeoutId = setTimeout(() => {
          if (!resolved) {
            handleError('Video setup timeout - took too long to initialize');
          }
        }, 10000);
      });

    } catch (err: any) {
      console.error('💥 Camera setup failed:', err);
      
      // Clean up stream if it was created
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      let errorMessage = 'Failed to access camera';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsStartingCamera(false);
    }
  };

  // Stop camera with proper cleanup
  const stopCamera = () => {
    console.log('🛑 Stopping camera...');
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Stopped track:', track.kind);
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    
    setCameraStarted(false);
    console.log('✅ Camera stopped successfully');
  };

  // Take photo with comprehensive validation
  const takePhoto = async () => {
    if (photoCount >= maxPhotos) {
      toast({
        title: 'Photo Limit Reached',
        description: 'You can only upload up to 5 photos.',
        variant: 'destructive'
      });
      return;
    }

    if (!videoRef.current || !user || !stream || !cameraStarted || !isDOMReady) {
      console.error('❌ Prerequisites not met:', {
        hasVideo: !!videoRef.current,
        hasUser: !!user,
        hasStream: !!stream,
        cameraStarted,
        isDOMReady
      });
      toast({
        title: 'Error',
        description: 'Camera not ready or user not authenticated.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const video = videoRef.current;
      
      // Comprehensive video validation
      if (video.readyState < 2) {
        throw new Error('Video not ready - insufficient metadata');
      }
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('Invalid video dimensions - camera not properly initialized');
      }

      if (video.paused || video.ended) {
        throw new Error('Video not playing - camera stream interrupted');
      }

      console.log(`📸 Taking photo ${photoCount + 1}...`, {
        videoSize: `${video.videoWidth}x${video.videoHeight}`,
        readyState: video.readyState,
        playing: !video.paused
      });
      
      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Cannot get canvas 2D context - browser compatibility issue');
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Compress the image
      const resizedCanvas = document.createElement('canvas');
      const resizedCtx = resizedCanvas.getContext('2d');
      
      if (!resizedCtx) {
        throw new Error('Cannot get resized canvas 2D context');
      }
      
      const scale = 0.4;
      resizedCanvas.width = canvas.width * scale;
      resizedCanvas.height = canvas.height * scale;
      resizedCtx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        resizedCanvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('📷 Photo blob created:', { size: blob.size, type: blob.type });
              resolve(blob);
            } else {
              reject(new Error('Failed to create image blob'));
            }
          },
          'image/jpeg',
          0.8
        );
      });

      console.log('💾 Uploading to Supabase...');

      // Upload to Supabase storage
      const timestamp = Date.now();
      const filename = `${user.id}/${timestamp}_photo_${photoCount + 1}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);

      console.log('🔗 Public URL generated:', publicUrl);

      // Update user profile
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('photos')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentPhotos = currentProfile?.photos || [];
      const updatedPhotos = [...currentPhotos, publicUrl];

      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          photos: updatedPhotos,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      // Update local state
      setPhotos(updatedPhotos);
      setPhotoCount(photoCount + 1);
      
      console.log('✅ Photo captured and uploaded successfully');
      toast({
        title: 'Photo Captured!',
        description: `Photo ${photoCount + 1}/5 uploaded successfully.`,
      });

    } catch (error: any) {
      console.error('💥 Photo capture failed:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to capture or upload photo.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove photo function
  const removePhoto = async (photoUrl: string, index: number) => {
    if (!user) return;

    try {
      const updatedPhotos = photos.filter(p => p !== photoUrl);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          photos: updatedPhotos,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw new Error(`Remove failed: ${error.message}`);

      setPhotos(updatedPhotos);
      setPhotoCount(updatedPhotos.length);
      
      toast({
        title: 'Photo Removed',
        description: 'Photo has been deleted.',
      });

    } catch (error: any) {
      console.error('❌ Remove photo error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove photo.',
        variant: 'destructive'
      });
    }
  };

  // Load existing photos on mount
  useEffect(() => {
    const loadExistingPhotos = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('photos')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.photos) {
          setPhotos(data.photos);
          setPhotoCount(data.photos.length);
          console.log('📂 Loaded existing photos:', data.photos.length);
        }
      } catch (error) {
        console.error('❌ Error loading photos:', error);
      }
    };

    loadExistingPhotos();
  }, [user]);

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-purple-600" />
          Take 3 to 5 Profile Photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Camera Section */}
        {!cameraStarted ? (
          <div className="text-center space-y-4">
            <Button 
              onClick={startCamera}
              disabled={isStartingCamera || !isDOMReady}
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <Camera className="h-4 w-4 mr-2" />
              {isStartingCamera ? 'Starting Camera...' : 
               !isDOMReady ? 'Loading...' : 'Start Camera'}
            </Button>
            {isStartingCamera && (
              <p className="text-sm text-gray-600">
                Please allow camera access when prompted
              </p>
            )}
            {!isDOMReady && (
              <p className="text-sm text-gray-500">
                Preparing camera interface...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-sm mx-auto rounded-lg border-2 border-purple-200"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>

            <div className="text-center space-y-2">
              <Button
                onClick={takePhoto}
                disabled={isUploading || photoCount >= maxPhotos}
                className="bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    📸 Take Photo
                  </>
                )}
              </Button>
              
              <Button
                onClick={stopCamera}
                variant="outline"
                size="sm"
              >
                Stop Camera
              </Button>
            </div>
          </div>
        )}

        {/* Photo Counter */}
        <p className="text-center text-sm text-gray-600">
          Photos taken: {photoCount}/{maxPhotos}
        </p>

        {/* Photos Display */}
        {photos.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-purple-800">Your Photos</h4>
            <div className="flex flex-wrap gap-2">
              {photos.map((photoUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={photoUrl}
                    alt={`Profile photo ${index + 1}`}
                    className="h-20 w-20 object-cover rounded border border-gray-300"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full"
                    onClick={() => removePhoto(photoUrl, index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {photoCount >= 3 && (
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium">
              ✅ Great! You have {photoCount} profile photos uploaded
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default SimplePhotoCapture;
