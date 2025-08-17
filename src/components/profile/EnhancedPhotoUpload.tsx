
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import PhotoGrid from './PhotoGrid';
import PhotoUploadGuidelines from './PhotoUploadGuidelines';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface EnhancedPhotoUploadProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

const EnhancedPhotoUpload = ({ photos, onPhotosChange }: EnhancedPhotoUploadProps) => {
  const {
    isUploading,
    fileInputRef,
    maxPhotos,
    handleFileSelect,
    removePhoto,
    setPrimaryPhoto
  } = usePhotoUpload(photos, onPhotosChange);

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Camera className="h-5 w-5" />
          Profile Photos ({photos.length}/{maxPhotos})
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload 3-6 photos that show your personality. Your first photo will be your main profile picture.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Button */}
        {photos.length < maxPhotos && (
          <div className="space-y-3">
            <div 
              className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-700 mb-1">
                {isUploading ? 'Uploading photos...' : 'Click to upload photos'}
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, or WebP • Max 5MB each • {maxPhotos - photos.length} slots available
              </p>
            </div>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Photos
                </>
              )}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Photo Grid */}
        <PhotoGrid
          photos={photos}
          onRemovePhoto={removePhoto}
          onSetPrimaryPhoto={setPrimaryPhoto}
        />

        {/* Guidelines and Status */}
        <PhotoUploadGuidelines photoCount={photos.length} />
      </CardContent>
    </Card>
  );
};

export default EnhancedPhotoUpload;
