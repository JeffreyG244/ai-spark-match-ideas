
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

export interface SecurityValidationResult {
  isValid: boolean;
  sanitized?: string;
  errors: string[];
  warnings: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: Date;
  retryAfter?: number;
}

export class EnhancedSecurityService {
  private static readonly DANGEROUS_PATTERNS = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
    /@import/gi,
    /expression\s*\(/gi,
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/gi,
    /\.\.\//g,
    /[;&|`$(){}[\]]/g,
  ];

  private static readonly INAPPROPRIATE_PATTERNS = [
    /contact.*me.*at/i,
    /instagram|snapchat|whatsapp|telegram/i,
    /money|bitcoin|crypto|investment/i,
    /cashapp|venmo|paypal/i,
    /\b\d{10,}\b/g, // Phone numbers
    /@\w+\.(com|net|org)/gi, // Email addresses
  ];

  private static readonly MAX_LENGTHS = {
    BIO: 500,
    MESSAGE: 1000,
    VALUES: 300,
    GOALS: 300,
    GREEN_FLAGS: 300,
  };

  /**
   * Comprehensive input validation and sanitization
   */
  static async validateAndSanitizeInput(
    input: string,
    contentType: 'bio' | 'message' | 'values' | 'goals' | 'greenFlags' | 'general',
    maxLength?: number
  ): Promise<SecurityValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        errors: ['Invalid input type'],
        warnings: [],
        riskLevel: 'medium'
      };
    }

    // Length validation
    const limit = maxLength || this.MAX_LENGTHS[contentType.toUpperCase() as keyof typeof this.MAX_LENGTHS] || 1000;
    if (input.length > limit) {
      errors.push(`Content exceeds maximum length of ${limit} characters`);
      riskLevel = 'medium';
    }

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(input)) {
        errors.push('Content contains potentially dangerous patterns');
        riskLevel = 'critical';
        await this.logSecurityEvent('dangerous_content_detected', {
          contentType,
          pattern: pattern.source.substring(0, 50),
          inputLength: input.length
        }, 'critical');
        break;
      }
    }

    // Check for inappropriate content
    for (const pattern of this.INAPPROPRIATE_PATTERNS) {
      if (pattern.test(input)) {
        warnings.push('Content may contain inappropriate contact information');
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    }

    // Sanitize input
    let sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false
    });

    // Additional character encoding
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return {
      isValid: errors.length === 0,
      sanitized,
      errors,
      warnings,
      riskLevel
    };
  }

  /**
   * Enhanced rate limiting with progressive penalties
   */
  static async checkRateLimit(
    action: string,
    identifier: string,
    maxRequests: number = 60,
    windowMinutes: number = 60
  ): Promise<RateLimitResult> {
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
      const resetTime = new Date(Date.now() + windowMinutes * 60 * 1000);

      // Check if rate limit exceeded
      if (currentCount >= maxRequests) {
        // Check for existing block
        const { data: block } = await supabase
          .from('rate_limit_blocks')
          .select('*')
          .eq('action', action)
          .eq('identifier', identifier)
          .gt('blocked_until', new Date().toISOString())
          .single();

        if (block) {
          return {
            allowed: false,
            remainingRequests: 0,
            resetTime,
            retryAfter: Math.ceil((new Date(block.blocked_until).getTime() - Date.now()) / 1000)
          };
        }

        // Create new block with progressive penalty
        const blockDuration = Math.min(3600, 300 * Math.pow(2, Math.floor(currentCount / maxRequests)));
        const blockedUntil = new Date(Date.now() + blockDuration * 1000);

        await supabase
          .from('rate_limit_blocks')
          .insert({
            action,
            identifier,
            blocked_until: blockedUntil.toISOString(),
            request_count: currentCount
          });

        await this.logSecurityEvent('rate_limit_exceeded', {
          action,
          identifier,
          requestCount: currentCount,
          blockDuration
        }, 'high');

        return {
          allowed: false,
          remainingRequests: 0,
          resetTime,
          retryAfter: blockDuration
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
        resetTime
      };

    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open with conservative limits
      return {
        allowed: true,
        remainingRequests: 5,
        resetTime: new Date(Date.now() + 60 * 1000)
      };
    }
  }

  /**
   * Enhanced password validation
   */
  static validatePasswordStrength(password: string): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (!password) {
      return {
        isValid: false,
        errors: ['Password is required'],
        warnings: [],
        riskLevel: 'high'
      };
    }

    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
      riskLevel = 'high';
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long');
      riskLevel = 'medium';
    }

    // Character type checks
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const characterTypes = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    
    if (characterTypes < 3) {
      errors.push('Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, special characters');
      riskLevel = 'high';
    }

    // Common password check
    const commonPasswords = [
      'password', '12345678', 'qwerty123', 'password1', 'password123',
      'admin123', 'welcome123', 'letmein123', 'monkey123', 'dragon123'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a stronger password.');
      riskLevel = 'critical';
    }

    // Pattern checks
    if (/^(.)\1+$/.test(password)) {
      errors.push('Password cannot be all the same character');
      riskLevel = 'high';
    }

    if (/(.)\1{2,}/.test(password)) {
      warnings.push('Avoid repeating the same character multiple times');
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel
    };
  }

  /**
   * File upload validation
   */
  static validateFileUpload(file: File): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
      riskLevel = 'high';
    }

    // File size validation (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File too large. Maximum size is 5MB');
      riskLevel = 'medium';
    }

    if (file.size === 0) {
      errors.push('File is empty');
      riskLevel = 'medium';
    }

    // Filename validation
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com)$/i,
      /[<>:"|?*]/,
      /\.\./,
      /^\./, // Hidden files
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      errors.push('Suspicious filename detected');
      riskLevel = 'critical';
    }

    if (file.name.length > 255) {
      errors.push('Filename too long');
      riskLevel = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel
    };
  }

  /**
   * Log security events
   */
  private static async logSecurityEvent(
    eventType: string,
    details: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('security_logs')
        .insert({
          event_type: eventType,
          severity,
          details,
          user_id: user?.id || null,
          ip_address: null, // Will be populated by database trigger if available
          user_agent: navigator.userAgent,
          session_id: null, // Could be enhanced with session tracking
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Check user authentication and session validity
   */
  static async validateSession(): Promise<{ isValid: boolean; user: any; error?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        await this.logSecurityEvent('session_validation_failed', { error: error.message }, 'medium');
        return { isValid: false, user: null, error: error.message };
      }

      if (!user) {
        return { isValid: false, user: null, error: 'No user session found' };
      }

      // Check if session is recent (within last 24 hours)
      const sessionAge = Date.now() - new Date(user.last_sign_in_at || 0).getTime();
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > maxSessionAge) {
        await this.logSecurityEvent('session_expired', { sessionAge, userId: user.id }, 'medium');
        return { isValid: false, user: null, error: 'Session expired' };
      }

      return { isValid: true, user };
    } catch (error) {
      console.error('Session validation error:', error);
      return { isValid: false, user: null, error: 'Session validation failed' };
    }
  }
}
