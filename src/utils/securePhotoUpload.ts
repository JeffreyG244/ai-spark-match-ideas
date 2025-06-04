
import { supabase } from '@/integrations/supabase/client';
import { validateImageUrlSecurity, auditLog } from './securityEnhancements';
import { logSecurityEvent } from './security';

/**
 * Secure photo upload with enhanced validation
 */
export const secureUploadPhoto = async (
  userId: string,
  file: File,
  photoIndex: number
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      logSecurityEvent('invalid_file_type', `User ${userId} attempted to upload ${file.type}`, 'medium');
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
    }
    
    if (file.size > maxSize) {
      logSecurityEvent('file_too_large', `User ${userId} attempted to upload ${file.size} bytes`, 'medium');
      return { success: false, error: 'File too large. Maximum size is 5MB.' };
    }
    
    // Generate secure filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${userId}/${timestamp}_${randomId}_photo_${photoIndex + 1}.${fileExtension}`;
    
    console.log('📤 Securely uploading to profile-photos bucket:', filename);
    
    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false
      });
    
    if (uploadError) {
      logSecurityEvent('photo_upload_error', `Upload failed for user ${userId}: ${uploadError.message}`, 'high');
      throw uploadError;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filename);
    
    // Validate the generated URL for security
    const urlValidation = await validateImageUrlSecurity(publicUrl);
    if (!urlValidation.isValid) {
      logSecurityEvent('generated_url_invalid', `Generated URL failed validation: ${publicUrl}`, 'high');
      return { success: false, error: 'Generated URL failed security validation' };
    }
    
    // Audit log the upload
    await auditLog('photo_upload', 'profile_photo', filename, {
      fileSize: file.size,
      fileType: file.type,
      publicUrl
    });
    
    console.log('✅ Photo uploaded securely:', publicUrl);
    return { success: true, url: publicUrl };
    
  } catch (error) {
    console.error('❌ Secure upload error:', error);
    logSecurityEvent('photo_upload_exception', `Exception uploading photo for user ${userId}: ${error}`, 'high');
    return { success: false, error: 'Upload failed due to security error' };
  }
};

/**
 * Secure batch photo upload for user profiles
 */
export const secureUploadProfilePhotos = async (
  userId: string,
  files: File[]
): Promise<{ success: boolean; urls: string[]; errors: string[] }> => {
  const urls: string[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await secureUploadPhoto(userId, files[i], i);
    
    if (result.success && result.url) {
      urls.push(result.url);
    } else {
      errors.push(result.error || 'Unknown error');
    }
  }
  
  return {
    success: errors.length === 0,
    urls,
    errors
  };
};
