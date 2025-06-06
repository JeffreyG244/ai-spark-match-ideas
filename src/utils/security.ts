
import { SecurityAuditService } from '@/services/security/SecurityAuditService';
import { ValidationService, SECURITY_LIMITS } from '@/services/security/ValidationService';
import { RateLimitService } from '@/services/security/RateLimitService';
import { SecurityCoreService } from '@/services/security/SecurityCoreService';

// Export consolidated utilities
export const LIMITS = SECURITY_LIMITS;

export const rateLimiter = {
  requests: new Map<string, number[]>(),
  
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    return RateLimitService.isAllowed(key, maxRequests, windowMs);
  },

  cleanup(): void {
    RateLimitService.cleanup();
  }
};

export const logSecurityEvent = async (
  eventType: string,
  details: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): Promise<void> => {
  await SecurityAuditService.logSecurityEvent(eventType, details, severity);
  
  try {
    const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    const newLog = {
      type: eventType,
      details,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    existingLogs.push(newLog);
    
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Fallback security logging failed:', error);
  }
};

export const isProductionEnvironment = (): boolean => {
  return SecurityCoreService.isProductionEnvironment();
};

export const sanitizeInput = (input: string): string => {
  return ValidationService.sanitizeInput(input);
};

export const sanitizeForDisplay = (input: string): string => {
  return ValidationService.sanitizeForDisplay(input);
};

export const validateEmailFormat = (email: string): boolean => {
  return ValidationService.validateEmailFormat(email);
};

export const containsInappropriateContent = (content: string): boolean => {
  const inappropriatePatterns = [
    /contact.*me.*at/i,
    /instagram|snapchat|whatsapp|telegram/i,
    /money|bitcoin|crypto|investment/i,
    /cashapp|venmo|paypal/i
  ];
  return inappropriatePatterns.some(pattern => pattern.test(content));
};

export const validateMessageContent = async (content: string): Promise<{ isValid: boolean; error?: string; sanitized?: string }> => {
  return ValidationService.validateMessageContent(content);
};

export const performSecurityMaintenance = (): void => {
  SecurityCoreService.performSecurityMaintenance();
};

if (typeof window !== 'undefined') {
  setInterval(performSecurityMaintenance, 60 * 60 * 1000);
}
