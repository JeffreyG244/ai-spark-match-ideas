
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

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

// Enhanced password validation with stricter requirements
export const validatePasswordSecurity = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

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

  // Check against common compromised passwords
  const commonPasswords = [
    'password', '123456789', 'password123', 'admin123', 'welcome123',
    'qwerty123', 'password!', 'Password1', 'letmein123'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password has been found in data breaches. Please choose a different password.');
    score = Math.max(0, score - 50);
  }

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

  // Check for malicious patterns
  const maliciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\s*\(/gi
  ];

  if (maliciousPatterns.some(pattern => pattern.test(input))) {
    errors.push('Input contains potentially dangerous content');
    return { isValid: false, errors };
  }

  // Sanitize the input
  const sanitizedValue = allowBasicFormatting 
    ? DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: []
      })
    : DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
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
      // Anonymous rate limiting
      return checkAnonymousRateLimit(action, maxRequests, windowSeconds);
    }

    // Use the enhanced rate limiting function from the database
    const { data: allowed, error } = await supabase
      .rpc('enhanced_rate_limit_check', {
        p_user_id: user.id,
        p_action: action,
        p_max_requests: maxRequests,
        p_window_seconds: windowSeconds
      });

    if (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: false };
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

    // Check if user has admin role
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
      // Log unauthorized admin action attempt
      await supabase.from('security_logs').insert({
        user_id: user.id,
        event_type: 'unauthorized_admin_action_attempt',
        severity: 'high',
        details: {
          attempted_action: actionType,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
      
      return false;
    }

    return true;
  } catch (error) {
    console.error('Admin validation error:', error);
    return false;
  }
};

// Content security validation
export const validateFileUpload = (file: File): SecurityValidationResult => {
  const errors: string[] = [];
  
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size must be less than 10MB');
  }
  
  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed. Only JPEG, PNG, WebP, and GIF files are supported.');
  }
  
  // Check file name for malicious patterns
  const fileName = file.name.toLowerCase();
  const maliciousExtensions = ['.exe', '.bat', '.com', '.scr', '.vbs', '.js', '.jar'];
  
  if (maliciousExtensions.some(ext => fileName.endsWith(ext))) {
    errors.push('File type not allowed for security reasons');
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
    
    // Session expired
    if (timeUntilExpiry <= 0) {
      return {
        isValid: false,
        requiresRefresh: false,
        errors: ['Session expired']
      };
    }
    
    // Session expires soon (within 5 minutes)
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
