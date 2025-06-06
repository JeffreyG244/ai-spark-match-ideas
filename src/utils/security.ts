
import { SecurityAuditService } from '@/services/security/SecurityAuditService';
import { ContentValidationService } from '@/services/security/ContentValidationService';

export const LIMITS = {
  BIO_MAX_LENGTH: 500,
  MIN_BIO_LENGTH: 50,
  VALUES_MAX_LENGTH: 300,
  GOALS_MAX_LENGTH: 300,
  GREEN_FLAGS_MAX_LENGTH: 300,
  MESSAGE_MAX_LENGTH: 1000
};

export const rateLimiter = {
  requests: new Map<string, number[]>(),
  
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      SecurityAuditService.logSecurityEvent(
        'client_rate_limit_exceeded',
        { key, maxRequests, windowMs, currentCount: validRequests.length },
        'medium'
      );
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  },

  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < maxAge);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
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
  try {
    const host = window.location.hostname;
    return host !== 'localhost' && 
           !host.includes('127.0.0.1') && 
           !host.includes('.local') &&
           !host.includes('192.168.') &&
           !host.includes('10.') &&
           !host.endsWith('.dev');
  } catch (e) {
    return true;
  }
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/['"]/g, '')
    .replace(/[&]/g, '&amp;')
    .trim()
    .substring(0, 1000);
};

export const sanitizeForDisplay = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
};

export const containsInappropriateContent = (content: string): boolean => {
  const patterns = ContentValidationService.detectSuspiciousPatterns(content);
  return patterns.length > 0;
};

export const validateMessageContent = async (content: string): Promise<{ isValid: boolean; error?: string; sanitized?: string }> => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (content.length > LIMITS.MESSAGE_MAX_LENGTH) {
    return { isValid: false, error: `Message too long (max ${LIMITS.MESSAGE_MAX_LENGTH} characters)` };
  }

  const validation = await ContentValidationService.validateAndSanitizeInput(content, 'text', LIMITS.MESSAGE_MAX_LENGTH);
  
  if (!validation.isValid) {
    return { 
      isValid: false, 
      error: validation.error,
      sanitized: validation.sanitized
    };
  }

  if (containsInappropriateContent(content)) {
    await SecurityAuditService.logSecurityEvent(
      'inappropriate_content_detected',
      { content: content.substring(0, 200), type: 'message' },
      'medium'
    );
    return { isValid: false, error: 'Message contains inappropriate content' };
  }

  return { isValid: true, sanitized: validation.sanitized };
};

export const performSecurityMaintenance = (): void => {
  try {
    rateLimiter.cleanup();
    
    const securityKeys = ['security_logs', 'security_logs_fallback', 'audit_logs'];
    securityKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 1000) {
            localStorage.setItem(key, JSON.stringify(parsed.slice(-500)));
          }
        }
      } catch (error) {
        console.warn(`Failed to clean up ${key}:`, error);
      }
    });
  } catch (error) {
    console.error('Security maintenance failed:', error);
  }
};

if (typeof window !== 'undefined') {
  setInterval(performSecurityMaintenance, 60 * 60 * 1000);
}
