import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

export interface CriticalSecurityValidation {
  isValid: boolean;
  sanitized?: string;
  errors: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  blockedReasons?: string[];
}

export interface SecureSessionData {
  isValid: boolean;
  user: any;
  deviceFingerprint?: string;
  sessionAge: number;
  requiresRefresh: boolean;
  error?: string;
}

export class CriticalSecurityService {
  // Enhanced dangerous patterns with more comprehensive coverage
  private static readonly CRITICAL_PATTERNS = [
    // XSS Prevention
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /data:application\/javascript/gi,
    
    // Event handlers
    /on\w+\s*=/gi,
    /@import/gi,
    /expression\s*\(/gi,
    
    // SQL Injection patterns
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bALTER\b|\bCREATE\b)[\s\S]*(\b(FROM|INTO|WHERE|SET|VALUES|TABLE|DATABASE)\b)/gi,
    /['"];\s*(DROP|DELETE|INSERT|UPDATE|SELECT|ALTER|CREATE)/gi,
    /\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi,
    /'[^']*'[\s]*;[\s]*(DROP|DELETE|UPDATE|INSERT)/gi,
    
    // Command injection
    /[;&|`$(){}[\]]/g,
    /\b(rm|del|format|fdisk|kill|sudo|su|chmod|chown)\b/gi,
    
    // Path traversal
    /\.\.\//g,
    /\.\.\\+/g,
    /%2e%2e%2f/gi,
    /%2e%2e%5c/gi,
    
    // Protocol smuggling
    /file:\/\//gi,
    /ftp:\/\//gi,
    /ldap:\/\//gi,
    /gopher:\/\//gi,
  ];

  private static readonly SUSPICIOUS_CONTENT = [
    // Contact information patterns
    /contact.*me.*at/i,
    /reach.*me.*on/i,
    /message.*me.*on/i,
    
    // Social media platforms
    /instagram|snapchat|whatsapp|telegram|kik|discord|skype/i,
    
    // Financial/scam patterns
    /money|bitcoin|crypto|investment|cash|paypal|venmo|cashapp/i,
    /sugar.*daddy|sugar.*baby/i,
    /escort|massage|adult.*services/i,
    
    // Phone numbers and emails
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    
    // External links
    /https?:\/\/((?!your-domain\.com)[a-z0-9.-]+)/gi,
  ];

  /**
   * Critical input validation with zero-tolerance policy
   */
  static async validateCriticalInput(
    input: string,
    contentType: 'profile' | 'message' | 'bio' | 'general',
    maxLength: number = 1000
  ): Promise<CriticalSecurityValidation> {
    const errors: string[] = [];
    const blockedReasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        errors: ['Invalid input type'],
        riskLevel: 'medium',
        blockedReasons: ['invalid_input_type']
      };
    }

    // Length validation
    if (input.length > maxLength) {
      errors.push(`Content exceeds maximum length of ${maxLength} characters`);
      riskLevel = 'medium';
    }

    if (input.length === 0) {
      return {
        isValid: false,
        errors: ['Content cannot be empty'],
        riskLevel: 'low'
      };
    }

    // Critical pattern detection
    for (const pattern of this.CRITICAL_PATTERNS) {
      if (pattern.test(input)) {
        errors.push('Content contains dangerous patterns that pose security risks');
        blockedReasons.push(`critical_pattern_detected`);
        riskLevel = 'critical';
        
        // Log critical security event
        await this.logCriticalSecurityEvent('critical_pattern_detected', {
          contentType,
          pattern: pattern.source.substring(0, 50),
          inputLength: input.length,
          blockedContent: input.substring(0, 100) + '...'
        });
        
        // Immediately reject any input with critical patterns
        return {
          isValid: false,
          errors,
          riskLevel,
          blockedReasons
        };
      }
    }

    // Suspicious content detection
    for (const pattern of this.SUSPICIOUS_CONTENT) {
      if (pattern.test(input)) {
        errors.push('Content contains potentially inappropriate or suspicious information');
        blockedReasons.push('suspicious_content_detected');
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    }

    // Additional validation for profile content
    if (contentType === 'bio' || contentType === 'profile') {
      // Check for excessive special characters
      const specialCharCount = (input.match(/[^\w\s.,!?-]/g) || []).length;
      const specialCharRatio = specialCharCount / input.length;
      
      if (specialCharRatio > 0.1) {
        errors.push('Content contains too many special characters');
        if (riskLevel === 'low') riskLevel = 'medium';
      }

      // Check for repeated characters (potential spam)
      const repeatedPattern = /(.)\1{4,}/g;
      if (repeatedPattern.test(input)) {
        errors.push('Content contains suspicious repeated characters');
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    }

    // Aggressive sanitization
    let sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false
    });

    // Additional encoding for security
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .trim();

    return {
      isValid: errors.length === 0,
      sanitized,
      errors,
      riskLevel,
      blockedReasons: blockedReasons.length > 0 ? blockedReasons : undefined
    };
  }

  /**
   * Enhanced session security validation
   */
  static async validateSecureSession(): Promise<SecureSessionData> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        await this.logCriticalSecurityEvent('session_validation_failed', { error: error.message });
        return { 
          isValid: false, 
          user: null, 
          sessionAge: 0, 
          requiresRefresh: false,
          error: error.message 
        };
      }

      if (!user) {
        return { 
          isValid: false, 
          user: null, 
          sessionAge: 0, 
          requiresRefresh: false,
          error: 'No user session found' 
        };
      }

      // Calculate session age
      const sessionAge = Date.now() - new Date(user.last_sign_in_at || 0).getTime();
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
      const refreshThreshold = 20 * 60 * 60 * 1000; // 20 hours

      // Generate device fingerprint for additional security
      const deviceFingerprint = this.generateDeviceFingerprint();

      // Check for session hijacking indicators
      await this.detectSessionAnomalies(user.id, deviceFingerprint);

      if (sessionAge > maxSessionAge) {
        await this.logCriticalSecurityEvent('session_expired', { 
          sessionAge, 
          userId: user.id,
          deviceFingerprint 
        });
        return { 
          isValid: false, 
          user: null, 
          sessionAge, 
          requiresRefresh: false,
          error: 'Session expired' 
        };
      }

      const requiresRefresh = sessionAge > refreshThreshold;

      return { 
        isValid: true, 
        user, 
        deviceFingerprint,
        sessionAge, 
        requiresRefresh 
      };
    } catch (error: any) {
      console.error('Critical session validation error:', error);
      await this.logCriticalSecurityEvent('session_validation_exception', { error: error.message });
      return { 
        isValid: false, 
        user: null, 
        sessionAge: 0, 
        requiresRefresh: false,
        error: 'Session validation failed' 
      };
    }
  }

  /**
   * Advanced rate limiting with intelligent threat detection
   */
  static async checkAdvancedRateLimit(
    action: string,
    identifier: string,
    maxRequests: number = 10,
    windowMinutes: number = 15
  ): Promise<{ allowed: boolean; remainingRequests: number; retryAfter?: number; threat?: boolean }> {
    try {
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
      
      // Check current request count
      const { data: requests, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('action', action)
        .eq('identifier', identifier)
        .gte('timestamp', windowStart.toISOString());

      if (error) throw error;

      const currentCount = requests?.length || 0;
      const remaining = Math.max(0, maxRequests - currentCount);

      // Detect potential threats
      const isThreateningSeries = currentCount > maxRequests * 0.8;
      
      if (currentCount >= maxRequests) {
        // Calculate progressive penalty
        const baseBlockDuration = 15 * 60; // 15 minutes
        const multiplier = Math.min(8, Math.floor(currentCount / maxRequests));
        const blockDuration = baseBlockDuration * Math.pow(2, multiplier);
        
        await this.logCriticalSecurityEvent('advanced_rate_limit_exceeded', {
          action,
          identifier,
          requestCount: currentCount,
          blockDuration,
          threat: isThreateningSeries
        });

        // Create or update block
        await supabase
          .from('rate_limit_blocks')
          .upsert({
            action,
            identifier,
            blocked_until: new Date(Date.now() + blockDuration * 1000).toISOString(),
            request_count: currentCount
          });

        return {
          allowed: false,
          remainingRequests: 0,
          retryAfter: blockDuration,
          threat: isThreateningSeries
        };
      }

      // Log the request
      await supabase
        .from('rate_limits')
        .insert({
          action,
          identifier,
          timestamp: new Date().toISOString()
        });

      return {
        allowed: true,
        remainingRequests: remaining - 1,
        threat: isThreateningSeries
      };

    } catch (error) {
      console.error('Advanced rate limit check failed:', error);
      return {
        allowed: false,
        remainingRequests: 0,
        retryAfter: 60
      };
    }
  }

  /**
   * Generate device fingerprint for session security
   */
  private static generateDeviceFingerprint(): string {
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
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      canvas: canvas.toDataURL(),
      plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
      touch: 'ontouchstart' in window
    };

    return btoa(JSON.stringify(fingerprint)).substring(0, 32);
  }

  /**
   * Detect session anomalies and potential hijacking
   */
  private static async detectSessionAnomalies(userId: string, fingerprint: string): Promise<void> {
    try {
      // Store current fingerprint for comparison
      const storageKey = `device_fingerprint_${userId}`;
      const storedFingerprint = localStorage.getItem(storageKey);
      
      if (storedFingerprint && storedFingerprint !== fingerprint) {
        await this.logCriticalSecurityEvent('potential_session_hijacking', {
          userId,
          oldFingerprint: storedFingerprint.substring(0, 8) + '...',
          newFingerprint: fingerprint.substring(0, 8) + '...'
        });
      }
      
      localStorage.setItem(storageKey, fingerprint);
    } catch (error) {
      console.error('Session anomaly detection failed:', error);
    }
  }

  /**
   * Log critical security events with enhanced details
   */
  private static async logCriticalSecurityEvent(
    eventType: string,
    details: Record<string, any>,
    severity: 'medium' | 'high' | 'critical' = 'high'
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('security_logs')
        .insert({
          event_type: eventType,
          severity,
          details: {
            ...details,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            referrer: document.referrer
          },
          user_id: user?.id || null,
          user_agent: navigator.userAgent,
          fingerprint: this.generateDeviceFingerprint()
        });
    } catch (error) {
      console.error('Failed to log critical security event:', error);
      // Fallback to console logging for debugging
      console.warn(`SECURITY EVENT [${severity}]: ${eventType}`, details);
    }
  }
}