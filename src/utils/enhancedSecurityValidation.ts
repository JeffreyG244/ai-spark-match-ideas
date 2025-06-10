import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';
import { validatePasswordAgainstLeaks, logCriticalSecurityEvent } from './criticalSecurityFixes';

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number;
  suggestions: string[];
}

// Enhanced password validation with critical security fixes
export const validatePasswordSecurity = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // First check critical security issues
  const criticalValidation = validatePasswordAgainstLeaks(password);
  
  if (!criticalValidation.isSecure) {
    errors.push(...criticalValidation.vulnerabilities);
    suggestions.push(...criticalValidation.recommendations);
    score = Math.max(0, criticalValidation.securityScore);
    
    // Log critical security issue
    logCriticalSecurityEvent(
      'weak_password_detected',
      {
        vulnerabilities: criticalValidation.vulnerabilities,
        security_score: criticalValidation.securityScore
      },
      'high'
    );
    
    return {
      isValid: false,
      errors,
      score,
      suggestions
    };
  }

  // Basic validation checks
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 20;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
    suggestions.push('Add uppercase letters (A-Z)');
  } else {
    score += 20;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
    suggestions.push('Add lowercase letters (a-z)');
  } else {
    score += 20;
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
    suggestions.push('Add numbers (0-9)');
  } else {
    score += 20;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
    suggestions.push('Add special characters (!@#$%^&*(),.?":{}|<>)');
  } else {
    score += 20;
  }

  // Use the critical security score if it's higher
  score = Math.max(score, criticalValidation.securityScore);

  return {
    isValid: errors.length === 0 && score >= 80,
    errors,
    score,
    suggestions
  };
};

// Enhanced input sanitization with XSS protection
export const sanitizeUserInput = (input: string, allowBasicFormatting = false): SecurityValidationResult => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, errors: ['Invalid input type'] };
  }

  const errors: string[] = [];

  // Check for extremely long input
  if (input.length > 10000) {
    errors.push('Input is too long');
  }

  // Enhanced malicious pattern detection
  const maliciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    /eval\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi
  ];

  if (maliciousPatterns.some(pattern => pattern.test(input))) {
    errors.push('Input contains potentially dangerous content');
    
    // Log critical XSS attempt
    logCriticalSecurityEvent(
      'xss_attempt_detected',
      {
        input_sample: input.substring(0, 100),
        patterns_matched: maliciousPatterns.filter(pattern => pattern.test(input)).length
      },
      'critical'
    );
    
    return { isValid: false, errors };
  }

  // Sanitize the input with stricter rules
  const sanitizedValue = allowBasicFormatting 
    ? DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: [],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      })
    : DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      });

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue
  };
};

// Enhanced rate limiting with user context
export const checkEnhancedRateLimit = async (
  action: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remainingRequests?: number; retryAfter?: number }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return checkAnonymousRateLimit(action, maxRequests, windowSeconds);
    }

    // Use the existing secure_rate_limit_check function with enhanced logging
    const { data: allowed, error } = await supabase
      .rpc('secure_rate_limit_check', {
        p_user_id: user.id,
        p_action: action,
        p_max_requests: maxRequests,
        p_window_seconds: windowSeconds
      });

    if (error) {
      console.error('Rate limit check failed:', error);
      // Log the rate limit failure as a security event
      await logCriticalSecurityEvent(
        'rate_limit_check_failure',
        {
          action,
          error: error.message,
          user_id: user.id
        },
        'medium'
      );
      return { allowed: false };
    }

    // Log if rate limit exceeded
    if (!allowed) {
      await logCriticalSecurityEvent(
        'rate_limit_exceeded',
        {
          action,
          user_id: user.id,
          max_requests: maxRequests,
          window_seconds: windowSeconds
        },
        'medium'
      );
    }

    return { allowed: allowed || false };
  } catch (error) {
    console.error('Enhanced rate limit error:', error);
    return { allowed: false };
  }
};

const checkAnonymousRateLimit = (
  action: string,
  maxRequests: number,
  windowSeconds: number
): { allowed: boolean; remainingRequests?: number; retryAfter?: number } => {
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);
  const key = `rate_limit_${action}`;
  
  const stored = localStorage.getItem(key);
  const requests = stored ? JSON.parse(stored) : [];
  
  // Filter out old requests
  const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart);
  
  if (recentRequests.length >= maxRequests) {
    const oldestRequest = Math.min(...recentRequests);
    const retryAfter = Math.ceil((oldestRequest + (windowSeconds * 1000) - now) / 1000);
    return { allowed: false, remainingRequests: 0, retryAfter };
  }
  
  // Add current request
  recentRequests.push(now);
  localStorage.setItem(key, JSON.stringify(recentRequests));
  
  return {
    allowed: true,
    remainingRequests: maxRequests - recentRequests.length
  };
};

// Admin action validation
export const validateAdminAction = async (actionType: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data: hasAdminRole, error } = await supabase
      .rpc('has_role', {
        check_user_id: user.id,
        required_role: 'admin'
      });

    if (error) {
      console.error('Admin role check failed:', error);
      return false;
    }

    if (!hasAdminRole) {
      await logCriticalSecurityEvent(
        'unauthorized_admin_attempt',
        {
          attempted_action: actionType,
          user_id: user.id,
          user_agent: navigator.userAgent
        },
        'critical'
      );
      
      return false;
    }

    // Log successful admin action
    await logCriticalSecurityEvent(
      'admin_action_authorized',
      {
        action_type: actionType,
        user_id: user.id
      },
      'low'
    );

    return true;
  } catch (error) {
    console.error('Admin validation error:', error);
    return false;
  }
};

// Content security validation
export const validateFileUpload = (file: File): SecurityValidationResult => {
  const errors: string[] = [];
  
  // Check file size (5MB limit for security)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size must be less than 5MB');
  }
  
  // Stricter file type checking
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed. Only JPEG, PNG, and WebP files are supported.');
  }
  
  // Enhanced file name security
  const fileName = file.name.toLowerCase();
  const maliciousExtensions = [
    '.exe', '.bat', '.com', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.jsp', '.py', '.rb', '.pl', '.sh'
  ];
  
  if (maliciousExtensions.some(ext => fileName.endsWith(ext))) {
    errors.push('File type not allowed for security reasons');
    
    // Log malicious file upload attempt
    logCriticalSecurityEvent(
      'malicious_file_upload_attempt',
      {
        filename: file.name,
        file_type: file.type,
        file_size: file.size
      },
      'high'
    );
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Session security validation
export const validateSessionSecurity = async (): Promise<{
  isValid: boolean;
  requiresRefresh: boolean;
  errors: string[];
}> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        isValid: false,
        requiresRefresh: false,
        errors: ['Session validation failed']
      };
    }
    
    if (!session) {
      return {
        isValid: false,
        requiresRefresh: false,
        errors: ['No active session']
      };
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry <= 0) {
      return {
        isValid: false,
        requiresRefresh: false,
        errors: ['Session expired']
      };
    }
    
    if (timeUntilExpiry < 300) {
      return {
        isValid: true,
        requiresRefresh: true,
        errors: ['Session expires soon']
      };
    }
    
    return {
      isValid: true,
      requiresRefresh: false,
      errors: []
    };
  } catch (error) {
    return {
      isValid: false,
      requiresRefresh: false,
      errors: ['Session validation error']
    };
  }
};
