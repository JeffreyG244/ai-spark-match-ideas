
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

// Rate limiting utility (simple client-side implementation)
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

export const containsInappropriateContent = (text: string): boolean => {
  const inappropriateWords = [
    'spam', 'scam', 'money', 'bitcoin', 'crypto', 'investment',
    'instagram', 'snapchat', 'whatsapp', 'telegram', 'kik'
  ];
  
  const lowerText = text.toLowerCase();
  return inappropriateWords.some(word => lowerText.includes(word));
};

// Character limits
export const LIMITS = {
  BIO_MAX_LENGTH: 500,
  VALUES_MAX_LENGTH: 300,
  GOALS_MAX_LENGTH: 300,
  GREEN_FLAGS_MAX_LENGTH: 300,
  MIN_BIO_LENGTH: 50
};
