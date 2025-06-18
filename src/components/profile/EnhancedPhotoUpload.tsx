
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxPhotos = 6;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

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

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filename, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: 'Upload Failed',
            description: `Failed to upload ${file.name}`,
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
        onPhotosChange([...photos, ...newPhotos]);
        toast({
          title: 'Photos Uploaded',
          description: `Successfully uploaded ${newPhotos.length} photo(s).`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
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
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={photo.url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Primary Badge */}
                {photo.isPrimary && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Main
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  {!photo.isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrimaryPhoto(photo.id)}
                      className="text-xs"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Make Main
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Guidelines */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-800 mb-2">Photo Guidelines</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Upload 3-6 clear, recent photos of yourself</li>
            <li>• Include a mix of close-up and full-body shots</li>
            <li>• Show your interests and personality</li>
            <li>• Avoid group photos where you're hard to identify</li>
            <li>• Maximum file size: 5MB per photo</li>
          </ul>
        </div>

        {/* Completion Status */}
        {photos.length >= 3 && (
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium">
              ✅ Great! You have {photos.length} photos uploaded
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPhotoUpload;
