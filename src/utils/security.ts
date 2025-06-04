
import DOMPurify from 'dompurify';

// Content sanitization utility
export const sanitizeInput = (input: string): string => {
  const purified = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  return purified
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// XSS protection for display content
export const sanitizeForDisplay = (content: string): string => {
  if (!content) return '';
  
  const purified = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: []
  });
  
  return purified
    .replace(/javascript:/gi, 'blocked:')
    .replace(/data:/gi, 'blocked:')
    .replace(/vbscript:/gi, 'blocked:');
};

// Enhanced inappropriate content detection
export const containsInappropriateContent = (text: string): boolean => {
  if (!text) return false;
  
  const inappropriatePatterns = [
    /\b(spam|scam|money|bitcoin|crypto|investment)\b/i,
    /\b(instagram|snapchat|whatsapp|telegram|kik)\b/i,
    /\b(cashapp|venmo|paypal|bank|account|password)\b/i,
    /\b(social security|ssn|credit card|debit card)\b/i,
    /\b(script|javascript|eval|cookie|localstorage)\b/i,
    /https?:\/\//i,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,
    /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/
  ];
  
  const lowerText = text.toLowerCase();
  return inappropriatePatterns.some(pattern => pattern.test(lowerText));
};

// Enhanced spam detection patterns
export const detectSpamPatterns = (text: string): boolean => {
  if (!text) return false;
  
  const spamPatterns = [
    /(.)\1{4,}/g,
    /[A-Z]{10,}/g,
    /(\$|€|£|\d+)\s*(million|thousand|k|usd|dollars?)/gi,
    /(click here|visit|link|website|url)/gi,
    /(free|winner|congratulations|prize)/gi,
    /[^\w\s]{5,}/g,
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /\b(eval|setTimeout|setInterval|Function)\s*\(/gi,
    /document\s*\.\s*(cookie|write|location)/gi
  ];
  
  return spamPatterns.some(pattern => pattern.test(text));
};

// Message content validation with enhanced security
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

  const xssPatterns = [
    /<[^>]*>/g,
    /javascript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
    /&#/gi,
    /\\u00[0-9A-F]{2}/gi,
    /\\x[0-9A-F]{2}/gi
  ];
  
  if (xssPatterns.some(pattern => pattern.test(content))) {
    return { isValid: false, error: 'Message contains potentially dangerous content' };
  }
  
  return { isValid: true };
};

// Enhanced rate limiting utility
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private blocked: Map<string, number> = new Map();
  
  constructor() {
    try {
      const blockedData = localStorage.getItem('rate_limiter_blocks');
      if (blockedData) {
        const parsed = JSON.parse(blockedData);
        this.blocked = new Map(Object.entries(parsed));
        
        const now = Date.now();
        this.blocked.forEach((expiry, key) => {
          if (expiry < now) {
            this.blocked.delete(key);
          }
        });
      }
    } catch (err) {
      console.error('Error loading rate limiter data:', err);
    }
  }
  
  private saveBlockedState(): void {
    try {
      const blockedObj = Object.fromEntries(this.blocked);
      localStorage.setItem('rate_limiter_blocks', JSON.stringify(blockedObj));
    } catch (err) {
      console.error('Error saving rate limiter data:', err);
    }
  }
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const blockExpiry = this.blocked.get(key);
    
    if (blockExpiry && blockExpiry > now) {
      return false;
    } else if (blockExpiry) {
      this.blocked.delete(key);
      this.saveBlockedState();
    }

    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      const violationCount = Math.floor(validAttempts.length / maxAttempts);
      const blockDuration = Math.min(windowMs * Math.pow(2, violationCount), 24 * 60 * 60 * 1000);
      
      this.blocked.set(key, now + blockDuration);
      this.saveBlockedState();
      
      if (violationCount > 1) {
        logSecurityEvent('rate_limit_blocked', 
          `${key} blocked for ${blockDuration/1000}s after ${violationCount} violations`, 'high');
      }
      
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  getRemainingAttempts(key: string, maxAttempts: number = 5, windowMs: number = 60000): number {
    const now = Date.now();
    const blockExpiry = this.blocked.get(key);
    
    if (blockExpiry && blockExpiry > now) {
      return 0;
    }

    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(time => now - time < windowMs);
    return Math.max(0, maxAttempts - validAttempts.length);
  }
  
  getBlockTimeRemaining(key: string): number {
    const now = Date.now();
    const blockExpiry = this.blocked.get(key);
    
    if (blockExpiry && blockExpiry > now) {
      return Math.ceil((blockExpiry - now) / 1000);
    }
    
    return 0;
  }
  
  clearBlocks(): void {
    this.blocked.clear();
    this.saveBlockedState();
  }
}

export const rateLimiter = new RateLimiter();

// Input validation utilities
export const validateAge = (age: number): boolean => {
  return Number.isInteger(age) && age >= 18 && age <= 100;
};

export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (email.includes('<') || email.includes('>') || 
      email.includes('script') || email.includes('&') ||
      email.includes('"') || email.includes("'")) {
    return false;
  }
  
  if (email.length > 254) {
    return false;
  }
  
  return emailRegex.test(email);
};

// Enhanced security logging utility
export const logSecurityEvent = (eventType: string, details: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
  console.warn(`[SECURITY] ${severity.toUpperCase()}: ${eventType} - ${details}`);
  
  try {
    const securityLog = {
      timestamp: new Date().toISOString(),
      type: eventType,
      details: details,
      severity: severity,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: sessionStorage.getItem('sessionId') || 'unknown',
      userId: localStorage.getItem('userId') || 'anonymous',
      fingerprint: generateSimpleFingerprint()
    };
    
    let logs = [];
    try {
      const storedLogs = localStorage.getItem('security_logs');
      logs = storedLogs ? JSON.parse(storedLogs) : [];
      
      if (!Array.isArray(logs)) {
        logs = [];
      }
    } catch (e) {
      logs = [];
    }
    
    logs.push(securityLog);
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));

    if (severity === 'high') {
      console.error('HIGH SEVERITY SECURITY EVENT:', securityLog);
      
      try {
        fetch('/api/security-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(securityLog),
          keepalive: true
        }).catch(() => {});
      } catch (e) {
        // Ignore errors
      }
    }
  } catch (e) {
    console.error('Error in security logging:', e);
  }
};

// Character limits with security considerations
export const LIMITS = {
  BIO_MAX_LENGTH: 500,
  VALUES_MAX_LENGTH: 300,
  GOALS_MAX_LENGTH: 300,
  GREEN_FLAGS_MAX_LENGTH: 300,
  MIN_BIO_LENGTH: 50,
  MESSAGE_MAX_LENGTH: 1000,
  MAX_PHOTO_SIZE: 5 * 1024 * 1024,
  MAX_PHOTOS_PER_USER: 6
};

// Production environment detection
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

// Generate a simple device fingerprint for logging
function generateSimpleFingerprint(): string {
  try {
    const components = [
      navigator.userAgent,
      screen.width,
      screen.height,
      navigator.language,
      new Date().getTimezoneOffset()
    ];
    
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  } catch (e) {
    return 'unknown';
  }
}

// Security helper for input validation
export const validateInputSafety = (input: string): boolean => {
  if (!input) return false;
  
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /[<>]/g
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};

// Security helper for URL validation
export const validateUrlSafety = (url: string): boolean => {
  if (!url) return false;
  
  if (!/^https?:\/\//i.test(url)) {
    return false;
  }
  
  if (/localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\./i.test(url)) {
    return false;
  }
  
  if (/^(javascript|data|file|vbscript):/i.test(url)) {
    return false;
  }
  
  return true;
};
