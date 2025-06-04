
import { supabase } from '@/integrations/supabase/client';
import { validateImageUrlSecurity } from './securityEnhancements';
import { logSecurityEvent } from './security';

/**
 * Downloads an image from a URL and returns it as a Blob
 */
export async function fetchImageAsBlob(imageUrl: string): Promise<Blob> {
  // Validate URL security before downloading
  const urlValidation = await validateImageUrlSecurity(imageUrl);
  if (!urlValidation.isValid) {
    logSecurityEvent('blocked_image_download', `Blocked download of unsafe URL: ${imageUrl}`, 'high');
    throw new Error(`URL failed security validation: ${urlValidation.error}`);
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Uploads a photo to the user's folder in the storage bucket with enhanced security
 */
export async function uploadProfilePhoto(userId: string, imageUrl: string, index: number): Promise<string> {
  try {
    console.log(`Downloading image from ${imageUrl}`);
    const blob = await fetchImageAsBlob(imageUrl);
    
    // Enhanced filename generation for security
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const filename = `${userId}/${timestamp}_${randomId}_photo_${index + 1}.jpg`;
    
    console.log(`Uploading to profile-photos/${filename}`);
    
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      logSecurityEvent('photo_upload_failed', `Upload failed for user ${userId}: ${uploadError.message}`, 'medium');
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filename);
    
    // Validate the generated URL
    const urlValidation = await validateImageUrlSecurity(publicUrl);
    if (!urlValidation.isValid) {
      logSecurityEvent('generated_url_invalid', `Generated URL failed validation: ${publicUrl}`, 'high');
      throw new Error('Generated URL failed security validation');
    }
      
    console.log('Photo uploaded successfully:', publicUrl);
    logSecurityEvent('photo_uploaded', `User ${userId} uploaded photo successfully`, 'low');
    return publicUrl;
    
  } catch (error) {
    console.error('Error uploading photo:', error);
    logSecurityEvent('photo_upload_exception', `Exception uploading photo for user ${userId}: ${error}`, 'high');
    throw error;
  }
}
