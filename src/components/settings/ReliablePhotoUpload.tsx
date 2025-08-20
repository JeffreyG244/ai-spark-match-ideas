import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedProfileData } from '@/hooks/useEnhancedProfileData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, X, Star, Loader2, Info } from 'lucide-react';

const ReliablePhotoUpload = () => {
  const { user } = useAuth();
  const { profileData, isLoading, updateProfileField, saveProfile } = useEnhancedProfileData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const photos = profileData.photo_urls || [];
  const maxPhotos = 6;
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    if (photos.length + files.length > maxPhotos) {
      toast({
        title: 'Too Many Photos',
        description: `You can only have up to ${maxPhotos} photos total.`,
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newPhotoUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 100);

        // Validate file
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid File',
            description: `${file.name} is not an image file.`,
            variant: 'destructive'
          });
          continue;
        }

        if (file.size > maxFileSize) {
          toast({
            title: 'File Too Large',
            description: `${file.name} is larger than 5MB.`,
            variant: 'destructive'
          });
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `${user.id}/${timestamp}_${randomId}.${fileExt}`;

        try {
          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('profile-photos')
            .upload(filename, file, {
              contentType: file.type,
              upsert: false
            });

          if (error) {
            console.error('Upload error:', error);
            toast({
              title: 'Upload Failed',
              description: `${file.name}: ${error.message}`,
              variant: 'destructive'
            });
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filename);

          newPhotoUrls.push(publicUrl);

        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          toast({
            title: 'Upload Failed',
            description: `${file.name}: Upload error occurred`,
            variant: 'destructive'
          });
        }
      }

      // Update profile with new photos
      if (newPhotoUrls.length > 0) {
        const updatedPhotos = [...photos, ...newPhotoUrls];
        updateProfileField('photo_urls', updatedPhotos);
        
        const saveResult = await saveProfile(false);
        if (saveResult?.success) {
          toast({
            title: 'Photos Uploaded Successfully',
            description: `${newPhotoUrls.length} photo(s) added to your profile.`
          });
        } else {
          toast({
            title: 'Save Warning',
            description: 'Photos uploaded but profile save may have failed.',
            variant: 'destructive'
          });
        }
      }

    } catch (error: any) {
      console.error('Upload process failed:', error);
      toast({
        title: 'Upload Error',
        description: 'An unexpected error occurred during upload.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = async (index: number) => {
    if (isUploading) return;
    
    const updatedPhotos = photos.filter((_, i) => i !== index);
    updateProfileField('photo_urls', updatedPhotos);
    
    const saveResult = await saveProfile(false);
    if (saveResult?.success) {
      toast({
        title: 'Photo Removed',
        description: 'Photo has been removed from your profile.'
      });
    }
  };

  const setPrimaryPhoto = async (index: number) => {
    if (isUploading || index === 0) return;
    
    const updatedPhotos = [...photos];
    const [selectedPhoto] = updatedPhotos.splice(index, 1);
    updatedPhotos.unshift(selectedPhoto);
    
    updateProfileField('photo_urls', updatedPhotos);
    
    const saveResult = await saveProfile(false);
    if (saveResult?.success) {
      toast({
        title: 'Primary Photo Updated',
        description: 'This photo will now appear first on your profile.'
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            <span className="text-white">Loading photo manager...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50 hover:border-pink-300/70 transition-all duration-300 shadow-lg">
      <CardHeader className="pb-4">
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
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-blue-100 text-sm font-medium">Uploading...</span>
            </div>
            <div className="w-full bg-blue-900/50 rounded-full h-2">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-blue-200/80 text-xs mt-1">
              {Math.round(uploadProgress)}% complete
            </p>
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
                    target.style.background = 'linear-gradient(45deg, #6b7280, #4b5563)';
                    target.alt = 'Image failed to load';
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
                      disabled={isUploading}
                      className="text-xs"
                    >
                      Make Primary
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoto(index)}
                    disabled={isUploading}
                    className="p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button - ALWAYS VISIBLE when under photo limit */}
        {photos.length < maxPhotos && (
          <div className="space-y-3">
            <Button
              onClick={() => {
                console.log('Upload button clicked'); // Debug log
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Add Photos'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedTypes.join(',')}
              multiple
              onChange={handleFileSelect}
              className="hidden"
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
            <div className="text-white/80 text-xs">
              <p className="font-medium mb-1">Photo Guidelines:</p>
              <ul className="space-y-1">
                <li>• Upload 1-{maxPhotos} high-quality photos (max 5MB each)</li>
                <li>• Supported formats: JPG, PNG, WebP, GIF</li>
                <li>• First photo becomes your primary profile picture</li>
                {photos.length === 0 && <li>• Start by uploading your best photo!</li>}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReliablePhotoUpload;