
import { supabase } from '@/integrations/supabase/client';

/**
 * Downloads an image from a URL and returns it as a Blob
 */
export async function fetchImageAsBlob(imageUrl: string): Promise<Blob> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Uploads a photo to the user's folder in the storage bucket
 */
export async function uploadProfilePhoto(userId: string, imageUrl: string, index: number): Promise<string> {
  try {
    console.log(`Downloading image from ${imageUrl}`);
    const blob = await fetchImageAsBlob(imageUrl);
    
    const filename = `${userId}/${Date.now()}_photo_${index + 1}.jpg`;
    console.log(`Uploading to profile-photos/${filename}`);
    
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filename);
      
    console.log('Photo uploaded successfully:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}
