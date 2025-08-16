import { useState, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase';
export const usePhotoUpload = (photos, onPhotosChange) => {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const maxPhotos = 6;
    const handleFileSelect = async (event) => {
        const files = event.target.files;
        if (!files || !user)
            return;
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
            const newPhotos = [];
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
                const updatedPhotos = [...photos, ...newPhotos];
                
                // Save photo URLs to database
                try {
                    // Get current profile
                    const { data: currentProfile } = await supabase
                        .from('profiles')
                        .select('id, photo_urls, user_id')
                        .eq('user_id', user.id)
                        .maybeSingle();
                    
                    const photoUrls = updatedPhotos.map(photo => photo.url);
                    
                    if (!currentProfile) {
                        // Create new profile
                        const { error: insertError } = await supabase
                            .from('profiles')
                            .insert([{
                                user_id: user.id,
                                email: user.email || '',
                                photo_urls: photoUrls,
                                primary_photo_url: photoUrls[0],
                                first_name: '',
                                last_name: ''
                            }]);
                            
                        if (insertError) {
                            console.error('Profile creation error:', insertError);
                            toast({
                                title: 'Database Error',
                                description: 'Photos uploaded but could not save to profile.',
                                variant: 'destructive'
                            });
                        }
                    } else {
                        // Update existing profile
                        const updateData = {
                            photo_urls: photoUrls
                        };
                        
                        // Set primary photo if this is the first photo
                        if (!currentProfile.photo_urls || currentProfile.photo_urls.length === 0) {
                            updateData.primary_photo_url = photoUrls[0];
                        }
                        
                        const { error: updateError } = await supabase
                            .from('profiles')
                            .update(updateData)
                            .eq('user_id', user.id);
                            
                        if (updateError) {
                            console.error('Profile update error:', updateError);
                            toast({
                                title: 'Database Error',
                                description: 'Photos uploaded but could not save to profile.',
                                variant: 'destructive'
                            });
                        }
                    }
                } catch (dbError) {
                    console.error('Database operation failed:', dbError);
                }
                
                onPhotosChange(updatedPhotos);
                toast({
                    title: 'Photos Uploaded',
                    description: `Successfully uploaded ${newPhotos.length} photo(s).`,
                });
            }
        }
        catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload Error',
                description: 'An unexpected error occurred while uploading.',
                variant: 'destructive'
            });
        }
        finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    const removePhoto = (photoId) => {
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
    const setPrimaryPhoto = (photoId) => {
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
    return {
        isUploading,
        fileInputRef,
        maxPhotos,
        handleFileSelect,
        removePhoto,
        setPrimaryPhoto
    };
};
