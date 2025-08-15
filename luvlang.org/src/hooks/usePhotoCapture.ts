
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const usePhotoCapture = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  const isProduction = process.env.NODE_ENV === 'production';

  const logCapture = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel} CAPTURE: ${message}`, data || '');
  };

  const validateInputs = (
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
  ): boolean => {
    if (!videoRef.current || !canvasRef.current || !user) {
      logCapture('Validation failed', {
        hasVideo: !!videoRef.current,
        hasCanvas: !!canvasRef.current,
        hasUser: !!user
      });
      return false;
    }

    if (photoCount >= 5) {
      logCapture('Photo limit reached', { photoCount });
      return false;
    }

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      logCapture('Invalid video dimensions', {
        width: video.videoWidth,
        height: video.videoHeight
      });
      return false;
    }

    return true;
  };

  const capturePhotoFromVideo = async (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        logCapture('Capturing frame', {
          canvasSize: `${canvas.width}x${canvas.height}`,
          videoSize: `${video.videoWidth}x${video.videoHeight}`
        });

        // Draw the current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob with quality settings
        canvas.toBlob(
          (blob) => {
            if (blob) {
              logCapture('Photo captured successfully', {
                size: blob.size,
                type: blob.type
              });
              resolve(blob);
            } else {
              reject(new Error('Failed to create image blob'));
            }
          },
          'image/jpeg',
          0.85 // Quality setting
        );
      } catch (error) {
        logCapture('Photo capture error', error);
        reject(error);
      }
    });
  };

  const uploadPhotoToStorage = async (blob: Blob): Promise<string> => {
    try {
      const timestamp = Date.now();
      const filename = `${user!.id}/${timestamp}_photo_${photoCount + 1}.jpg`;

      logCapture('Uploading to storage', { filename, size: blob.size });

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        logCapture('Upload failed', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);

      logCapture('Upload successful', { publicUrl });
      return publicUrl;
    } catch (error) {
      logCapture('Storage upload error', error);
      throw error;
    }
  };

  const updateUserProfile = async (photoUrl: string): Promise<void> => {
    try {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('photo_urls')
        .eq('user_id', user!.id)
        .maybeSingle();

      const currentPhotos = currentProfile?.photo_urls || [];
      const updatedPhotos = [...currentPhotos, photoUrl];

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user!.id,
          email: user!.email || '',
          photo_urls: updatedPhotos
        });

      if (updateError) {
        logCapture('Profile update failed', updateError);
        throw updateError;
      }

      logCapture('Profile updated successfully', { photosCount: updatedPhotos.length });
    } catch (error) {
      logCapture('Profile update error', error);
      throw error;
    }
  };

  const captureAndUploadPhoto = useCallback(async (
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
  ) => {
    if (!validateInputs(videoRef, canvasRef)) {
      toast({
        title: 'Cannot Capture',
        description: 'Camera not ready or user not authenticated.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    logCapture('Starting capture process', { photoCount: photoCount + 1 });

    try {
      const video = videoRef.current!;
      const canvas = canvasRef.current!;

      // Step 1: Capture photo from video
      const blob = await capturePhotoFromVideo(video, canvas);
      
      // Step 2: Upload to storage
      const publicUrl = await uploadPhotoToStorage(blob);
      
      // Step 3: Update user profile
      await updateUserProfile(publicUrl);

      setPhotoCount(prev => prev + 1);
      
      toast({
        title: 'Photo Captured Successfully',
        description: `Photo ${photoCount + 1}/5 has been verified and uploaded.`,
      });

      logCapture('Capture process completed successfully');

    } catch (error: any) {
      logCapture('Capture process failed', error);
      
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to capture or upload photo.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  }, [user, photoCount]);

  return {
    isUploading,
    photoCount,
    captureAndUploadPhoto
  };
};
