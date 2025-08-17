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
    console.log('📸 Photo upload started:', { 
      filesCount: files?.length, 
      userId: user?.id,
      currentPhotos: photos.length 
    });
    
    if (!files || !user) {
      console.error('❌ Upload failed - missing files or user:', { 
        hasFiles: !!files, 
        hasUser: !!user 
      });
      toast({
        title: 'Upload Error',
        description: 'Unable to access files or user not authenticated.',
        variant: 'destructive'
      });
      return;
    }

    if (photos.length + files.length > maxPhotos) {
      console.warn('⚠️ Too many photos:', { 
        current: photos.length, 
        adding: files.length, 
        max: maxPhotos 
      });
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
        console.log(`📁 Processing file ${i + 1}:`, {
          name: file.name,
          type: file.type,
          size: file.size
        });
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.error('❌ Invalid file type:', file.type);
          toast({
            title: 'Invalid File Type',
            description: `${file.name} is not a valid image file.`,
            variant: 'destructive'
          });
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          console.error('❌ File too large:', file.size);
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
        
        console.log('🚀 Uploading to storage:', { filename });

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filename, file, {
            contentType: file.type,
            upsert: false
          });

        console.log('📤 Upload result:', { 
          success: !uploadError, 
          data: uploadData, 
          error: uploadError 
        });

        if (uploadError) {
          console.error('❌ Upload error details:', uploadError);
          toast({
            title: 'Upload Failed',
            description: `Failed to upload ${file.name}: ${uploadError.message}`,
            variant: 'destructive'
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filename);

        console.log('🔗 Generated public URL:', publicUrl);

        newPhotos.push({
          id: randomId,
          url: publicUrl,
          isPrimary: photos.length === 0 && newPhotos.length === 0
        });
      }

      console.log('✅ Upload complete:', { newPhotosCount: newPhotos.length });

      if (newPhotos.length > 0) {
        onPhotosChange([...photos, ...newPhotos]);
        toast({
          title: 'Photos Uploaded',
          description: `Successfully uploaded ${newPhotos.length} photo(s).`,
        });
      }
    } catch (error) {
      console.error('💥 Unexpected upload error:', error);
      toast({
        title: 'Upload Error',
        description: 'An unexpected error occurred while uploading.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
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