import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedProfileData } from '@/hooks/useEnhancedProfileData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, X, Star, AlertTriangle } from 'lucide-react';

const SimplePhotoUpload = () => {
  const { user } = useAuth();
  const { profileData, isLoading, updateProfileField, saveProfile } = useEnhancedProfileData();
  const [isUploading, setIsUploading] = useState(false);
  const [storageReady, setStorageReady] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photos = profileData.photo_urls || [];
  const maxPhotos = 6;

  // Check if storage bucket exists
  const checkStorageSetup = async () => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('Storage access error:', error);
        setStorageReady(false);
        return false;
      }
      
      const hasProfileBucket = buckets?.some(bucket => bucket.name === 'profile-photos');
      setStorageReady(hasProfileBucket);
      return hasProfileBucket;
    } catch (error) {
      console.error('Storage check failed:', error);
      setStorageReady(false);
      return false;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    // Check storage setup first
    const isStorageReady = await checkStorageSetup();
    if (!isStorageReady) {
      toast({
        title: 'Storage Not Available',
        description: 'Photo upload is currently unavailable. The storage bucket needs to be configured.',
        variant: 'destructive'
      });
      return;
    }

    if (photos.length + files.length > maxPhotos) {
      toast({
        title: 'Too Many Photos',
        description: `You can only have up to ${maxPhotos} photos.`,
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    const newPhotoUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid File',
            description: `${file.name} is not an image file.`,
            variant: 'destructive'
          });
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'File Too Large',
            description: `${file.name} is larger than 5MB.`,
            variant: 'destructive'
          });
          continue;
        }

        // Create unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2);
        const fileExt = file.name.split('.').pop();
        const filename = `${user.id}/${timestamp}_${randomId}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filename, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          
          let errorMessage = 'Upload failed.';
          if (uploadError.message.includes('bucket')) {
            errorMessage = 'Storage bucket not found. Please contact support.';
          } else if (uploadError.message.includes('policy')) {
            errorMessage = 'Permission denied. Please contact support.';
          } else if (uploadError.message.includes('size')) {
            errorMessage = 'File too large.';
          }
          
          toast({
            title: 'Upload Failed',
            description: `${file.name}: ${errorMessage}`,
            variant: 'destructive'
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filename);

        newPhotoUrls.push(publicUrl);
      }

      // Update profile with new photos
      if (newPhotoUrls.length > 0) {
        const updatedPhotos = [...photos, ...newPhotoUrls];
        updateProfileField('photo_urls', updatedPhotos);
        await saveProfile(false); // Don't show success toast here
        
        toast({
          title: 'Photos Uploaded',
          description: `Successfully uploaded ${newPhotoUrls.length} photo(s).`
        });
      }
    } catch (error) {
      console.error('Unexpected upload error:', error);
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

  const removePhoto = async (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    updateProfileField('photo_urls', updatedPhotos);
    await saveProfile(false);
    
    toast({
      title: 'Photo Removed',
      description: 'Photo has been removed from your profile.'
    });
  };

  const setPrimaryPhoto = async (index: number) => {
    const updatedPhotos = [...photos];
    const [selectedPhoto] = updatedPhotos.splice(index, 1);
    updatedPhotos.unshift(selectedPhoto);
    
    updateProfileField('photo_urls', updatedPhotos);
    await saveProfile(false);
    
    toast({
      title: 'Primary Photo Set',
      description: 'This photo will be shown first on your profile.'
    });
  };

  React.useEffect(() => {
    if (user) {
      checkStorageSetup();
    }
  }, [user]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-4"></div>
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50 hover:border-pink-300/70 transition-all duration-300 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Photo Upload</CardTitle>
              <p className="text-white/80 text-sm">
                Upload and manage your profile photos ({photos.length}/{maxPhotos})
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Storage Status Warning */}
        {storageReady === false && (
          <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-100 font-medium text-sm">Storage Setup Required</p>
              <p className="text-yellow-200/80 text-xs">
                The photo storage bucket needs to be configured. Please contact support.
              </p>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-white/10 group"
              >
                <img
                  src={url}
                  alt={`Profile ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNjM2MzYzIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSIxMHB4Ij5JbWFnZSBFcnJvcjwvdGV4dD4KPHN2Zz4K';
                  }}
                />
                
                {/* Primary indicator */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </div>
                )}
                
                {/* Photo actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrimaryPhoto(index)}
                      className="text-xs"
                    >
                      Make Primary
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoto(index)}
                    className="p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {photos.length < maxPhotos && storageReady !== false && (
          <div className="space-y-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || storageReady === false}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Add Photos'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-white/80 text-xs">
            📸 Upload 1-{maxPhotos} high-quality photos (max 5MB each). JPG, PNG, WebP formats supported.
            {photos.length === 0 && " Your first photo will be your main profile picture."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplePhotoUpload;