
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
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Photos'}
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
