import { supabase } from '@/integrations/supabase/client';

export interface SessionValidation {
  isValid: boolean;
  shouldRefresh: boolean;
  expiresAt?: Date;
}

export interface ImageValidation {
  isValid: boolean;
  error?: string;
}

export const validateSession = async (): Promise<SessionValidation> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return { isValid: false, shouldRefresh: false };
    }
    
    if (!session) {
      return { isValid: false, shouldRefresh: false };
    }
    
    const now = new Date();
    const expiresAt = new Date(session.expires_at! * 1000);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    
    return {
      isValid: timeUntilExpiry > 0,
      shouldRefresh: timeUntilExpiry < thirtyMinutes && timeUntilExpiry > 0,
      expiresAt
    };
  } catch (error) {
    console.error('Session validation failed:', error);
    return { isValid: false, shouldRefresh: false };
  }
};

export const validateImageUrlSecurity = async (imageUrl: string): Promise<ImageValidation> => {
  try {
    // Basic URL validation
    if (!imageUrl || typeof imageUrl !== 'string') {
      return { isValid: false, error: 'Invalid URL format' };
    }

    // Check for valid URL format
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return { isValid: false, error: 'Malformed URL' };
    }

    // Security checks
    const protocol = url.protocol.toLowerCase();
    if (protocol !== 'https:' && protocol !== 'http:') {
      return { isValid: false, error: 'Invalid protocol. Only HTTP/HTTPS allowed' };
    }

    // Check for suspicious domains
    const hostname = url.hostname.toLowerCase();
    const suspiciousDomains = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1'
    ];

    if (suspiciousDomains.some(domain => hostname.includes(domain))) {
      return { isValid: false, error: 'Local URLs not allowed' };
    }

    // Check for private IP ranges
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      const parts = hostname.split('.').map(Number);
      // Check for private IP ranges
      if (
        (parts[0] === 10) ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168)
      ) {
        return { isValid: false, error: 'Private IP addresses not allowed' };
      }
    }

    // Check file extension if present
    const pathname = url.pathname.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));
    
    if (pathname.includes('.') && !hasValidExtension) {
      return { isValid: false, error: 'Invalid file type' };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Image URL validation error:', error);
    return { isValid: false, error: 'Validation failed' };
  }
};

export const auditLog = async (
  action: string,
  resource: string,
  resourceId: string,
  metadata?: Record<string, any>
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const logEntry = {
      user_id: user?.id || null,
      action,
      resource,
      resource_id: resourceId,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      ip_address: null, // Would need server-side implementation for real IP
      user_agent: navigator.userAgent
    };

    // Store in localStorage for now (would be database in production)
    const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only last 1000 entries
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(existingLogs));
    
    console.log('Audit log entry:', logEntry);
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

export const generateDeviceFingerprint = (): string => {
  try {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.cookieEnabled
    ];
    
    const fingerprint = components.join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.error('Device fingerprint generation failed:', error);
    return 'unknown';
  }
};

export const isSecureContext = (): boolean => {
  return window.isSecureContext || window.location.protocol === 'https:';
};

export const sanitizeUserAgent = (userAgent: string): string => {
  // Remove potentially sensitive information from user agent
  return userAgent
    .replace(/\([^)]*\)/g, '') // Remove parenthetical content
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200); // Limit length
};

export const detectSuspiciousActivity = (): string[] => {
  const indicators: string[] = [];
  
  try {
    // Check for debugging tools
    if (window.console && typeof window.console.clear === 'function') {
      const originalClear = window.console.clear;
      if (originalClear.toString().indexOf('[native code]') === -1) {
        indicators.push('console_manipulation');
      }
    }
    
    // Check for automated browsing indicators
    if (navigator.webdriver) {
      indicators.push('webdriver_detected');
    }
    
    // Check for unusual screen dimensions
    if (screen.width < 100 || screen.height < 100) {
      indicators.push('unusual_screen_size');
    }
    
    // Check for missing standard APIs
    if (!navigator.languages || navigator.languages.length === 0) {
      indicators.push('missing_languages');
    }
    
  } catch (error) {
    indicators.push('detection_error');
  }
  
  return indicators;
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
