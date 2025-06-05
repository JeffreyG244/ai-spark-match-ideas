import { logSecurityEventToDB } from './enhancedSecurity';
import { validateAndSanitizeInput } from './enhancedInputSecurity';

// Security configuration constants
export const LIMITS = {
  BIO_MAX_LENGTH: 500,
  MIN_BIO_LENGTH: 50,
  VALUES_MAX_LENGTH: 300,
  GOALS_MAX_LENGTH: 300,
  GREEN_FLAGS_MAX_LENGTH: 300,
  MESSAGE_MAX_LENGTH: 1000
};

// Enhanced rate limiter utility
export const rateLimiter = {
  requests: new Map<string, number[]>(),
  
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      // Log rate limit violation
      logSecurityEventToDB(
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

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
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
  // Use the new centralized logging system
  await logSecurityEventToDB(eventType, details, severity);
  
  // Keep fallback to localStorage for compatibility
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
    
    // Keep only last 100 entries in localStorage as fallback
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
  // Use the enhanced sanitization
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could break out of attributes
    .replace(/[&]/g, '&amp;') // Escape ampersands
    .trim()
    .substring(0, 1000); // Limit length
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
  return emailRegex.test(email) && email.length <= 320; // RFC 5321 limit
};

export const containsInappropriateContent = (content: string): boolean => {
  const inappropriatePatterns = [
    /contact.*me.*at/i,
    /instagram|snapchat|whatsapp|telegram/i,
    /money|bitcoin|crypto|investment/i,
    /cashapp|venmo|paypal/i,
    /click.*here|visit.*site/i,
    /urgent|emergency|asap/i,
    // Add more sophisticated patterns
    /\b(?:administrator|admin|root|system)\b.*\b(?:password|login|access)\b/i,
    /\b(?:hack|crack|exploit|vulnerability)\b/i
  ];
  
  return inappropriatePatterns.some(pattern => pattern.test(content));
};

export const validateMessageContent = async (content: string): Promise<{ isValid: boolean; error?: string; sanitized?: string }> => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (content.length > LIMITS.MESSAGE_MAX_LENGTH) {
    return { isValid: false, error: `Message too long (max ${LIMITS.MESSAGE_MAX_LENGTH} characters)` };
  }

  // Use enhanced validation
  const validation = await validateAndSanitizeInput(content, 'text', LIMITS.MESSAGE_MAX_LENGTH);
  
  if (!validation.isValid) {
    return { 
      isValid: false, 
      error: validation.error,
      sanitized: validation.sanitized
    };
  }

  if (containsInappropriateContent(content)) {
    await logSecurityEventToDB(
      'inappropriate_content_detected',
      { content: content.substring(0, 200), type: 'message' },
      'medium'
    );
    return { isValid: false, error: 'Message contains inappropriate content' };
  }

  return { isValid: true, sanitized: validation.sanitized };
};

export const detectSuspiciousPatterns = (content: string): string[] => {
  const patterns = [
    /contact.*me.*at/i,
    /instagram|snapchat|whatsapp|telegram/i,
    /money|bitcoin|crypto|investment/i,
    /cashapp|venmo|paypal/i,
    /click.*here|visit.*site/i,
    /urgent|emergency|asap/i
  ];
  
  const detectedPatterns: string[] = [];
  
  patterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
      const patternNames = [
        'contact_info_sharing',
        'external_platform_reference',
        'financial_content',
        'payment_reference',
        'suspicious_links',
        'urgency_manipulation'
      ];
      detectedPatterns.push(patternNames[index]);
    }
  });
  
  return detectedPatterns;
};

export const enforceContentPolicy = async (content: string, contentType: string): Promise<{ allowed: boolean; reason?: string }> => {
  const suspiciousPatterns = detectSuspiciousPatterns(content);
  
  if (suspiciousPatterns.length > 0) {
    await logSecurityEvent(
      'content_policy_violation',
      `Suspicious patterns detected in ${contentType}: ${suspiciousPatterns.join(', ')}`,
      'medium'
    );
    
    return {
      allowed: false,
      reason: `Content contains prohibited patterns: ${suspiciousPatterns.join(', ')}`
    };
  }
  
  if (content.length > 2000) {
    await logSecurityEvent(
      'content_length_violation',
      `Content exceeds maximum length for ${contentType}`,
      'low'
    );
    
    return {
      allowed: false,
      reason: 'Content exceeds maximum allowed length'
    };
  }
  
  return { allowed: true };
};

// Enhanced cleanup function
export const performSecurityMaintenance = (): void => {
  try {
    rateLimiter.cleanup();
    
    // Clean up old localStorage security data
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

// Run maintenance every hour
if (typeof window !== 'undefined') {
  setInterval(performSecurityMaintenance, 60 * 60 * 1000);
}
