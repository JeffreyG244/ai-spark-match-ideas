
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const SimplePhotoCapture = () => {
  const { user } = useAuth();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      console.log('🔔 Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCapturing(true);
        console.log('✅ Camera started successfully');
      }
    } catch (error: any) {
      console.error('❌ Camera error:', error);
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
    console.log('📷 Camera stopped');
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !user) return;

    try {
      setIsUploading(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
          'image/jpeg',
          0.8
        );
      });

      // Upload to Supabase storage
      const timestamp = Date.now();
      const filename = `${user.id}/${timestamp}_photo_${photos.length + 1}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);

      // Update user profile with new photo
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('photos')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentPhotos = currentProfile?.photos || [];
      const updatedPhotos = [...currentPhotos, publicUrl];

      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          photos: updatedPhotos,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // Update local state
      setPhotos(updatedPhotos);
      
      toast({
        title: 'Photo Captured!',
        description: `Photo ${photos.length + 1}/5 uploaded successfully.`,
      });

      console.log(`✅ Photo ${photos.length + 1} uploaded successfully`);

    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload photo.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async (photoUrl: string, index: number) => {
    if (!user) return;

    try {
      const updatedPhotos = photos.filter(p => p !== photoUrl);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          photos: updatedPhotos,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setPhotos(updatedPhotos);
      
      toast({
        title: 'Photo Removed',
        description: 'Photo has been deleted.',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove photo.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-purple-600" />
          Upload Profile Photos ({photos.length}/5)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Camera Section */}
        {!isCapturing ? (
          <div className="text-center space-y-4">
            <Button 
              onClick={startCamera}
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
            <p className="text-sm text-gray-600">
              Take up to 5 photos for your profile verification
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto rounded-lg border-2 border-purple-200"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={capturePhoto}
                disabled={isUploading || photos.length >= 5}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Capture Photo
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={stopCamera}>
                Stop Camera
              </Button>
            </div>
          </div>
        )}

        {/* Photos Grid */}
        {photos.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-purple-800">Your Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((photoUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={photoUrl}
                    alt={`Profile photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-purple-100"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removePhoto(photoUrl, index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-1 left-1">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        {photos.length >= 3 && (
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium">
              ✅ Great! You have {photos.length} verified photos
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default SimplePhotoCapture;
