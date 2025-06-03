
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxPhotos = 5;

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start camera with proper error handling
  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      console.log('✅ Camera stream obtained');
      setStream(mediaStream);

      // Wait for video element to be ready
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for metadata to load, then play
        videoRef.current.onloadedmetadata = () => {
          console.log('📐 Video metadata loaded');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('▶️ Video playing');
                setCameraStarted(true);
              })
              .catch((playError) => {
                console.error('❌ Video play failed:', playError);
                toast({
                  title: 'Video Error',
                  description: 'Failed to start video playback.',
                  variant: 'destructive'
                });
              });
          }
        };
      } else {
        throw new Error('Video element not available');
      }

    } catch (err: any) {
      console.error('❌ Camera error:', err);
      toast({
        title: 'Camera Error',
        description: err.message || 'Camera access is required to take profile photos.',
        variant: 'destructive'
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraStarted(false);
    console.log('🛑 Camera stopped');
  };

  // Take photo function with improved error handling
  const takePhoto = async () => {
    if (photoCount >= maxPhotos) {
      toast({
        title: 'Photo Limit Reached',
        description: 'You can only upload up to 5 photos.',
        variant: 'destructive'
      });
      return;
    }

    if (!videoRef.current || !user) {
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
      
      // Validate video dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('Video not ready - invalid dimensions');
      }

      console.log(`📸 Taking photo ${photoCount + 1}...`);
      
      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      ctx.drawImage(video, 0, 0);

      // Compress the image by resizing
      const resizedCanvas = document.createElement('canvas');
      const scale = 0.4; // Compress size ~40%
      resizedCanvas.width = canvas.width * scale;
      resizedCanvas.height = canvas.height * scale;

      const resizedCtx = resizedCanvas.getContext('2d');
      if (!resizedCtx) {
        throw new Error('Resized canvas context not available');
      }
      
      resizedCtx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);

      // Convert to blob for upload
      const blob = await new Promise<Blob>((resolve, reject) => {
        resizedCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          0.8 // 80% quality
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
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);

      console.log('🔗 Public URL:', publicUrl);

      // Update user profile with new photo
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
        throw updateError;
      }

      // Update local state
      setPhotos(updatedPhotos);
      setPhotoCount(photoCount + 1);
      
      console.log('✅ Photo uploaded successfully');
      toast({
        title: 'Photo Captured!',
        description: `Photo ${photoCount + 1}/5 uploaded successfully.`,
      });

    } catch (error: any) {
      console.error('💥 Upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload photo.',
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

      if (error) throw error;

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
        description: 'Failed to remove photo.',
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
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
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
