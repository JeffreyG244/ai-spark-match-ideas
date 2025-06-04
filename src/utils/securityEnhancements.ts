
import { supabase } from '@/integrations/supabase/client';

export interface SessionValidation {
  isValid: boolean;
  shouldRefresh: boolean;
  expiresAt?: Date;
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
