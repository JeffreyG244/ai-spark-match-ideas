
import DOMPurify from 'dompurify';

export const SECURITY_LIMITS = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_BIO_LENGTH: 1000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
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
    const errors: string[] = [];

    if (password.length < SECURITY_LIMITS.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_LIMITS.MIN_PASSWORD_LENGTH} characters long`);
    }

    if (password.length > SECURITY_LIMITS.MAX_PASSWORD_LENGTH) {
      errors.push(`Password must be no more than ${SECURITY_LIMITS.MAX_PASSWORD_LENGTH} characters long`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
