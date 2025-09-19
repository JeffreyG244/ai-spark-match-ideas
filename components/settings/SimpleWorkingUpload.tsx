import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedProfileData } from '@/hooks/useEnhancedProfileData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, X, Star } from 'lucide-react';

const SimpleWorkingUpload = () => {
  const { user } = useAuth();
  const { profileData, updateProfileField, saveProfile } = useEnhancedProfileData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const photos = profileData.photo_urls || [];

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length || !user) return;

    setUploading(true);

    try {
      const file = files[0];
      
      // Simple validation
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large. Please use a file under 5MB');
        return;
      }

      // Upload to Supabase
      const timestamp = Date.now();
      const filename = `${user.id}/${timestamp}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filename, file);

      if (error) {
        console.error('Upload error:', error);
        alert('Upload failed: ' + error.message);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);

      // Update profile
      const newPhotos = [...photos, publicUrl];
      updateProfileField('photo_urls', newPhotos);
      await saveProfile(false);
      
      alert('Photo uploaded successfully!');

    } catch (error) {
      console.error('Error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = async (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    updateProfileField('photo_urls', newPhotos);
    await saveProfile(false);
    alert('Photo removed');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Professional Photo Gallery
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-white/10 group">
                <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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

        {/* Upload Button - ALWAYS VISIBLE */}
        <div className="space-y-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20"
            size="lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            multiple={false}
          />
        </div>

        {/* Photo Count */}
        <div className="text-center">
          <p className="text-white/70 text-sm">
            {photos.length} of 6 photos uploaded
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleWorkingUpload;