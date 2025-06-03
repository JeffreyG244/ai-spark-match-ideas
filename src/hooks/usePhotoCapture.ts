
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { capturePhotoFromVideo, uploadPhotoToStorage, updateUserProfile } from '@/utils/photoCapture';

export const usePhotoCapture = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  const captureAndUploadPhoto = useCallback(async (
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
  ) => {
    if (!videoRef.current || !canvasRef.current || !user) {
      toast({
        title: 'Cannot Capture',
        description: 'Camera not ready or user not authenticated.',
        variant: 'destructive'
      });
      return;
    }

    if (photoCount >= 5) {
      toast({
        title: 'Photo Limit Reached',
        description: 'Maximum of 5 photos allowed.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      console.log('📸 MAIN: Capturing photo...');
      const blob = await capturePhotoFromVideo(video, canvas);
      
      console.log('📤 MAIN: Uploading photo to storage...');
      const publicUrl = await uploadPhotoToStorage(user.id, photoCount, blob);
      await updateUserProfile(user.id, user.email || '', publicUrl);

      setPhotoCount(prev => prev + 1);
      
      toast({
        title: 'Photo Captured Successfully',
        description: `Photo ${photoCount + 1}/5 has been verified and uploaded.`,
      });

    } catch (error) {
      console.error('❌ MAIN: Error capturing/uploading photo:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to capture or upload photo.',
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
