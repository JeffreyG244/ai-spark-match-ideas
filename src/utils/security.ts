
// Simplified and more reasonable security validation
export const LIMITS = {
  BIO_MAX_LENGTH: 500,
  MIN_BIO_LENGTH: 50,
  VALUES_MAX_LENGTH: 300,
  GOALS_MAX_LENGTH: 300,
  GREEN_FLAGS_MAX_LENGTH: 300,
  MESSAGE_MAX_LENGTH: 1000,
};

export const containsInappropriateContent = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  
  // Only flag truly inappropriate content - be much more permissive
  const reallyBadPatterns = [
    /\b(fuck|shit|damn|hell|ass|bitch|dick|cock|pussy|cunt)\b/gi,
    /\b(xxx|porn|sex for money|escort|prostitute)\b/gi,
    /\b(buy drugs|selling drugs|cocaine|heroin|meth)\b/gi,
  ];

  return reallyBadPatterns.some(pattern => pattern.test(content));
};

export const validateProfileContent = (content: string, maxLength: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!content) {
    return { isValid: true, errors: [] };
  }

  if (content.length > maxLength) {
    errors.push(`Content exceeds maximum length of ${maxLength} characters`);
  }

  if (containsInappropriateContent(content)) {
    errors.push('Content contains inappropriate language');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const logSecurityEvent = (eventType: string, details: string, severity: string) => {
  // Simple logging - don't block user actions
  console.log(`Security Event: ${eventType}`, { details, severity });
};

// Add missing functions for components
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeForDisplay = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return sanitizeInput(input);
};

export const sanitizeInputAsync = async (input: string): Promise<string> => {
  return sanitizeInput(input);
};

export const isProductionEnvironment = (): boolean => {
  return window.location.hostname !== 'localhost' && 
         !window.location.hostname.includes('127.0.0.1') &&
         !window.location.hostname.includes('.local');
};

export const validateMessageContent = async (content: string): Promise<{ isValid: boolean; error?: string }> => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (content.length > LIMITS.MESSAGE_MAX_LENGTH) {
    return { isValid: false, error: `Message too long (max ${LIMITS.MESSAGE_MAX_LENGTH} characters)` };
  }

  if (containsInappropriateContent(content)) {
    return { isValid: false, error: 'Message contains inappropriate content' };
  }

  return { isValid: true };
};

// Simple rate limiter
class SimpleRateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const rateLimiter = new SimpleRateLimiter();
