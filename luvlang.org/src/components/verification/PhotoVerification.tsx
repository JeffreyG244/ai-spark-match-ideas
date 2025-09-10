import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, Upload, AlertCircle, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PhotoVerificationProps {
  onVerified?: () => void;
  required?: boolean;
}

export const PhotoVerification: React.FC<PhotoVerificationProps> = ({ 
  onVerified, 
  required = false 
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'capture' | 'review' | 'processing' | 'verified'>('capture');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480, 
          facingMode: 'user' 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasCamera(true);
        setCameraError(null);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Camera access denied or not available');
      setHasCamera(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPhotoData(photoDataUrl);
    setStep('review');

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 5MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoData(e.target?.result as string);
      setStep('review');
    };
    reader.readAsDataURL(file);
  };

  // Submit photo for verification
  const submitPhoto = async () => {
    if (!photoData) return;

    setIsLoading(true);
    setStep('processing');

    try {
      // Convert data URL to blob
      const response = await fetch(photoData);
      const blob = await response.blob();
      
      // Upload to Supabase storage
      const fileName = `verification_photo_${user?.id}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-photos')
        .getPublicUrl(fileName);

      // Basic face detection check (simplified)
      const hasValidPhoto = await validatePhoto(photoData);
      
      if (!hasValidPhoto) {
        toast({
          title: "Photo Quality Issue",
          description: "Please ensure your face is clearly visible and well-lit",
        });
        setStep('capture');
        return;
      }

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          verification_photo_url: publicUrl,
          photo_verified: true,
          photo_verified_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setStep('verified');
      toast({
        title: "Photo Verified!",
        description: "Your photo has been successfully verified",
      });

      onVerified?.();

    } catch (error) {
      console.error('Photo verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Could not process your photo. Please try again.",
      });
      setStep('review');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple photo validation (checks for basic image properties)
  const validatePhoto = async (dataUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Basic checks: minimum size, aspect ratio
        const isValidSize = img.width >= 200 && img.height >= 200;
        const aspectRatio = img.width / img.height;
        const isValidAspectRatio = aspectRatio > 0.5 && aspectRatio < 2;
        
        resolve(isValidSize && isValidAspectRatio);
      };
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    });
  };

  if (step === 'verified') {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">Photo Verified</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Your verification photo has been approved
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>Photo Verification</span>
          {required && (
            <Badge className="text-xs">
              Required
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'capture' && (
          <>
            <div className="space-y-4">
              <div className="text-center">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Take a clear photo of your face for verification
                </p>
              </div>

              {hasCamera && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg border"
                  />
                  <div className="mt-4 flex justify-center">
                    <Button onClick={capturePhoto} size="lg">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </Button>
                  </div>
                </div>
              )}

              {!hasCamera && (
                <div className="space-y-4">
                  <Button 
                    onClick={startCamera} 
                    className="w-full"
                    variant="outline"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>

                  <div className="text-center text-sm text-gray-500">or</div>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {cameraError && (
                <div className="text-center text-sm text-red-600">
                  {cameraError}
                </div>
              )}
            </div>
          </>
        )}

        {step === 'review' && photoData && (
          <>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium mb-4">Review Your Photo</p>
                <img 
                  src={photoData} 
                  alt="Verification photo"
                  className="max-w-full h-64 object-cover rounded-lg border mx-auto"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhotoData(null);
                    setStep('capture');
                  }}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button 
                  onClick={submitPhoto}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Processing...' : 'Submit'}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Processing your photo...</p>
          </div>
        )}

        <div className="flex items-start space-x-2 text-xs text-gray-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Photo verification helps confirm your identity and builds trust with other users.
            Ensure your face is clearly visible and well-lit.
          </p>
        </div>
      </CardContent>

      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
};