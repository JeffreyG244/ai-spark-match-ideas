import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
const SimplePhotoCapture = () => {
    const { user } = useAuth();
    const [photoCount, setPhotoCount] = useState(0);
    const [photos, setPhotos] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [cameraStarted, setCameraStarted] = useState(false);
    const [stream, setStream] = useState(null);
    const [isStartingCamera, setIsStartingCamera] = useState(false);
    const videoRef = useRef(null);
    const maxPhotos = 5;
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                console.log('🧹 Cleaning up camera stream');
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);
    // Simple camera start function with proper DOM access
    const startCamera = async () => {
        if (isStartingCamera || !user) {
            console.log('⚠️ Camera start blocked');
            return;
        }
        console.log('🎥 Starting camera...');
        setIsStartingCamera(true);
        try {
            // Step 1: Check browser support
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Camera not supported in this browser');
            }
            // Step 2: Video element should exist since we always render it
            if (!videoRef.current) {
                throw new Error('Video element not available');
            }
            const video = videoRef.current;
            console.log('✅ Video element found');
            // Step 3: Get camera stream
            console.log('📷 Requesting camera permission...');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            console.log('✅ Camera permission granted');
            setStream(mediaStream);
            // Step 4: Connect stream to video element
            console.log('🔗 Connecting stream to video...');
            video.srcObject = mediaStream;
            // Step 5: Wait for video to be ready
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Video setup timeout'));
                }, 10000);
                const onLoadedMetadata = () => {
                    console.log('📐 Video metadata loaded');
                    video.play()
                        .then(() => {
                        console.log('🎬 Video playing');
                        clearTimeout(timeout);
                        setCameraStarted(true);
                        resolve();
                    })
                        .catch(reject);
                };
                video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
                video.load();
            });
            console.log('✅ Camera setup complete');
        }
        catch (err) {
            console.error('💥 Camera setup failed:', err);
            // Clean up on error
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            let errorMessage = 'Failed to access camera';
            if (err.name === 'NotAllowedError') {
                errorMessage = 'Camera permission denied. Please allow camera access and try again.';
            }
            else if (err.name === 'NotFoundError') {
                errorMessage = 'No camera found. Please connect a camera and try again.';
            }
            else if (err.message) {
                errorMessage = err.message;
            }
            toast({
                title: 'Camera Error',
                description: errorMessage,
                variant: 'destructive'
            });
        }
        finally {
            setIsStartingCamera(false);
        }
    };
    // Stop camera
    const stopCamera = () => {
        console.log('🛑 Stopping camera...');
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraStarted(false);
        console.log('✅ Camera stopped');
    };
    // Take photo with improved profile handling
    const takePhoto = async () => {
        if (photoCount >= maxPhotos) {
            toast({
                title: 'Photo Limit Reached',
                description: 'You can only upload up to 5 photos.',
                variant: 'destructive'
            });
            return;
        }
        // Check all required elements exist
        if (!videoRef.current || !user || !stream || !cameraStarted) {
            console.error('❌ Prerequisites not met for photo capture');
            toast({
                title: 'Error',
                description: 'Camera not ready or user not authenticated.',
                variant: 'destructive'
            });
            return;
        }
        setIsUploading(true);
        try {
            const video = videoRef.current;
            // Verify video is ready
            if (video.readyState < 2 || video.videoWidth === 0) {
                throw new Error('Video not ready for capture');
            }
            console.log(`📸 Taking photo ${photoCount + 1}...`);
            // Create canvas for capture
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Cannot get canvas context');
            }
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            // Convert to blob
            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    }
                    else {
                        reject(new Error('Failed to create image blob'));
                    }
                }, 'image/jpeg', 0.8);
            });
            console.log('💾 Uploading to Supabase...');
            // Upload to Supabase
            const timestamp = Date.now();
            const filename = `${user.id}/${timestamp}_photo_${photoCount + 1}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(filename, blob, {
                contentType: 'image/jpeg',
                upsert: false
            });
            if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`);
            }
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(filename);
            // Get current profile photos using the correct table name 'profiles'
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();
            // Handle photos array
            const currentPhotos = currentProfile?.photo_urls || [];
            const updatedPhotos = [...currentPhotos, publicUrl];
            // Update profile with new photo using correct table and column names
            if (!currentProfile) {
                // Create new profile
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([{
                        user_id: user.id,
                        email: user.email || '',
                        photo_urls: updatedPhotos
                    }]);
                if (insertError) {
                    throw new Error(`Profile creation failed: ${insertError.message}`);
                }
            }
            else {
                // Update existing profile
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                    photo_urls: updatedPhotos
                })
                    .eq('user_id', user.id);
                if (updateError) {
                    throw new Error(`Profile update failed: ${updateError.message}`);
                }
            }
            // Update local state
            setPhotos(updatedPhotos);
            setPhotoCount(photoCount + 1);
            console.log('✅ Photo captured successfully');
            toast({
                title: 'Photo Captured!',
                description: `Photo ${photoCount + 1}/5 uploaded successfully.`,
            });
        }
        catch (error) {
            console.error('💥 Photo capture failed:', error);
            toast({
                title: 'Upload Failed',
                description: error.message || 'Failed to capture or upload photo.',
                variant: 'destructive'
            });
        }
        finally {
            setIsUploading(false);
        }
    };
    // Remove photo
    const removePhoto = async (photoUrl, index) => {
        if (!user)
            return;
        try {
            const updatedPhotos = photos.filter(p => p !== photoUrl);
            const { error } = await supabase
                .from('profiles')
                .update({
                photo_urls: updatedPhotos
            })
                .eq('user_id', user.id);
            if (error)
                throw new Error(`Remove failed: ${error.message}`);
            setPhotos(updatedPhotos);
            setPhotoCount(updatedPhotos.length);
            toast({
                title: 'Photo Removed',
                description: 'Photo has been deleted.',
            });
        }
        catch (error) {
            console.error('❌ Remove photo error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to remove photo.',
                variant: 'destructive'
            });
        }
    };
    // Load existing photos on mount
    useEffect(() => {
        const loadExistingPhotos = async () => {
            if (!user)
                return;
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('photo_urls')
                    .eq('user_id', user.id)
                    .maybeSingle();
                if (data && data.photo_urls) {
                    setPhotos(data.photo_urls);
                    setPhotoCount(data.photo_urls.length);
                    console.log('📂 Loaded existing photos:', data.photo_urls.length);
                }
            }
            catch (error) {
                console.error('❌ Error loading photos:', error);
            }
        };
        loadExistingPhotos();
    }, [user]);
    return (<Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-purple-600"/>
          Take 3 to 5 Profile Photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Always render video element to ensure DOM availability */}
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-sm mx-auto rounded-lg border-2 border-purple-200" style={{
            transform: 'scaleX(-1)',
            display: cameraStarted ? 'block' : 'none'
        }}/>
        </div>

        {/* Camera Controls */}
        {!cameraStarted ? (<div className="text-center space-y-4">
            <Button onClick={startCamera} disabled={isStartingCamera || !user} className="bg-purple-600 hover:bg-purple-700" size="lg">
              <Camera className="h-4 w-4 mr-2"/>
              {isStartingCamera ? 'Starting Camera...' : 'Start Camera'}
            </Button>
            {isStartingCamera && (<p className="text-sm text-gray-600">
                Please allow camera access when prompted
              </p>)}
            {!user && (<p className="text-sm text-red-600">
                Please log in to take photos
              </p>)}
          </div>) : (<div className="text-center space-y-2">
            <Button onClick={takePhoto} disabled={isUploading || photoCount >= maxPhotos} className="bg-purple-600 hover:bg-purple-700" size="lg">
              {isUploading ? (<>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Uploading...
                </>) : (<>
                  📸 Take Photo
                </>)}
            </Button>
            
            <Button onClick={stopCamera} variant="outline" size="sm">
              Stop Camera
            </Button>
          </div>)}

        {/* Photo Counter */}
        <p className="text-center text-sm text-gray-600">
          Photos taken: {photoCount}/{maxPhotos}
        </p>

        {/* Photos Display */}
        {photos.length > 0 && (<div className="space-y-3">
            <h4 className="font-medium text-purple-800">Your Photos</h4>
            <div className="flex flex-wrap gap-2">
              {photos.map((photoUrl, index) => (<div key={index} className="relative">
                  <img src={photoUrl} alt={`Profile photo ${index + 1}`} className="h-20 w-20 object-cover rounded border border-gray-300"/>
                  <Button variant="destructive" size="sm" className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full" onClick={() => removePhoto(photoUrl, index)}>
                    <X className="h-3 w-3"/>
                  </Button>
                </div>))}
            </div>
          </div>)}

        {/* Success Message */}
        {photoCount >= 3 && (<div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium">
              ✅ Great! You have {photoCount} profile photos uploaded
            </p>
          </div>)}

      </CardContent>
    </Card>);
};
export default SimplePhotoCapture;
