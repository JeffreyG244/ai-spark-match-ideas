
import { SecurityAuditService } from './SecurityAuditService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SecurityValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

export const SECURITY_LIMITS = {
  BIO_MAX_LENGTH: 500,
  MIN_BIO_LENGTH: 50,
  VALUES_MAX_LENGTH: 300,
  GOALS_MAX_LENGTH: 300,
  GREEN_FLAGS_MAX_LENGTH: 300,
  MESSAGE_MAX_LENGTH: 1000,
  MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PHOTOS_PER_PROFILE: 6,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
} as const;

export class ValidationService {
  static validateEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 320;
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/['"]/g, '')
      .replace(/[&]/g, '&amp;')
      .trim()
      .substring(0, 1000);
  }

  static sanitizeForDisplay(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  static validateProfileData(profileData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!profileData.email || typeof profileData.email !== 'string') {
      errors.push('Valid email is required');
    }

    // Validate email format
    if (profileData.email && !this.validateEmailFormat(profileData.email)) {
      errors.push('Invalid email format');
    }

    // Validate bio length and content
    if (profileData.bio) {
      if (profileData.bio.length > SECURITY_LIMITS.BIO_MAX_LENGTH) {
        errors.push(`Bio must be ${SECURITY_LIMITS.BIO_MAX_LENGTH} characters or less`);
      }
      
      if (profileData.bio.length < SECURITY_LIMITS.MIN_BIO_LENGTH) {
        warnings.push(`Bio should be at least ${SECURITY_LIMITS.MIN_BIO_LENGTH} characters for better matches`);
      }

      // Check for suspicious content
      const suspiciousPatterns = [
        /contact.*me.*at/i,
        /my.*instagram/i,
        /snapchat/i,
        /telegram/i,
        /whatsapp/i,
        /\$\d+/,
        /bitcoin|crypto/i
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(profileData.bio))) {
        errors.push('Bio contains inappropriate content');
        SecurityAuditService.logSecurityEvent('inappropriate_bio_content', 'Suspicious bio content detected', 'medium');
      }
    }

    // Validate photos
    if (profileData.photos && Array.isArray(profileData.photos)) {
      if (profileData.photos.length > SECURITY_LIMITS.MAX_PHOTOS_PER_PROFILE) {
        errors.push(`Maximum ${SECURITY_LIMITS.MAX_PHOTOS_PER_PROFILE} photos allowed`);
      }

      profileData.photos.forEach((photo: string, index: number) => {
        if (!photo || typeof photo !== 'string') {
          errors.push(`Photo ${index + 1} is invalid`);
        } else if (!photo.startsWith('https://')) {
          errors.push(`Photo ${index + 1} must use HTTPS`);
        }
      });
    }

    // Validate age (if provided)
    if (profileData.age !== undefined) {
      const age = Number(profileData.age);
      if (!Number.isInteger(age) || age < 18 || age > 100) {
        errors.push('Age must be between 18 and 100');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateMessageSecurity(content: string, userId: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!content || content.trim().length === 0) {
      errors.push('Message cannot be empty');
      return { isValid: false, errors, warnings };
    }

    if (content.length > SECURITY_LIMITS.MESSAGE_MAX_LENGTH) {
      errors.push(`Message too long (max ${SECURITY_LIMITS.MESSAGE_MAX_LENGTH} characters)`);
    }

    // Security checks
    const dangerousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /[<>]/g
    ];

    if (dangerousPatterns.some(pattern => pattern.test(content))) {
      errors.push('Message contains potentially dangerous content');
      SecurityAuditService.logSecurityEvent('dangerous_message_content', `User ${userId} attempted XSS`, 'high');
    }

    // Spam detection
    const spamPatterns = [
      /(.)\1{5,}/g, // Repeated characters
      /[A-Z]{15,}/g, // Excessive caps
      /https?:\/\//gi, // URLs
      /\b\d{10,}\b/g, // Long numbers (phone numbers)
      /@\w+\.(com|net|org)/gi, // Email addresses
    ];

    const spamCount = spamPatterns.reduce((count, pattern) => {
      return count + (pattern.test(content) ? 1 : 0);
    }, 0);

    if (spamCount >= 2) {
      errors.push('Message appears to be spam');
      SecurityAuditService.logSecurityEvent('spam_message_detected', `User ${userId} sent spam-like message`, 'medium');
    }

    // Check for inappropriate content
    const inappropriatePatterns = [
      /\b(instagram|snapchat|whatsapp|telegram|kik)\b/i,
      /\b(cashapp|venmo|paypal|bank|account)\b/i,
      /\b(money|bitcoin|crypto|investment)\b/i,
    ];

    if (inappropriatePatterns.some(pattern => pattern.test(content))) {
      warnings.push('Message may contain inappropriate contact information');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateFileUpload(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file type
    if (!SECURITY_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
    }

    // Check file size
    if (file.size > SECURITY_LIMITS.MAX_PHOTO_SIZE) {
      errors.push('File too large. Maximum size is 5MB');
    }

    // Check filename for suspicious patterns
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com)$/i,
      /[<>:"|?*]/,
      /\.\./
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      errors.push('Suspicious filename detected');
      SecurityAuditService.logSecurityEvent('suspicious_filename', `Suspicious file upload attempted: ${file.name}`, 'high');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static async validateMessageContent(content: string): Promise<SecurityValidationResult> {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (content.length > SECURITY_LIMITS.MESSAGE_MAX_LENGTH) {
      return { isValid: false, error: `Message too long (max ${SECURITY_LIMITS.MESSAGE_MAX_LENGTH} characters)` };
    }

    const sanitized = this.sanitizeInput(content);

    // Check for inappropriate content patterns
    const inappropriatePatterns = [
      /contact.*me.*at/i,
      /instagram|snapchat|whatsapp|telegram/i,
      /money|bitcoin|crypto|investment/i,
      /cashapp|venmo|paypal/i
    ];

    if (inappropriatePatterns.some(pattern => pattern.test(content))) {
      await SecurityAuditService.logSecurityEvent(
        'inappropriate_content_detected',
        { content: content.substring(0, 200), type: 'message' },
        'medium'
      );
      return { isValid: false, error: 'Message contains inappropriate content' };
    }

    return { isValid: true, sanitized };
  }
}
