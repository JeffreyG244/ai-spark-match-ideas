
import DOMPurify from 'dompurify';
import { validatePasswordStrengthEnhanced } from '@/utils/enhancedPasswordValidation';

export const SECURITY_LIMITS = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_BIO_LENGTH: 1000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_PASSWORD_LENGTH: 8, // Updated to 8 characters
  MAX_PASSWORD_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes (updated)
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 60
} as const;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;
type AllowedImageType = typeof ALLOWED_IMAGE_TYPES[number];

export class ValidationService {
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return DOMPurify.sanitize(input.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false
    });
  }

  static sanitizeForDisplay(input: string): string {
    if (typeof input !== 'string') return '';
    
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
      ALLOW_DATA_ATTR: false
    });
  }

  static validateEmailFormat(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  static async validateMessageContent(content: string): Promise<{ isValid: boolean; error?: string; sanitized?: string }> {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'Content cannot be empty' };
    }

    if (content.length > SECURITY_LIMITS.MAX_MESSAGE_LENGTH) {
      return { isValid: false, error: `Content too long (max ${SECURITY_LIMITS.MAX_MESSAGE_LENGTH} characters)` };
    }

    const inappropriatePatterns = [
      /contact.*me.*at/i,
      /instagram|snapchat|whatsapp|telegram/i,
      /money|bitcoin|crypto|investment/i,
      /cashapp|venmo|paypal/i
    ];

    const hasInappropriateContent = inappropriatePatterns.some(pattern => pattern.test(content));
    if (hasInappropriateContent) {
      return { isValid: false, error: 'Content contains inappropriate patterns' };
    }

    const sanitized = this.sanitizeInput(content);
    return { isValid: true, sanitized };
  }

  static validateFileType(file: File): boolean {
    return ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType);
  }

  static validateFileSize(file: File): boolean {
    return file.size <= SECURITY_LIMITS.MAX_FILE_SIZE;
  }

  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const result = validatePasswordStrengthEnhanced(password);
    return {
      isValid: result.isValid,
      errors: result.errors
    };
  }
}
