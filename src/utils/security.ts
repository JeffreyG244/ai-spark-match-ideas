
import { EnhancedSecurityService } from '@/services/security/EnhancedSecurityService';

// Export the enhanced security service functions for backward compatibility
export const sanitizeInput = async (input: string): Promise<string> => {
  const result = await EnhancedSecurityService.validateAndSanitizeInput(input, 'general');
  return result.sanitized || input;
};

export const validateMessageContent = async (content: string): Promise<{ isValid: boolean; error?: string }> => {
  const result = await EnhancedSecurityService.validateAndSanitizeInput(content, 'message');
  return {
    isValid: result.isValid,
    error: result.errors.length > 0 ? result.errors.join(', ') : undefined
  };
};

export const containsInappropriateContent = async (content: string): Promise<boolean> => {
  const result = await EnhancedSecurityService.validateAndSanitizeInput(content, 'general');
  return result.riskLevel === 'high' || result.riskLevel === 'critical';
};

export const logSecurityEvent = async (
  eventType: string,
  details: string | Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): Promise<void> => {
  // This is now handled internally by EnhancedSecurityService
  console.log('Security event:', { eventType, details, severity });
};

// Re-export the enhanced security service
export { EnhancedSecurityService };

// Security limits for backward compatibility
export const LIMITS = {
  MESSAGE_MAX_LENGTH: 1000,
  BIO_MAX_LENGTH: 500,
  MIN_BIO_LENGTH: 50,
  VALUES_MAX_LENGTH: 300,
  GOALS_MAX_LENGTH: 300,
  GREEN_FLAGS_MAX_LENGTH: 300,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Rate limiting helper
export const rateLimiter = {
  isAllowed: async (action: string, maxRequests: number, windowMinutes: number = 60): Promise<boolean> => {
    try {
      const result = await EnhancedSecurityService.checkRateLimit(
        action,
        'anonymous', // Will use user ID in the service if available
        maxRequests,
        windowMinutes
      );
      return result.allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Fail open
    }
  }
};
