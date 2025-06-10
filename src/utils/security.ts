import { SecurityCoreService } from '@/services/security/SecurityCoreService';
import { ValidationService, SECURITY_LIMITS } from '@/services/security/ValidationService';
import { RateLimitService } from '@/services/security/RateLimitService';
import { SecurityAuditService } from '@/services/security/SecurityAuditService';
import { ContentValidationService } from '@/services/security/ContentValidationService';

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
export const sanitizeInput = (input: string): string => {
  const { sanitizedValue } = require('@/utils/enhancedSecurityValidation').sanitizeUserInput(input, false);
  return sanitizedValue || '';
};

export const sanitizeForDisplay = (input: string): string => {
  const { sanitizedValue } = require('@/utils/enhancedSecurityValidation').sanitizeUserInput(input, true);
  return sanitizedValue || '';
};

export const validateMessageContent = async (content: string): Promise<{ isValid: boolean; error?: string }> => {
  const { checkEnhancedRateLimit } = await import('@/utils/enhancedSecurityValidation');
  
  // Check rate limiting for message sending
  const rateCheck = await checkEnhancedRateLimit('send_message', 10, 60);
  if (!rateCheck.allowed) {
    return {
      isValid: false,
      error: 'Too many messages sent. Please wait before sending another message.'
    };
  }

  // Use enhanced input validation
  const { sanitizeUserInput } = await import('@/utils/enhancedSecurityValidation');
  const validation = sanitizeUserInput(content, false);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.errors.join(', ')
    };
  }

  if (content.length > LIMITS.MESSAGE_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Message is too long. Maximum ${LIMITS.MESSAGE_MAX_LENGTH} characters allowed.`
    };
  }

  return { isValid: true };
};

export const containsInappropriateContent = (content: string): boolean => {
  const suspiciousPatterns = ContentValidationService.detectSuspiciousPatterns?.(content) || [];
  return suspiciousPatterns.length > 0;
};

export const logSecurityEvent = SecurityAuditService.logSecurityEvent;

// Export SecurityCoreService functions
export const isProductionEnvironment = SecurityCoreService.isProductionEnvironment;
export const generateDeviceFingerprint = SecurityCoreService.generateDeviceFingerprint;
export const detectAutomationIndicators = SecurityCoreService.detectAutomationIndicators;

// Rate limiting
export const rateLimiter = {
  isAllowed: async (key: string, maxRequests: number, windowMs: number): Promise<boolean> => {
    const { checkEnhancedRateLimit } = await import('@/utils/enhancedSecurityValidation');
    const result = await checkEnhancedRateLimit(key, maxRequests, Math.floor(windowMs / 1000));
    return result.allowed;
  }
};

// Re-export services for direct access
export { SecurityCoreService, ValidationService, RateLimitService, SecurityAuditService, ContentValidationService };
