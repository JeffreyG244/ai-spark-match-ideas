
import DOMPurify from 'dompurify';

// Content sanitization utility
export const sanitizeInput = (input: string): string => {
  // First pass: DOMPurify to remove any HTML/script
  const purified = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Second pass: Encode any potentially harmful characters
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
  
  // Allow only specific formatting tags and no attributes
  const purified = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: []
  });
  
  // Additional protection for specific attack vectors
  return purified
    .replace(/javascript:/gi, 'blocked:')
    .replace(/data:/gi, 'blocked:')
    .replace(/vbscript:/gi, 'blocked:');
};

// Enhanced inappropriate content detection - including regexes for better pattern matching
export const containsInappropriateContent = (text: string): boolean => {
  if (!text) return false;
  
  const inappropriatePatterns = [
    // Scam/spam words
    /\b(spam|scam|money|bitcoin|crypto|investment)\b/i,
    
    // Contact info solicitation
    /\b(instagram|snapchat|whatsapp|telegram|kik)\b/i,
    
    // Financial solicitation
    /\b(cashapp|venmo|paypal|bank|account|password)\b/i,
    
    // Personal info solicitation
    /\b(social security|ssn|credit card|debit card)\b/i,
    
    // Script injection attempts
    /\b(script|javascript|eval|cookie|localstorage)\b/i,
    
    // External URLs
    /https?:\/\//i,
    
    // Email addresses
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,
    
    // Phone numbers (various formats)
    /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/
  ];
  
  const lowerText = text.toLowerCase();
  return inappropriatePatterns.some(pattern => pattern.test(lowerText));
};

// Enhanced spam detection patterns
export const detectSpamPatterns = (text: string): boolean => {
  if (!text) return false;
  
  const spamPatterns = [
    /(.)\1{4,}/g, // Repeated characters (aaaa, !!!!!)
    /[A-Z]{10,}/g, // Excessive caps
    /(\$|€|£|\d+)\s*(million|thousand|k|usd|dollars?)/gi, // Money amounts
    /(click here|visit|link|website|url)/gi, // Link spam
    /(free|winner|congratulations|prize)/gi, // Common spam words
    /[^\w\s]{5,}/g, // Excessive special characters
    /<script/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /data:text\/html/gi, // Data URL HTML injection
    /\b(eval|setTimeout|setInterval|Function)\s*\(/gi, // JavaScript execution
    /document\s*\.\s*(cookie|write|location)/gi // DOM manipulation
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

  // Check for potential XSS attempts with more thorough pattern matching
  const xssPatterns = [
    /<[^>]*>/g, // Any HTML tags
    /javascript:/gi, // JavaScript protocol
    /data:text\/html/gi, // Data URL HTML injection
    /on\w+\s*=/gi, // DOM event handlers
    /&#/gi, // HTML entity encoding
    /\\u00[0-9A-F]{2}/gi, // Unicode escapes
    /\\x[0-9A-F]{2}/gi // Hex escapes
  ];
  
  if (xssPatterns.some(pattern => pattern.test(content))) {
    return { isValid: false, error: 'Message contains potentially dangerous content' };
  }
  
  return { isValid: true };
};

// Enhanced rate limiting utility with exponential backoff and persistent blocking
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private blocked: Map<string, number> = new Map(); // Map of key to unblock time
  
  constructor() {
    // Load blocked state from localStorage if available
    try {
      const blockedData = localStorage.getItem('rate_limiter_blocks');
      if (blockedData) {
        const parsed = JSON.parse(blockedData);
        this.blocked = new Map(Object.entries(parsed));
        
        // Clean expired blocks
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
    // Save blocked state to localStorage
    try {
      const blockedObj = Object.fromEntries(this.blocked);
      localStorage.setItem('rate_limiter_blocks', JSON.stringify(blockedObj));
    } catch (err) {
      console.error('Error saving rate limiter data:', err);
    }
  }
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    // Check if currently blocked
    const now = Date.now();
    const blockExpiry = this.blocked.get(key);
    
    if (blockExpiry && blockExpiry > now) {
      return false;
    } else if (blockExpiry) {
      // Clear expired block
      this.blocked.delete(key);
      this.saveBlockedState();
    }

    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      // Calculate exponential backoff based on violation count
      const violationCount = Math.floor(validAttempts.length / maxAttempts);
      const blockDuration = Math.min(windowMs * Math.pow(2, violationCount), 24 * 60 * 60 * 1000); // Cap at 24 hours
      
      // Block user with exponential backoff
      this.blocked.set(key, now + blockDuration);
      this.saveBlockedState();
      
      // Log security event for repeated violations
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
    // Check if currently blocked
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
      return Math.ceil((blockExpiry - now) / 1000); // Return seconds
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
  
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Additional security: prevent potential injection attempts
  if (email.includes('<') || email.includes('>') || 
      email.includes('script') || email.includes('&') ||
      email.includes('"') || email.includes("'")) {
    return false;
  }
  
  // Check length to prevent DOS attacks
  if (email.length > 254) {
    return false;
  }
  
  return emailRegex.test(email);
};

// Enhanced security logging utility with better storage strategy
export const logSecurityEvent = (eventType: string, details: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
  console.warn(`[SECURITY] ${severity.toUpperCase()}: ${eventType} - ${details}`);
  
  try {
    // Enhanced structured logging with more context
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
    
    // Store logs more efficiently - use structured array instead of multiple keys
    let logs = [];
    try {
      const storedLogs = localStorage.getItem('security_logs');
      logs = storedLogs ? JSON.parse(storedLogs) : [];
      
      // Validate logs is an array
      if (!Array.isArray(logs)) {
        logs = [];
      }
    } catch (e) {
      logs = [];
    }
    
    // Add new log and maintain size limit
    logs.push(securityLog);
    if (logs.length > 100) {
      logs = logs.slice(-100); // Keep only the latest 100 entries
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));

    // In production, send to monitoring service
    if (severity === 'high') {
      // This would integrate with your monitoring service
      console.error('HIGH SEVERITY SECURITY EVENT:', securityLog);
      
      // Optionally send to server if available
      if (typeof supabase !== 'undefined') {
        try {
          fetch('/api/security-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(securityLog),
            // Don't wait for response to avoid blocking
            keepalive: true
          }).catch(() => {}); // Ignore errors, this is just a best-effort
        } catch (e) {
          // Ignore errors, logging should never break functionality
        }
      }
    }
  } catch (e) {
    // If logging fails, don't break the app
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
  MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
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
    // If there's any error accessing location, assume production as safer default
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
    
    // Create a string hash
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
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
  
  // Must be HTTP or HTTPS
  if (!/^https?:\/\//i.test(url)) {
    return false;
  }
  
  // Block localhost and private IPs
  if (/localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\./i.test(url)) {
    return false;
  }
  
  // Block dangerous protocols
  if (/^(javascript|data|file|vbscript):/i.test(url)) {
    return false;
  }
  
  return true;
};
