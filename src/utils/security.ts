import { SecurityCoreService } from '@/services/security/SecurityCoreService';
import { ValidationService, SECURITY_LIMITS } from '@/services/security/ValidationService';
import { RateLimitService } from '@/services/security/RateLimitService';
import { SecurityAuditService } from '@/services/security/SecurityAuditService';

// Export the limits with the expected property names for backward compatibility
export const LIMITS = {
  // Message limits
  MESSAGE_MAX_LENGTH: SECURITY_LIMITS.MAX_MESSAGE_LENGTH,
  
  // Bio limits  
  BIO_MAX_LENGTH: SECURITY_LIMITS.MAX_BIO_LENGTH,
  MIN_BIO_LENGTH: 50, // Add missing minimum bio length
  
  // Profile field limits
  VALUES_MAX_LENGTH: 300,
  GOALS_MAX_LENGTH: 300,
  GREEN_FLAGS_MAX_LENGTH: 300,
  
  // File limits
  MAX_FILE_SIZE: SECURITY_LIMITS.MAX_FILE_SIZE,
  
  // Other limits
  MAX_LOGIN_ATTEMPTS: SECURITY_LIMITS.MAX_LOGIN_ATTEMPTS,
  SESSION_TIMEOUT: SECURITY_LIMITS.SESSION_TIMEOUT
} as const;

// Security functions
export const sanitizeInput = ValidationService.sanitizeInput;
export const sanitizeForDisplay = ValidationService.sanitizeForDisplay;
export const validateMessageContent = ValidationService.validateMessageContent;
export const containsInappropriateContent = (content: string): boolean => {
  const suspiciousPatterns = ValidationService.detectSuspiciousPatterns?.(content) || [];
  return suspiciousPatterns.length > 0;
};

export const logSecurityEvent = SecurityAuditService.logSecurityEvent;

// Rate limiting
export const rateLimiter = {
  isAllowed: (key: string, maxRequests: number, windowMs: number): boolean => {
    // Simple client-side rate limiting implementation
    const now = Date.now();
    const windowKey = `${key}_${Math.floor(now / windowMs)}`;
    const currentCount = parseInt(localStorage.getItem(windowKey) || '0');
    
    if (currentCount >= maxRequests) {
      return false;
    }
    
    localStorage.setItem(windowKey, (currentCount + 1).toString());
    
    // Clean up old entries
    setTimeout(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${key.split('_')[0]}_`) && parseInt(key.split('_')[1]) < Math.floor(now / windowMs)) {
          localStorage.removeItem(key);
        }
      }
    }, 100);
    
    return true;
  }
};

// Re-export services for direct access
export { SecurityCoreService, ValidationService, RateLimitService, SecurityAuditService };
