
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/security';

/**
 * Enhanced security validation for image URLs to prevent SSRF attacks
 */
export const validateImageUrlSecurity = async (url: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    // Use the database function for server-side validation
    const { data, error } = await supabase.rpc('validate_image_url', { url });
    
    if (error) {
      logSecurityEvent('image_url_validation_error', `Failed to validate URL: ${url}`, 'medium');
      return { isValid: false, error: 'URL validation failed' };
    }
    
    if (!data) {
      logSecurityEvent('invalid_image_url', `Blocked potentially dangerous URL: ${url}`, 'high');
      return { isValid: false, error: 'URL failed security validation' };
    }
    
    return { isValid: true };
  } catch (error) {
    logSecurityEvent('image_url_validation_exception', `Exception validating URL: ${url} - ${error}`, 'high');
    return { isValid: false, error: 'Security validation error' };
  }
};

/**
 * Enhanced password strength validation using server-side function
 */
export const validatePasswordStrength = async (password: string): Promise<{ isValid: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.rpc('validate_password_strength', { password });
    
    if (error) {
      logSecurityEvent('password_validation_error', 'Failed to validate password strength', 'medium');
      return { isValid: false, message: 'Password validation failed' };
    }
    
    if (data && data.length > 0) {
      const result = data[0];
      if (!result.is_valid) {
        logSecurityEvent('weak_password_attempt', result.message, 'medium');
      }
      return { isValid: result.is_valid, message: result.message };
    }
    
    return { isValid: false, message: 'Password validation failed' };
  } catch (error) {
    logSecurityEvent('password_validation_exception', `Exception validating password: ${error}`, 'high');
    return { isValid: false, message: 'Security validation error' };
  }
};

/**
 * Enhanced IP-based rate limiting
 */
export const checkIpRateLimit = async (
  action: string = 'general',
  maxAttempts: number = 100,
  windowMinutes: number = 60
): Promise<boolean> => {
  try {
    // Get client IP (in production, this would come from headers)
    const clientIp = 'client-ip'; // Placeholder - in real implementation, get from request headers
    
    const { data, error } = await supabase.rpc('check_ip_rate_limit', {
      p_ip_address: clientIp,
      p_action: action,
      p_max_attempts: maxAttempts,
      p_window_minutes: windowMinutes
    });
    
    if (error) {
      logSecurityEvent('rate_limit_check_error', `Failed to check rate limit for action: ${action}`, 'medium');
      return false; // Fail secure - deny if we can't check
    }
    
    return data || false;
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
    
    await supabase.rpc('log_security_event', {
      p_event_type: 'audit_log',
      p_user_id: user?.id || null,
      p_details: JSON.stringify({
        operation,
        resourceType,
        resourceId,
        timestamp: new Date().toISOString(),
        ...details
      }),
      p_severity: 'low'
    });
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
