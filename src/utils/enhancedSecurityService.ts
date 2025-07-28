import { supabase } from '@/integrations/supabase/client';
import { SECURITY_CONFIG } from './securityConfig';

// Enhanced security service for client-side security operations
export class EnhancedSecurityService {
  private static deviceFingerprint: string | null = null;

  // Generate device fingerprint for session validation
  static generateDeviceFingerprint(): string {
    if (this.deviceFingerprint) {
      return this.deviceFingerprint;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Security fingerprint', 10, 10);
    
    const fingerprint = btoa(
      [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
        navigator.hardwareConcurrency || 'unknown'
      ].join('|')
    ).slice(0, 64);

    this.deviceFingerprint = fingerprint;
    return fingerprint;
  }

  // Validate password strength using database function
  static async validatePasswordStrength(password: string): Promise<{
    isStrong: boolean;
    score: number;
    feedback: string[];
    isLeaked: boolean;
  }> {
    try {
      const { data, error } = await supabase.rpc('validate_password_strength', {
        password
      });

      if (error) {
        console.error('Password validation error:', error);
        return {
          isStrong: false,
          score: 0,
          feedback: ['Unable to validate password strength'],
          isLeaked: false
        };
      }

      // Type-safe data parsing
      const result = data as any;
      return {
        isStrong: result?.is_strong || false,
        score: result?.score || 0,
        feedback: Array.isArray(result?.feedback) ? result.feedback : ['No feedback available'],
        isLeaked: result?.is_leaked || false
      };
    } catch (error) {
      console.error('Password validation service error:', error);
      return {
        isStrong: false,
        score: 0,
        feedback: ['Password validation service unavailable'],
        isLeaked: false
      };
    }
  }

  // Sanitize user input using database function
  static async sanitizeInput(input: string, maxLength = 1000): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('sanitize_user_input', {
        input_text: input,
        max_length: maxLength
      });

      if (error) {
        console.error('Input sanitization error:', error);
        // Fallback client-side sanitization
        return this.fallbackSanitize(input, maxLength);
      }

      return (data as string) || '';
    } catch (error) {
      console.error('Input sanitization service error:', error);
      return this.fallbackSanitize(input, maxLength);
    }
  }

  // Fallback client-side sanitization
  private static fallbackSanitize(input: string, maxLength: number): string {
    let sanitized = input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();

    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  // Monitor session security
  static async monitorSessionSecurity(): Promise<void> {
    try {
      // Log security event instead of calling non-existent RPC function
      const deviceFingerprint = this.generateDeviceFingerprint();
      const securityData = {
        device_fingerprint: deviceFingerprint,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        session_check: true
      };
      
      // Store security data locally for now
      localStorage.setItem('security_session_data', JSON.stringify(securityData));
    } catch (error) {
      console.error('Session monitoring service error:', error);
    }
  }

  // Check for suspicious activity patterns
  static detectSuspiciousActivity(): {
    isSuspicious: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    
    // Check for rapid page navigation
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 10) {
      reasons.push('Rapid page navigation detected');
    }

    // Check for multiple failed authentication attempts
    const failedAttempts = localStorage.getItem('failed_auth_attempts');
    if (failedAttempts && parseInt(failedAttempts) > SECURITY_CONFIG.MAX_FAILED_LOGINS) {
      reasons.push('Multiple failed authentication attempts');
    }

    // Check for suspicious timing patterns
    const lastActivity = localStorage.getItem('last_activity');
    if (lastActivity) {
      const timeDiff = Date.now() - parseInt(lastActivity);
      if (timeDiff < 100) { // Too fast for human interaction
        reasons.push('Automated behavior detected');
      }
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons
    };
  }

  // Rate limiting check
  static checkRateLimit(action: string, maxAttempts = 5): {
    allowed: boolean;
    retryAfter?: number;
  } {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    
    const stored = localStorage.getItem(key);
    let attempts: { count: number; windowStart: number } = { count: 0, windowStart: now };
    
    if (stored) {
      attempts = JSON.parse(stored);
      
      // Reset if window has passed
      if (now - attempts.windowStart > windowMs) {
        attempts = { count: 0, windowStart: now };
      }
    }

    // Check if rate limit exceeded
    if (attempts.count >= maxAttempts) {
      const retryAfter = windowMs - (now - attempts.windowStart);
      return { allowed: false, retryAfter };
    }

    // Increment counter
    attempts.count++;
    localStorage.setItem(key, JSON.stringify(attempts));
    
    return { allowed: true };
  }

  // Clean up security data
  static cleanupSecurityData(): void {
    const keys = Object.keys(localStorage);
    const securityKeys = keys.filter(key => 
      key.startsWith('rate_limit_') || 
      key.startsWith('security_') ||
      key === 'failed_auth_attempts'
    );
    
    securityKeys.forEach(key => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const age = Date.now() - (data.timestamp || data.windowStart || 0);
          
          // Remove old security data (older than 24 hours)
          if (age > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        } catch {
          // Remove invalid data
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// Initialize security monitoring
if (typeof window !== 'undefined') {
  // Clean up old security data on load
  EnhancedSecurityService.cleanupSecurityData();
  
  // Set up periodic cleanup
  setInterval(() => {
    EnhancedSecurityService.cleanupSecurityData();
  }, 60 * 60 * 1000); // Every hour
}