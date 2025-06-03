import DOMPurify from 'dompurify';

// Content sanitization utility
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// XSS protection for display content
export const sanitizeForDisplay = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: []
  });
};

// Enhanced inappropriate content detection
export const containsInappropriateContent = (text: string): boolean => {
  const inappropriateWords = [
    'spam', 'scam', 'money', 'bitcoin', 'crypto', 'investment',
    'instagram', 'snapchat', 'whatsapp', 'telegram', 'kik',
    'cashapp', 'venmo', 'paypal', 'bank', 'account', 'password',
    'social security', 'ssn', 'credit card', 'debit card'
  ];
  
  const lowerText = text.toLowerCase();
  return inappropriateWords.some(word => lowerText.includes(word));
};

// Enhanced spam detection patterns
export const detectSpamPatterns = (text: string): boolean => {
  const spamPatterns = [
    /(.)\1{4,}/g, // Repeated characters (aaaa, !!!!!)
    /[A-Z]{10,}/g, // Excessive caps
    /(\$|€|£|\d+)\s*(million|thousand|k|usd|dollars?)/gi, // Money amounts
    /(click here|visit|link|website|url)/gi, // Link spam
    /(free|winner|congratulations|prize)/gi, // Common spam words
    /[^\w\s]{5,}/g, // Excessive special characters
  ];
  
  return spamPatterns.some(pattern => pattern.test(text));
};

// Message content validation
export const validateMessageContent = (content: string): { isValid: boolean; error?: string } => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (content.length > 1000) {
    return { isValid: false, error: 'Message is too long (max 1000 characters)' };
  }
  
  if (containsInappropriateContent(content)) {
    return { isValid: false, error: 'Message contains inappropriate content' };
  }
  
  if (detectSpamPatterns(content)) {
    return { isValid: false, error: 'Message appears to be spam' };
  }
  
  return { isValid: true };
};

// Rate limiting utility (enhanced client-side implementation)
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  getRemainingAttempts(key: string, maxAttempts: number = 5, windowMs: number = 60000): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(time => now - time < windowMs);
    return Math.max(0, maxAttempts - validAttempts.length);
  }
}

export const rateLimiter = new RateLimiter();

// Input validation utilities
export const validateAge = (age: number): boolean => {
  return age >= 18 && age <= 100;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Security logging utility
export const logSecurityEvent = (eventType: string, details: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
  console.warn(`[SECURITY] ${severity.toUpperCase()}: ${eventType} - ${details}`);
  
  // In a production environment, you would send this to your security monitoring system
  // For now, we'll just log to console with structured format
  const securityLog = {
    timestamp: new Date().toISOString(),
    type: eventType,
    details: details,
    severity: severity,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  localStorage.setItem(`security_log_${Date.now()}`, JSON.stringify(securityLog));
  
  // Clean up old logs (keep only last 50)
  const logs = Object.keys(localStorage).filter(key => key.startsWith('security_log_'));
  if (logs.length > 50) {
    logs.sort().slice(0, logs.length - 50).forEach(key => localStorage.removeItem(key));
  }
};

// Character limits
export const LIMITS = {
  BIO_MAX_LENGTH: 500,
  VALUES_MAX_LENGTH: 300,
  GOALS_MAX_LENGTH: 300,
  GREEN_FLAGS_MAX_LENGTH: 300,
  MIN_BIO_LENGTH: 50,
  MESSAGE_MAX_LENGTH: 1000
};
