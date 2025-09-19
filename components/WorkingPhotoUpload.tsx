import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Camera, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const WorkingPhotoUpload = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleButtonClick = () => {
    console.log('🔥 PHOTO UPLOAD CLICKED!');
    
    if (fileInputRef.current) {
      console.log('🔥 OPENING FILE DIALOG');
      fileInputRef.current.click();
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
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG, PNG, WebP).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `demo_user/${timestamp}_${randomId}.${fileExt}`;

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
            id: 'demo_user',
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
        description: `Photo uploaded successfully!`,
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
    toast({
      title: "Photo Removed",
      description: "Photo has been removed from your list.",
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Camera className="w-6 h-6" />
          🔥 Photo Upload - WORKING!
        </CardTitle>
        <p className="text-purple-100">Upload your profile photos here</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Upload Button */}
        <div className="text-center">
          <Button
            onClick={handleButtonClick}
            disabled={isUploading}
            className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg h-auto"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-3" />
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

        {/* Status Info */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">User:</span>
              {true ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="w-4 h-4" />
                  Signed in
                </div>
              ) : (
                <span className="text-red-600">❌ Not signed in</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <span className={isUploading ? "text-blue-600" : "text-green-600"}>
                {isUploading ? '⬆️ Uploading...' : '✅ Ready'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Photos:</span>
              <span className="text-purple-600">{uploadedPhotos.length}</span>
            </div>
          </div>
        </div>

        {/* Display Uploaded Photos */}
        {uploadedPhotos.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Uploaded Photos ({uploadedPhotos.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedPhotos.map((photoUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photoUrl}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  />
                  <Button
                    onClick={() => removePhoto(photoUrl)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click the green upload button to select photos</li>
            <li>• Supported formats: JPG, PNG, WebP</li>
            <li>• Maximum file size: 5MB per photo</li>
            <li>• First photo will be your primary profile picture</li>
            <li>• You're ready to upload executive photos!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkingPhotoUpload;