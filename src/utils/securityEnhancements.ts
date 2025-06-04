
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, isProductionEnvironment } from '@/utils/security';

/**
 * Enhanced security validation for image URLs to prevent SSRF attacks
 */
export const validateImageUrlSecurity = async (url: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    if (!url || url.trim().length === 0) {
      return { isValid: false, error: 'URL cannot be empty' };
    }

    // Must use HTTP or HTTPS
    if (!url.match(/^https?:\/\//i)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    // Check for private IP ranges and localhost
    if (url.match(/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i)) {
      logSecurityEvent('invalid_image_url', `Blocked potentially dangerous URL: ${url}`, 'high');
      return { isValid: false, error: 'URL points to private/local network' };
    }

    // Block dangerous protocols
    if (url.match(/^(file|ftp|data|javascript|vbscript|about):/i)) {
      logSecurityEvent('invalid_image_url', `Blocked dangerous protocol in URL: ${url}`, 'high');
      return { isValid: false, error: 'URL uses dangerous protocol' };
    }
    
    // Check for suspicious encodings that might bypass filters
    if (url.match(/%[0-9A-Fa-f]{2}/)) {
      // Look for common evasion techniques
      const decodedUrl = decodeURIComponent(url);
      if (decodedUrl !== url && 
          (decodedUrl.match(/^(file|ftp|javascript|data|vbscript|about):/i) ||
           decodedUrl.match(/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i))) {
        logSecurityEvent('url_encoding_evasion', `URL encoding evasion attempt detected: ${url}`, 'high');
        return { isValid: false, error: 'URL contains suspicious encoding' };
      }
    }
    
    // Check for double encoding
    if (url.includes('%25')) {
      logSecurityEvent('double_encoding', `Double-encoded URL detected: ${url}`, 'high');
      return { isValid: false, error: 'URL contains double encoding' };
    }
    
    // Check typical image file extensions for images
    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)(\?|#|$)/i) === null) {
      logSecurityEvent('non_image_url', `URL does not appear to be an image: ${url}`, 'medium');
      // We'll warn but not block - some valid image URLs don't have extensions
    }

    return { isValid: true };
  } catch (error) {
    logSecurityEvent('image_url_validation_exception', `Exception validating URL: ${url} - ${error}`, 'high');
    return { isValid: false, error: 'Security validation error' };
  }
};

/**
 * Enhanced password strength validation using client-side validation
 */
export const validatePasswordStrength = async (password: string): Promise<{ isValid: boolean; message: string }> => {
  try {
    // Check null or empty
    if (!password) {
      return { isValid: false, message: 'Password cannot be empty' };
    }
    
    // Check length
    if (password.length < 12) {
      return { isValid: false, message: 'Password must be at least 12 characters long' };
    }

    // Check complexity requirements
    if (!password.match(/[A-Z]/)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!password.match(/[a-z]/)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!password.match(/[0-9]/)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    if (!password.match(/[!@#$%^&*(),.?":{}|<>]/)) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }

    // Check for common passwords
    const commonPasswords = [
      'password', '123456', 'qwerty', 'admin', 'welcome', 
      'letmein', 'monkey', 'abc123', 'sunshine', 'princess',
      'dragon', 'baseball', 'football', 'welcome1', 'admin123'
    ];
    
    if (commonPasswords.some(commonPwd => 
        password.toLowerCase().includes(commonPwd))) {
      return { isValid: false, message: 'Password contains common words that are easily guessable' };
    }
    
    // Check for repeated characters
    if (/(.)\1{3,}/.test(password)) {
      return { isValid: false, message: 'Password should not contain sequences of repeated characters' };
    }
    
    // Check for sequential characters
    const sequences = ['abcdef', '123456', 'qwerty'];
    for (const seq of sequences) {
      if (password.toLowerCase().includes(seq)) {
        return { isValid: false, message: 'Password should not contain sequential characters' };
      }
    }

    return { isValid: true, message: 'Password meets strength requirements' };
  } catch (error) {
    logSecurityEvent('password_validation_exception', `Exception validating password: ${error}`, 'high');
    return { isValid: false, message: 'Security validation error' };
  }
};

/**
 * Enhanced client-side rate limiting with persistent storage
 */
export const checkRateLimit = async (
  action: string = 'general',
  maxAttempts: number = 100,
  windowMinutes: number = 60
): Promise<boolean> => {
  try {
    const storageKey = `rate_limit_${action}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    // Load and validate data from storage
    let attempts: number[] = [];
    try {
      const storedData = localStorage.getItem(storageKey);
      const parsed = storedData ? JSON.parse(storedData) : [];
      
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
        attempts = parsed;
      } else {
        // Invalid data format, reset
        attempts = [];
      }
    } catch (e) {
      // Storage access error or invalid JSON, reset attempts
      attempts = [];
    }
    
    // Remove expired attempts
    const validAttempts = attempts.filter((time: number) => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      // Check if significantly over limit (possible attack)
      if (validAttempts.length > maxAttempts * 2) {
        logSecurityEvent(
          'rate_limit_abuse', 
          `Excessive rate limit violation for action: ${action}`, 
          'high'
        );
      } else {
        logSecurityEvent(
          'rate_limit_exceeded', 
          `Rate limit exceeded for action: ${action}`, 
          'medium'
        );
      }
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    
    // Save back to storage with error handling
    try {
      localStorage.setItem(storageKey, JSON.stringify(validAttempts));
    } catch (e) {
      // Handle storage quota exceeded or other storage errors
      console.error('Error saving rate limit data:', e);
    }
    
    return true;
  } catch (error) {
    logSecurityEvent('rate_limit_check_exception', `Exception checking rate limit: ${error}`, 'high');
    return false;
  }
};

/**
 * Content Security Policy headers for enhanced XSS protection
 */
export const getSecurityHeaders = () => {
  // Base policy with moderate security
  const basePolicy = {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://tzskjzkolyiwhijslqmq.supabase.co wss://tzskjzkolyiwhijslqmq.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  };
  
  // Enhanced policy for production
  const productionPolicy = {
    ...basePolicy,
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self'", // No unsafe-inline or unsafe-eval in production
      "style-src 'self'", // No unsafe-inline in production
      "img-src 'self' https:",
      "font-src 'self'",
      "connect-src 'self' https://tzskjzkolyiwhijslqmq.supabase.co wss://tzskjzkolyiwhijslqmq.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; '),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };
  
  return isProductionEnvironment() ? productionPolicy : basePolicy;
};

/**
 * Session security validation
 */
export const validateSession = async (): Promise<{ isValid: boolean; shouldRefresh: boolean }> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logSecurityEvent('session_validation_error', `Session validation failed: ${error.message}`, 'medium');
      return { isValid: false, shouldRefresh: false };
    }
    
    if (!session) {
      return { isValid: false, shouldRefresh: false };
    }
    
    // Extract session data & time checks
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    // Check session validity
    if (timeUntilExpiry <= 0) {
      logSecurityEvent('expired_session_detected', 'User session has expired', 'low');
      return { isValid: false, shouldRefresh: false };
    }
    
    // Check if session should be refreshed soon
    // (refresh 5 minutes before expiry to prevent interruptions)
    if (timeUntilExpiry < 300) {
      return { isValid: true, shouldRefresh: true };
    }
    
    // Additional security checks
    
    // Check if session is too old (24 hours) despite having a valid expiry
    // This is an extra security measure to enforce periodic re-auth
    const sessionCreated = new Date(session.created_at || 0).getTime() / 1000;
    const sessionAge = now - sessionCreated;
    const maxSessionAge = 24 * 60 * 60; // 24 hours
    
    if (sessionAge > maxSessionAge) {
      logSecurityEvent(
        'session_too_old', 
        'Session is valid but exceeds maximum allowed age', 
        'medium'
      );
      return { isValid: true, shouldRefresh: true };
    }
    
    // Check user metadata for any suspicious flags
    // (In a real app, these would be set by server-side components)
    if (session.user?.user_metadata?.security_flag) {
      logSecurityEvent(
        'security_flag_detected', 
        'User account has security flag set', 
        'high'
      );
      return { isValid: false, shouldRefresh: false };
    }
    
    return { isValid: true, shouldRefresh: false };
  } catch (error) {
    logSecurityEvent('session_validation_exception', `Exception validating session: ${error}`, 'high');
    return { isValid: false, shouldRefresh: false };
  }
};

/**
 * Enhanced audit logging for critical operations
 */
export const auditLog = async (
  operation: string,
  resourceType: string,
  resourceId: string,
  details?: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Attempted to audit log without authenticated user');
      return;
    }
    
    const auditEntry = {
      operation,
      resourceType,
      resourceId,
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      details: details || {},
      deviceInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`
      }
    };
    
    // Store in localStorage with rotation and size limit (100 entries)
    const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    
    // Validate that existingLogs is actually an array
    const validatedLogs = Array.isArray(existingLogs) ? existingLogs : [];
    
    // Add new entry with metadata sanitization to prevent injection
    validatedLogs.push(sanitizeAuditEntry(auditEntry));
    
    if (validatedLogs.length > 100) {
      validatedLogs.splice(0, validatedLogs.length - 100);
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(validatedLogs));
    
    // In production, could send to server for permanent storage
    if (isProductionEnvironment()) {
      try {
        // Use background task pattern to avoid blocking
        setTimeout(() => {
          // This would be replaced with actual server call
          console.log('Would send audit log to server:', auditEntry);
        }, 0);
      } catch (e) {
        // Ignore errors in background task
      }
    }
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

// Helper to sanitize audit entry for safe storage
function sanitizeAuditEntry(entry: any): any {
  // Recursively sanitize all string values to prevent storage-based XSS
  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? sanitizeString(obj) : obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }
    
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize both keys and values
      const sanitizedKey = sanitizeString(key);
      result[sanitizedKey] = sanitize(value);
    }
    
    return result;
  };
  
  return sanitize(entry);
}

// Helper to sanitize strings for storage
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return String(str);
  
  // Encode characters that could be used for storage-based XSS
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Device fingerprinting for additional security
 */
export const generateDeviceFingerprint = (): string => {
  try {
    // Canvas fingerprinting
    let canvasData = '';
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas properties
        canvas.width = 200;
        canvas.height = 50;
        
        // Draw background
        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        ctx.fillStyle = 'rgb(0, 0, 200)';
        ctx.font = '18px Arial';
        ctx.fillText('Security Fingerprint', 10, 30);
        
        // Draw shapes
        ctx.strokeStyle = 'rgb(0, 200, 0)';
        ctx.beginPath();
        ctx.arc(150, 25, 20, 0, Math.PI * 2);
        ctx.stroke();
        
        canvasData = canvas.toDataURL().substr(-50); // Just use the end of the data
      }
    } catch (e) {
      canvasData = 'canvas_not_supported';
    }
    
    // Collect browser data
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenRes: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      canvasHash: canvasData,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unspecified',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      plugins: Array.from(navigator.plugins || [])
        .slice(0, 5)
        .map(p => p.name)
        .join(','),
      timestamp: Math.floor(Date.now() / (1000 * 60 * 60)) // Rounded to hour for stability
    };
    
    // Create hash from components
    const jsonString = JSON.stringify(fingerprint);
    let hash = 0;
    
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Return a consistently formatted hash
    const hashHex = (hash >>> 0).toString(16).padStart(8, '0');
    return `df-${hashHex}-${fingerprint.platform.substring(0, 3)}-${screen.width % 100}`;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    return 'fallback-fingerprint-' + Math.random().toString(36).substring(2, 10);
  }
};
