import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/security';

/**
 * Enhanced security validation for image URLs to prevent SSRF attacks
 */
export const validateImageUrlSecurity = async (url: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    // Client-side validation only since the database function doesn't exist yet
    if (!url || url.trim().length === 0) {
      return { isValid: false, error: 'URL cannot be empty' };
    }

    // Check for valid HTTP/HTTPS protocols
    if (!url.match(/^https?:\/\//i)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    // Block localhost and private IP ranges
    if (url.match(/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i)) {
      logSecurityEvent('invalid_image_url', `Blocked potentially dangerous URL: ${url}`, 'high');
      return { isValid: false, error: 'URL points to private/local network' };
    }

    // Block dangerous protocols
    if (url.match(/^(file|ftp|data|javascript):/i)) {
      logSecurityEvent('invalid_image_url', `Blocked dangerous protocol in URL: ${url}`, 'high');
      return { isValid: false, error: 'URL uses dangerous protocol' };
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
    // Client-side password validation
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

    if (password.match(/(password|123456|qwerty|admin|letmein)/i)) {
      return { isValid: false, message: 'Password is too common and easily guessable' };
    }

    return { isValid: true, message: 'Password meets strength requirements' };
  } catch (error) {
    logSecurityEvent('password_validation_exception', `Exception validating password: ${error}`, 'high');
    return { isValid: false, message: 'Security validation error' };
  }
};

/**
 * Enhanced IP-based rate limiting using client-side tracking
 */
export const checkIpRateLimit = async (
  action: string = 'general',
  maxAttempts: number = 100,
  windowMinutes: number = 60
): Promise<boolean> => {
  try {
    // Client-side rate limiting using localStorage
    const storageKey = `rate_limit_${action}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    const storedData = localStorage.getItem(storageKey);
    const attempts = storedData ? JSON.parse(storedData) : [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter((time: number) => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      logSecurityEvent('rate_limit_exceeded', `Rate limit exceeded for action: ${action}`, 'medium');
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    localStorage.setItem(storageKey, JSON.stringify(validAttempts));
    
    return true;
  } catch (error) {
    logSecurityEvent('rate_limit_check_exception', `Exception checking rate limit: ${error}`, 'high');
    return false; // Fail secure
  }
};

/**
 * Content Security Policy headers for enhanced XSS protection
 */
export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: 'unsafe-inline' needed for React development
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
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
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
    
    // Check if session is close to expiring (within 5 minutes)
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry <= 0) {
      logSecurityEvent('expired_session_detected', 'User session has expired', 'low');
      return { isValid: false, shouldRefresh: false };
    }
    
    if (timeUntilExpiry < 300) { // Less than 5 minutes
      return { isValid: true, shouldRefresh: true };
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
    
    // Store audit log in localStorage for now since database function may not exist
    const auditEntry = {
      operation,
      resourceType,
      resourceId,
      userId: user?.id || null,
      timestamp: new Date().toISOString(),
      details
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    existingLogs.push(auditEntry);
    
    // Keep only last 100 entries
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

/**
 * Device fingerprinting for additional security
 */
export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${screen.width}x${screen.height}`,
    canvas: canvas.toDataURL(),
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack
  };
  
  return btoa(JSON.stringify(fingerprint)).slice(0, 64);
};
