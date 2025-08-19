
import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
  filename?: string;
}

export const usePhotoUpload = (photos: Photo[], onPhotosChange: (photos: Photo[]) => void) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxPhotos = 6;

  // Save photos to database after upload
  const savePhotosToDatabase = async (updatedPhotos: Photo[]) => {
    if (!user) return;
    
    try {
      const photoUrls = updatedPhotos.map(photo => photo.url);
      const primaryPhotoUrl = updatedPhotos.find(p => p.isPrimary)?.url || photoUrls[0];
      
      // Update user_profiles table with new photos
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          photo_urls: photoUrls,
          primary_photo_url: primaryPhotoUrl,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving photos to database:', error);
        toast({
          title: 'Save Error',
          description: 'Photos uploaded but failed to save to profile. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to upload photos.',
        variant: 'destructive'
      });
      return;
    }

    if (files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast({
        title: 'Too Many Photos',
        description: `You can upload a maximum of ${maxPhotos} photos.`,
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    const newPhotos: Photo[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${Date.now()}_${i}`;
        
        // Update progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Validate file
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid File Type',
            description: `${file.name} is not a valid image. Please use JPG, PNG, or WebP.`,
            variant: 'destructive'
          });
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'File Too Large',
            description: `${file.name} is too large. Maximum size is 5MB.`,
            variant: 'destructive'
          });
          continue;
        }

        try {
          // Generate filename
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2);
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `${user.id}/${timestamp}_${randomId}_${sanitizedFileName}`;

          // Update progress
          setUploadProgress(prev => ({ ...prev, [fileId]: 25 }));

          // Upload to Supabase
          const { data, error } = await supabase.storage
            .from('profile-photos')
            .upload(filename, file, {
              contentType: file.type,
              upsert: false,
              duplex: 'half'
            });

          if (error) {
            console.error('Upload error:', error);
            
            let errorMessage = error.message;
            if (error.message.includes('bucket')) {
              errorMessage = 'Photo storage is temporarily unavailable. Please try again later.';
            } else if (error.message.includes('policy')) {
              errorMessage = 'Upload permissions error. Please contact support.';
            } else if (error.message.includes('duplicate')) {
              errorMessage = 'File already exists. Please rename your file.';
            }

            toast({
              title: 'Upload Failed',
              description: `${file.name}: ${errorMessage}`,
              variant: 'destructive'
            });
            continue;
          }

          // Update progress
          setUploadProgress(prev => ({ ...prev, [fileId]: 75 }));

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filename);

          // Verify URL accessibility
          try {
            const response = await fetch(publicUrl, { method: 'HEAD' });
            if (!response.ok) {
              throw new Error(`URL not accessible: ${response.status}`);
            }
          } catch (urlError) {
            console.warn('URL verification failed:', urlError);
          }

          // Update progress
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

          // Add to photos array
          newPhotos.push({
            id: randomId,
            url: publicUrl,
            isPrimary: photos.length === 0 && newPhotos.length === 0,
            filename: filename
          });

          console.log('✅ Photo uploaded successfully:', publicUrl);

        } catch (fileError) {
          console.error('File processing error:', fileError);
          toast({
            title: 'Upload Error',
            description: `Failed to process ${file.name}. Please try again.`,
            variant: 'destructive'
          });
        }
      }

      // Update photos if any successful uploads
      if (newPhotos.length > 0) {
        const updatedPhotos = [...photos, ...newPhotos];
        onPhotosChange(updatedPhotos);
        
        // Save to database
        await savePhotosToDatabase(updatedPhotos);

        toast({
          title: 'Photos Uploaded',
          description: `Successfully uploaded ${newPhotos.length} photo(s)!`,
          variant: 'default'
        });
      }

    } catch (error) {
      console.error('Upload process error:', error);
      toast({
        title: 'Upload Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = async (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    
    // If we removed the primary photo, make the first remaining photo primary
    if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.isPrimary)) {
      updatedPhotos[0].isPrimary = true;
    }
    
    onPhotosChange(updatedPhotos);
    
    // Save to database
    await savePhotosToDatabase(updatedPhotos);
    
    toast({
      title: 'Photo Removed',
      description: 'Photo has been removed from your profile.',
    });
  };

  const setPrimaryPhoto = async (photoId: string) => {
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    }));
    onPhotosChange(updatedPhotos);
    
    // Save to database
    await savePhotosToDatabase(updatedPhotos);
    
    toast({
      title: 'Primary Photo Set',
      description: 'This photo will be shown first on your profile.',
    });
  };

  return {
    isUploading,
    uploadProgress,
    fileInputRef,
    maxPhotos,
    handleFileSelect,
    removePhoto,
    setPrimaryPhoto
  };
};
