import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimplePhotoUploadButtonProps {
  onPhotoUploaded?: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

const SimplePhotoUploadButton: React.FC<SimplePhotoUploadButtonProps> = ({
  onPhotoUploaded,
  disabled = false,
  className = ""
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    console.log('Photo upload button clicked!');
    
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to upload photos.",
        variant: "destructive"
      });
      return;
    }

    if (fileInputRef.current) {
      console.log('Opening file dialog...');
      fileInputRef.current.click();
    } else {
      console.error('File input ref is null!');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('No file selected');
      return;
    }

    const file = files[0];
    console.log('File selected:', file.name, file.type, file.size);

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
      console.log('Starting upload...');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `${user.id}/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;

      console.log('Uploading to:', filename);

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filename, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);

      console.log('Public URL:', publicUrl);

      // Save to database
      try {
        const { error: dbError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            photo_urls: [publicUrl], // For now, just save one photo
            primary_photo_url: publicUrl,
            updated_at: new Date().toISOString()
          });

        if (dbError) {
          console.error('Database save error:', dbError);
          // Don't throw - photo was uploaded successfully
        }
      } catch (dbErr) {
        console.error('Database operation failed:', dbErr);
      }

      toast({
        title: "Photo Uploaded!",
        description: "Your photo has been uploaded successfully.",
      });

      if (onPhotoUploaded) {
        onPhotoUploaded(publicUrl);
      }

    } catch (error: any) {
      console.error('Photo upload failed:', error);
      
      let errorMessage = 'Failed to upload photo. Please try again.';
      
      if (error.message?.includes('bucket')) {
        errorMessage = 'Storage bucket not found. Please contact support.';
      } else if (error.message?.includes('policy') || error.message?.includes('permission')) {
        errorMessage = 'Upload not allowed. Please make sure you are signed in.';
      } else if (error.message?.includes('size')) {
        errorMessage = 'File is too large. Please select a smaller image.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Upload Failed",
        description: errorMessage,
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

  return (
    <div className={className}>
      <Button
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="w-full"
        variant="default"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </>
        )}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="photo-upload-input"
      />
      
      {/* Debug info */}
      <div className="mt-2 text-xs text-gray-600">
        User: {user ? '✅ Signed in' : '❌ Not signed in'} | 
        Status: {isUploading ? 'Uploading...' : 'Ready'}
      </div>
    </div>
  );
};

export default SimplePhotoUploadButton;