
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxPhotos = 5;

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        console.log('🧹 Cleaning up camera stream on unmount');
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Wait for video element to be ready
  const waitForVideoElement = (): Promise<HTMLVideoElement> => {
    return new Promise((resolve, reject) => {
      const checkVideo = () => {
        if (videoRef.current) {
          console.log('✅ Video element found');
          resolve(videoRef.current);
        } else {
          console.log('⏳ Waiting for video element...');
          setTimeout(checkVideo, 100);
        }
      };
      
      // Start checking immediately
      checkVideo();
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Video element not available after 5 seconds'));
      }, 5000);
    });
  };

  // Start camera with proper error handling and timing
  const startCamera = async () => {
    if (isStartingCamera) {
      console.log('⚠️ Camera start already in progress');
      return;
    }

    setIsStartingCamera(true);
    
    try {
      console.log('🎥 Starting camera process...');
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Step 1: Wait for video element to be available
      console.log('🔍 Waiting for video element...');
      const video = await waitForVideoElement();
      
      // Step 2: Request camera permission and get stream
      console.log('🎥 Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      console.log('✅ Camera stream obtained');
      setStream(mediaStream);

      // Step 3: Set up video element with proper event handling
      return new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onVideoError);
        };

        const onLoadedMetadata = () => {
          console.log('📐 Video metadata loaded:', {
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState
          });
          
          // Play the video
          video.play()
            .then(() => {
              console.log('▶️ Video playing successfully');
              setCameraStarted(true);
              cleanup();
              resolve();
            })
            .catch((playError) => {
              console.error('❌ Video play failed:', playError);
              cleanup();
              reject(new Error(`Video play failed: ${playError.message}`));
            });
        };

        const onVideoError = (error: Event) => {
          console.error('❌ Video error:', error);
          cleanup();
          reject(new Error('Video element error'));
        };

        // Add event listeners
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('error', onVideoError);
        
        // Set the stream
        video.srcObject = mediaStream;
        
        // Timeout fallback
        setTimeout(() => {
          if (!cameraStarted) {
            cleanup();
            reject(new Error('Video setup timeout'));
          }
        }, 10000);
      });

    } catch (err: any) {
      console.error('❌ Camera setup error:', err);
      
      // Clean up stream if it was created
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      toast({
        title: 'Camera Error',
        description: err.message || 'Failed to access camera. Please check permissions.',
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
      // Remove any lingering event listeners
      videoRef.current.removeEventListener('loadedmetadata', () => {});
      videoRef.current.removeEventListener('error', () => {});
    }
    
    setCameraStarted(false);
    console.log('✅ Camera stopped successfully');
  };

  // Take photo function with improved validation and error handling
  const takePhoto = async () => {
    if (photoCount >= maxPhotos) {
      toast({
        title: 'Photo Limit Reached',
        description: 'You can only upload up to 5 photos.',
        variant: 'destructive'
      });
      return;
    }

    if (!videoRef.current || !user || !stream) {
      console.error('❌ Prerequisites not met:', {
        hasVideo: !!videoRef.current,
        hasUser: !!user,
        hasStream: !!stream
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
      
      // Validate video state
      if (video.readyState < 2) {
        throw new Error('Video not ready - insufficient metadata');
      }
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('Invalid video dimensions');
      }

      console.log(`📸 Taking photo ${photoCount + 1}...`, {
        videoSize: `${video.videoWidth}x${video.videoHeight}`,
        readyState: video.readyState
      });
      
      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Cannot get canvas 2D context');
      }
      
      ctx.drawImage(video, 0, 0);

      // Compress the image
      const resizedCanvas = document.createElement('canvas');
      const scale = 0.4;
      resizedCanvas.width = canvas.width * scale;
      resizedCanvas.height = canvas.height * scale;

      const resizedCtx = resizedCanvas.getContext('2d');
      if (!resizedCtx) {
        throw new Error('Cannot get resized canvas 2D context');
      }
      
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
              disabled={isStartingCamera}
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <Camera className="h-4 w-4 mr-2" />
              {isStartingCamera ? 'Starting Camera...' : 'Start Camera'}
            </Button>
            {isStartingCamera && (
              <p className="text-sm text-gray-600">
                Please allow camera access when prompted
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
