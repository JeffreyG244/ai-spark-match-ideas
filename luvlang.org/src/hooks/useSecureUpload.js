import { useState } from 'react';
import { toast } from './use-toast';
import { rateLimiter, RATE_LIMITS } from '@/utils/rateLimiter';
export const useSecureUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const validateFile = (file) => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed'
            };
        }
        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return {
                isValid: false,
                error: 'File too large. Maximum size is 5MB'
            };
        }
        // Check filename for suspicious patterns
        const suspiciousPatterns = [
            /\.(exe|bat|cmd|scr|pif|com)$/i,
            /[<>:"|?*]/,
            /\.\./
        ];
        if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
            return {
                isValid: false,
                error: 'Suspicious filename detected'
            };
        }
        return { isValid: true };
    };
    const secureUpload = async (file, uploadFn) => {
        try {
            // Rate limiting
            if (!rateLimiter.isAllowed('photo_upload', RATE_LIMITS.PHOTO_UPLOAD)) {
                toast({
                    title: 'Upload Limit Exceeded',
                    description: 'Please wait before uploading more files.',
                    variant: 'destructive'
                });
                return { success: false, error: 'Rate limit exceeded' };
            }
            // Validate file
            const validation = validateFile(file);
            if (!validation.isValid) {
                toast({
                    title: 'Invalid File',
                    description: validation.error,
                    variant: 'destructive'
                });
                return { success: false, error: validation.error };
            }
            setIsUploading(true);
            const result = await uploadFn(file);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('Secure upload error:', error);
            toast({
                title: 'Upload Failed',
                description: 'An error occurred while uploading the file.',
                variant: 'destructive'
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            };
        }
        finally {
            setIsUploading(false);
        }
    };
    return {
        secureUpload,
        isUploading,
        validateFile
    };
};
