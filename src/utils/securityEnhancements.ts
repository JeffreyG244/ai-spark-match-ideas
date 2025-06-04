
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, isProductionEnvironment } from '@/utils/security';

export const validateImageUrlSecurity = async (url: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    if (!url || url.trim().length === 0) {
      return { isValid: false, error: 'URL cannot be empty' };
    }

    if (!url.match(/^https?:\/\//i)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    if (url.match(/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i)) {
      logSecurityEvent('invalid_image_url', `Blocked potentially dangerous URL: ${url}`, 'high');
      return { isValid: false, error: 'URL points to private/local network' };
    }

    if (url.match(/^(file|ftp|data|javascript|vbscript|about):/i)) {
      logSecurityEvent('invalid_image_url', `Blocked dangerous protocol in URL: ${url}`, 'high');
      return { isValid: false, error: 'URL uses dangerous protocol' };
    }
    
    if (url.match(/%[0-9A-Fa-f]{2}/)) {
      const decodedUrl = decodeURIComponent(url);
      if (decodedUrl !== url && 
          (decodedUrl.match(/^(file|ftp|javascript|data|vbscript|about):/i) ||
           decodedUrl.match(/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i))) {
        logSecurityEvent('url_encoding_evasion', `URL encoding evasion attempt detected: ${url}`, 'high');
        return { isValid: false, error: 'URL contains suspicious encoding' };
      }
    }
    
    if (url.includes('%25')) {
      logSecurityEvent('double_encoding', `Double-encoded URL detected: ${url}`, 'high');
      return { isValid: false, error: 'URL contains double encoding' };
    }
    
    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)(\?|#|$)/i) === null) {
      logSecurityEvent('non_image_url', `URL does not appear to be an image: ${url}`, 'medium');
    }

    return { isValid: true };
  } catch (error) {
    logSecurityEvent('image_url_validation_exception', `Exception validating URL: ${url} - ${error}`, 'high');
    return { isValid: false, error: 'Security validation error' };
  }
};

export const validatePasswordStrength = async (password: string): Promise<{ isValid: boolean; message: string }> => {
  try {
    if (!password) {
      return { isValid: false, message: 'Password cannot be empty' };
    }
    
    if (password.length < 12) {
      return { isValid: false, message: 'Password must be at least 12 characters long' };
    }

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

    const commonPasswords = [
      'password', '123456', 'qwerty', 'admin', 'welcome', 
      'letmein', 'monkey', 'abc123', 'sunshine', 'princess',
      'dragon', 'baseball', 'football', 'welcome1', 'admin123'
    ];
    
    if (commonPasswords.some(commonPwd => 
        password.toLowerCase().includes(commonPwd))) {
      return { isValid: false, message: 'Password contains common words that are easily guessable' };
    }
    
    if (/(.)\1{3,}/.test(password)) {
      return { isValid: false, message: 'Password should not contain sequences of repeated characters' };
    }
    
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

export const checkRateLimit = async (
  action: string = 'general',
  maxAttempts: number = 100,
  windowMinutes: number = 60
): Promise<boolean> => {
  try {
    const storageKey = `rate_limit_${action}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    let attempts: number[] = [];
    try {
      const storedData = localStorage.getItem(storageKey);
      const parsed = storedData ? JSON.parse(storedData) : [];
      
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
        attempts = parsed;
      } else {
        attempts = [];
      }
    } catch (e) {
      attempts = [];
    }
    
    const validAttempts = attempts.filter((time: number) => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
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
    
    validAttempts.push(now);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(validAttempts));
    } catch (e) {
      console.error('Error saving rate limit data:', e);
    }
    
    return true;
  } catch (error) {
    logSecurityEvent('rate_limit_check_exception', `Exception checking rate limit: ${error}`, 'high');
    return false;
  }
};

export const getSecurityHeaders = () => {
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
  
  const productionPolicy = {
    ...basePolicy,
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
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
    
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry <= 0) {
      logSecurityEvent('expired_session_detected', 'User session has expired', 'low');
      return { isValid: false, shouldRefresh: false };
    }
    
    if (timeUntilExpiry < 300) {
      return { isValid: true, shouldRefresh: true };
    }
    
    // Use session creation time from the token's issued_at instead of created_at
    const sessionCreated = session.access_token ? 
      JSON.parse(atob(session.access_token.split('.')[1])).iat : 
      Math.floor(Date.now() / 1000);
    const sessionAge = now - sessionCreated;
    const maxSessionAge = 24 * 60 * 60;
    
    if (sessionAge > maxSessionAge) {
      logSecurityEvent(
        'session_too_old', 
        'Session is valid but exceeds maximum allowed age', 
        'medium'
      );
      return { isValid: true, shouldRefresh: true };
    }
    
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
    
    const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const validatedLogs = Array.isArray(existingLogs) ? existingLogs : [];
    
    validatedLogs.push(sanitizeAuditEntry(auditEntry));
    
    if (validatedLogs.length > 100) {
      validatedLogs.splice(0, validatedLogs.length - 100);
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(validatedLogs));
    
    if (isProductionEnvironment()) {
      try {
        setTimeout(() => {
          console.log('Would send audit log to server:', auditEntry);
        }, 0);
      } catch (e) {
        // Ignore errors
      }
    }
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

function sanitizeAuditEntry(entry: any): any {
  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? sanitizeString(obj) : obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }
    
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      result[sanitizedKey] = sanitize(value);
    }
    
    return result;
  };
  
  return sanitize(entry);
}

function sanitizeString(str: string): string {
  if (typeof str !== 'string') return String(str);
  
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export const generateDeviceFingerprint = (): string => {
  try {
    let canvasData = '';
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 200;
        canvas.height = 50;
        
        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgb(0, 0, 200)';
        ctx.font = '18px Arial';
        ctx.fillText('Security Fingerprint', 10, 30);
        
        ctx.strokeStyle = 'rgb(0, 200, 0)';
        ctx.beginPath();
        ctx.arc(150, 25, 20, 0, Math.PI * 2);
        ctx.stroke();
        
        canvasData = canvas.toDataURL().substr(-50);
      }
    } catch (e) {
      canvasData = 'canvas_not_supported';
    }
    
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
      timestamp: Math.floor(Date.now() / (1000 * 60 * 60))
    };
    
    const jsonString = JSON.stringify(fingerprint);
    let hash = 0;
    
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hashHex = (hash >>> 0).toString(16).padStart(8, '0');
    return `df-${hashHex}-${fingerprint.platform.substring(0, 3)}-${screen.width % 100}`;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    return 'fallback-fingerprint-' + Math.random().toString(36).substring(2, 10);
  }
};
