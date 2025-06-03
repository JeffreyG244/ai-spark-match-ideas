
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
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

  // Simple DOM-ready approach like vanilla JS
  const startCamera = async () => {
    if (isStartingCamera || !user) {
      console.log('⚠️ Camera start blocked - already starting or no user');
      return;
    }

    console.log('🎥 Starting camera process...');
    setIsStartingCamera(true);
    
    try {
      // Check browser support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Get camera permission first
      console.log('📷 Requesting camera permission...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      console.log('✅ Camera permission granted');

      // Wait for video element to be ready in DOM (simple check)
      if (!videoRef.current) {
        throw new Error('Video element not found in DOM');
      }

      const video = videoRef.current;
      setStream(mediaStream);

      // Set up video with promise-based approach
      await new Promise<void>((resolve, reject) => {
        let resolved = false;
        
        const handleSuccess = () => {
          if (resolved) return;
          resolved = true;
          console.log('✅ Video setup completed');
          setCameraStarted(true);
          cleanup();
          resolve();
        };

        const handleError = (error: string) => {
          if (resolved) return;
          resolved = true;
          console.error('❌ Video setup failed:', error);
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
            height: video.videoHeight
          });
        };

        const onCanPlay = () => {
          console.log('▶️ Video ready to play');
          video.play()
            .then(() => {
              console.log('🎬 Video playing successfully');
              handleSuccess();
            })
            .catch((playError) => {
              console.error('❌ Video play error:', playError);
              handleError(`Video play failed: ${playError.message}`);
            });
        };

        const onVideoError = () => {
          console.error('❌ Video element error');
          handleError('Video element error occurred');
        };

        // Add event listeners
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('error', onVideoError);
        
        // Set stream and load
        console.log('🔗 Connecting stream to video...');
        video.srcObject = mediaStream;
        video.load();
        
        // Timeout fallback
        setTimeout(() => {
          if (!resolved) {
            handleError('Video setup timeout after 10 seconds');
          }
        }, 10000);
      });

    } catch (err: any) {
      console.error('💥 Camera setup failed:', err);
      
      // Clean up stream if created
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

  // Stop camera
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
    console.log('✅ Camera stopped');
  };

  // Take photo
  const takePhoto = async () => {
    if (photoCount >= maxPhotos) {
      toast({
        title: 'Photo Limit Reached',
        description: 'You can only upload up to 5 photos.',
        variant: 'destructive'
      });
      return;
    }

    if (!videoRef.current || !user || !stream || !cameraStarted) {
      console.error('❌ Prerequisites not met for photo capture');
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
      
      // Check video state
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('Video not ready for capture');
      }

      console.log(`📸 Taking photo ${photoCount + 1}...`);
      
      // Create canvas and capture
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Cannot get canvas context');
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Resize for compression
      const resizedCanvas = document.createElement('canvas');
      const resizedCtx = resizedCanvas.getContext('2d');
      
      if (!resizedCtx) {
        throw new Error('Cannot get resized canvas context');
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

      // Upload to Supabase
      const timestamp = Date.now();
      const filename = `${user.id}/${timestamp}_photo_${photoCount + 1}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);

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
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      // Update local state
      setPhotos(updatedPhotos);
      setPhotoCount(photoCount + 1);
      
      console.log('✅ Photo captured successfully');
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

  // Remove photo
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
              disabled={isStartingCamera || !user}
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
            {!user && (
              <p className="text-sm text-red-600">
                Please log in to take photos
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
