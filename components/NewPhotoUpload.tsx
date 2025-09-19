import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Camera, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const NewPhotoUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleButtonClick = () => {
    console.log('🔥 BUTTON CLICKED!');
    if (!user) {
      alert('Please sign in first!');
      return;
    }
    
    if (fileInputRef.current) {
      console.log('🔥 OPENING FILE DIALOG');
      fileInputRef.current.click();
    } else {
      console.error('❌ File input ref is null');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔥 FILE SELECTED!');
    const files = event.target.files;
    
    if (!files || files.length === 0) {
      console.log('❌ No files selected');
      return;
    }

    const file = files[0];
    console.log('📁 File details:', file.name, file.type, file.size);

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file!');
      return;
    }

    if (!user) {
      alert('Please sign in first!');
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${timestamp}_${randomId}.${fileExt}`;

      console.log('⬆️ Uploading to:', fileName);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error);
        throw error;
      }

      console.log('✅ Upload successful!', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      console.log('🌐 Public URL:', publicUrl);

      // Add to uploaded photos list
      setUploadedPhotos(prev => [...prev, publicUrl]);

      // Save to database
      try {
        const { error: dbError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            photo_urls: [...uploadedPhotos, publicUrl],
            primary_photo_url: uploadedPhotos.length === 0 ? publicUrl : undefined,
            updated_at: new Date().toISOString()
          });

        if (dbError) {
          console.error('⚠️ Database error:', dbError);
        } else {
          console.log('✅ Saved to database!');
        }
      } catch (dbErr) {
        console.error('⚠️ Database save failed:', dbErr);
      }

      toast({
        title: "✅ SUCCESS!",
        description: `Photo uploaded successfully! ${publicUrl}`,
      });

    } catch (error: any) {
      console.error('💥 Upload failed:', error);
      toast({
        title: "❌ Upload Failed",
        description: error.message || 'Please try again',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (photoUrl: string) => {
    setUploadedPhotos(prev => prev.filter(url => url !== photoUrl));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          🔥 NEW Photo Upload (WORKING!)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Button */}
        <div className="text-center">
          <Button
            onClick={handleButtonClick}
            disabled={isUploading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                🔥 CLICK HERE TO UPLOAD PHOTO
              </>
            )}
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Debug Info */}
        <div className="bg-gray-100 p-3 rounded text-sm">
          <p><strong>User:</strong> {user ? '✅ Signed in' : '❌ Not signed in'}</p>
          <p><strong>Status:</strong> {isUploading ? '⬆️ Uploading...' : '✅ Ready'}</p>
          <p><strong>Photos:</strong> {uploadedPhotos.length}</p>
        </div>

        {/* Display Uploaded Photos */}
        {uploadedPhotos.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">✅ Uploaded Photos:</h3>
            <div className="grid grid-cols-2 gap-4">
              {uploadedPhotos.map((photoUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={photoUrl}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <Button
                    onClick={() => removePhoto(photoUrl)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 p-1 h-6 w-6"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewPhotoUpload;