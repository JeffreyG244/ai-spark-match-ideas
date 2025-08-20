import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useEnhancedProfileData } from '@/hooks/useEnhancedProfileData';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, ExternalLink, X, Star } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

const PhotoManagementCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profileData, isLoading, saveProfile, updateProfileField } = useEnhancedProfileData();
  
  // Convert profile photos to expected format
  const photos: Photo[] = (profileData.photo_urls || []).map((url, index) => ({
    id: `photo-${index}`,
    url,
    isPrimary: index === 0
  }));

  const {
    isUploading,
    handleFileSelect,
    removePhoto,
    setPrimaryPhoto,
    fileInputRef
  } = usePhotoUpload(photos, async (updatedPhotos: Photo[]) => {
    // Update profile with new photos
    const photoUrls = updatedPhotos.map(photo => photo.url);
    updateProfileField('photo_urls', photoUrls);
    await saveProfile();
  });

  const handleRemovePhoto = async (photoId: string) => {
    removePhoto(photoId);
    await saveProfile();
  };

  const handleSetPrimary = async (photoId: string) => {
    setPrimaryPhoto(photoId);
    await saveProfile();
  };

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
    <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50 hover:border-pink-300/70 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-400/30 hover:scale-[1.02] hover:-translate-y-1 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Manage Photos</CardTitle>
              <p className="text-white/80 text-sm">
                Add, edit, or reorder your profile photos ({photos.length}/6)
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/executive-profile')}
            className="text-white hover:bg-white/10"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {photos.slice(0, 6).map((photo, index) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-white/10 group/photo"
              >
                <img
                  src={photo.url}
                  alt={`Profile ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary indicator */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </div>
                )}
                
                {/* Photo actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(photo.id)}
                      className="text-xs"
                    >
                      Make Primary
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Section */}
        {photos.length < 6 && (
          <div className="space-y-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
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
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-white/80 text-xs">
            📸 Add 3-6 high-quality photos. Your first photo will be your main profile picture.
            {photos.length === 0 && " Get started by uploading your first photo!"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => navigate('/executive-profile')}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            Full Photo Editor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoManagementCard;