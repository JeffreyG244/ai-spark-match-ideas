
import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

export const usePhotoUpload = (photos: Photo[], onPhotosChange: (photos: Photo[]) => void) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxPhotos = 6;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files || files.length === 0) {
      toast({
        title: 'No Files Selected',
        description: 'Please select at least one image to upload.',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to upload photos to your profile.',
        variant: 'destructive'
      });
      return;
    }

    if (photos.length + files.length > maxPhotos) {
      toast({
        title: 'Too Many Photos',
        description: `You can only upload up to ${maxPhotos} photos.`,
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const newPhotos: Photo[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid File Type',
            description: `${file.name} is not a valid image file.`,
            variant: 'destructive'
          });
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'File Too Large',
            description: `${file.name} is too large. Maximum size is 5MB.`,
            variant: 'destructive'
          });
          continue;
        }

        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2);
        const filename = `${user.id}/${timestamp}_${randomId}_${file.name}`;

        // Check if bucket exists and handle missing bucket
        const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
        
        if (bucketListError) {
          toast({
            title: 'Storage Error',
            description: 'Unable to access photo storage. Please try again later.',
            variant: 'destructive'
          });
          continue;
        }
        
        const bucketExists = buckets?.some(bucket => bucket.name === 'profile-photos');
        
        if (!bucketExists) {
          // Try to create bucket, but if it fails, show helpful error
          const { error: createError } = await supabase.storage.createBucket('profile-photos', {
            public: true,
            fileSizeLimit: 10 * 1024 * 1024 // 10MB
          });
          
          if (createError) {
            toast({
              title: 'Storage Setup Required',
              description: 'Photo storage is not configured. Please contact support to enable photo uploads.',
              variant: 'destructive'
            });
            continue;
          }
        }
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filename, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          let errorMessage = uploadError.message;
          
          // Provide more user-friendly error messages
          if (uploadError.message.includes('bucket')) {
            errorMessage = 'Photo storage is not available. Please try again later.';
          } else if (uploadError.message.includes('policy')) {
            errorMessage = 'Upload permissions not configured. Please contact support.';
          } else if (uploadError.message.includes('size')) {
            errorMessage = 'File is too large. Please use a smaller image.';
          } else if (uploadError.message.includes('type')) {
            errorMessage = 'File type not supported. Please use JPG, PNG, or WebP images.';
          }
          
          toast({
            title: 'Upload Failed',
            description: `${file.name}: ${errorMessage}`,
            variant: 'destructive'
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filename);

        newPhotos.push({
          id: randomId,
          url: publicUrl,
          isPrimary: photos.length === 0 && newPhotos.length === 0
        });
      }

      if (newPhotos.length > 0) {
        const updatedPhotos = [...photos, ...newPhotos];
        onPhotosChange(updatedPhotos);
        
        // Trigger callback to save to profile if provided
        if (onPhotosChange) {
          // This will be handled by the parent component to save to database
        }
        
        toast({
          title: 'Photos Uploaded',
          description: `Successfully uploaded ${newPhotos.length} photo(s).`,
        });
      }
    } catch (error) {
      toast({
        title: 'Upload Error',
        description: 'An unexpected error occurred while uploading.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      // Reset file input to allow re-uploading same files
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    
    // If we removed the primary photo, make the first remaining photo primary
    if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.isPrimary)) {
      updatedPhotos[0].isPrimary = true;
    }
    
    onPhotosChange(updatedPhotos);
    toast({
      title: 'Photo Removed',
      description: 'Photo has been removed from your profile.',
    });
  };

  const setPrimaryPhoto = (photoId: string) => {
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    }));
    onPhotosChange(updatedPhotos);
    toast({
      title: 'Primary Photo Set',
      description: 'This photo will be shown first on your profile.',
    });
  };

  return {
    isUploading,
    fileInputRef,
    maxPhotos,
    handleFileSelect,
    removePhoto,
    setPrimaryPhoto
  };
};
