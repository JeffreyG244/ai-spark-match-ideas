
import { supabase } from '@/integrations/supabase/client';
import { SecurityCoreService } from '@/services/security/SecurityCoreService';

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
  securityScore?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
  retryAfter?: number;
}

export const sanitizeUserInput = (
  input: string, 
  allowFormatting: boolean = false
): SecurityValidationResult => {
  const errors: string[] = [];
  let sanitizedValue = input;
  let securityScore = 100;

  // Basic validation
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      errors: ['Input must be a valid string'],
      sanitizedValue: ''
    };
  }

  // Length validation
  if (input.length > 10000) {
    errors.push('Input too long (max 10,000 characters)');
    sanitizedValue = input.substring(0, 10000);
    securityScore -= 20;
  }

  // XSS prevention - remove dangerous HTML/JS
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitizedValue)) {
      sanitizedValue = sanitizedValue.replace(pattern, '');
      errors.push('Potentially malicious content removed');
      securityScore -= 30;
    }
  }

  // SQL injection prevention
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /'(\s*;\s*|\s*--|\s*\/\*)/gi,
    /(\|\||&&)/g
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(sanitizedValue)) {
      errors.push('Potential SQL injection attempt detected');
      securityScore -= 40;
    }
  }

  // If formatting is not allowed, strip all HTML
  if (!allowFormatting) {
    sanitizedValue = sanitizedValue.replace(/<[^>]*>/g, '');
  } else {
    // Allow only safe HTML tags
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br'];
    const tagPattern = /<(\/?)([\w]+)[^>]*>/g;
    
    sanitizedValue = sanitizedValue.replace(tagPattern, (match, slash, tag) => {
      if (allowedTags.includes(tag.toLowerCase())) {
        return `<${slash}${tag.toLowerCase()}>`;
      }
      return '';
    });
  }

  // Character encoding normalization
  try {
    sanitizedValue = sanitizedValue.normalize('NFKC');
  } catch (error) {
    errors.push('Character encoding normalization failed');
    securityScore -= 10;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue,
    securityScore: Math.max(0, securityScore)
  };
};

export const validatePasswordSecurity = (password: string): SecurityValidationResult => {
  const errors: string[] = [];
  let securityScore = 100;

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
      securityScore: 0
    };
  }

  // Length requirements
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
    securityScore -= 30;
  }

  if (password.length < 12) {
    securityScore -= 10;
  }

  // Character diversity
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const characterTypes = [hasUpper, hasLower, hasNumbers, hasSpecial].filter(Boolean).length;
  
  if (characterTypes < 3) {
    errors.push('Password must contain at least 3 different character types (uppercase, lowercase, numbers, special characters)');
    securityScore -= 25;
  }

  // Common patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password contains too many repeated characters');
    securityScore -= 20;
  }

  if (/123|abc|qwe/i.test(password)) {
    errors.push('Password contains common sequences');
    securityScore -= 15;
  }

  return {
    isValid: errors.length === 0 && securityScore >= 60,
    errors,
    securityScore: Math.max(0, securityScore)
  };
};

export const checkEnhancedRateLimit = async (
  action: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return checkAnonymousRateLimit(action, maxRequests, windowSeconds);
    }

    // Use the existing secure rate limiting function
    const { data: allowed, error } = await supabase
      .rpc('secure_rate_limit_check', {
        p_user_id: user.id,
        p_action: action,
        p_max_requests: maxRequests,
        p_window_seconds: windowSeconds
      });

    if (error) {
      console.error('Rate limit check error:', error);
      await SecurityCoreService.logSecurityEvent(
        'rate_limit_check_failed',
        { action, error: error.message },
        'medium'
      );
      return { allowed: false };
    }

    if (!allowed) {
      await SecurityCoreService.logSecurityEvent(
        'rate_limit_exceeded',
        { action, maxRequests, windowSeconds },
        'medium'
      );
    }

    return { allowed: allowed || false };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return { allowed: false };
  }
};

const checkAnonymousRateLimit = async (
  action: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> => {
  try {
    const identifier = SecurityCoreService.getAnonymousIdentifier();
    const windowStart = new Date(Date.now() - windowSeconds * 1000);
    
    const rateLimitKey = `rate_limit_${identifier}_${action}`;
    const stored = localStorage.getItem(rateLimitKey);
    const requests = stored ? JSON.parse(stored) : [];
    
    const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart.getTime());
    
    if (recentRequests.length >= maxRequests) {
      await SecurityCoreService.logSecurityEvent(
        'anonymous_rate_limit_exceeded',
        { action, identifier, requestCount: recentRequests.length },
        'medium'
      );
      return { 
        allowed: false, 
        remainingRequests: 0,
        retryAfter: Math.ceil(windowSeconds - (Date.now() - Math.min(...recentRequests)) / 1000)
      };
    }

    recentRequests.push(Date.now());
    localStorage.setItem(rateLimitKey, JSON.stringify(recentRequests));

    return { 
      allowed: true, 
      remainingRequests: maxRequests - recentRequests.length - 1 
    };
  } catch (error) {
    console.error('Anonymous rate limiting error:', error);
    return { allowed: false };
  }
};

export const validateSessionSecurity = async (): Promise<{
  isValid: boolean;
  requiresRefresh: boolean;
  reason?: string;
}> => {
  return SecurityCoreService.validateSessionSecurity();
};

export const validateAdminAction = async (actionType: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      await SecurityCoreService.logSecurityEvent(
        'unauthorized_admin_action_attempt',
        { actionType, reason: 'No user session' },
        'high'
      );
      return false;
    }

    // Check if user has admin role using the RLS-compliant function
    const { data: hasAdminRole, error } = await supabase
      .rpc('has_role', {
        check_user_id: user.id,
        required_role: 'admin'
      });

    if (error) {
      console.error('Admin role check failed:', error);
      await SecurityCoreService.logSecurityEvent(
        'admin_role_check_failed',
        { actionType, error: error.message },
        'high'
      );
      return false;
    }

    if (!hasAdminRole) {
      await SecurityCoreService.logSecurityEvent(
        'unauthorized_admin_action_attempt',
        { actionType, userId: user.id },
        'high'
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Admin action validation failed:', error);
    await SecurityCoreService.logSecurityEvent(
      'admin_action_validation_error',
      { actionType, error: error instanceof Error ? error.message : 'Unknown error' },
      'high'
    );
    return false;
  }
};

export const validateFileUpload = (file: File): SecurityValidationResult => {
  const errors: string[] = [];
  let securityScore = 100;

  // File size validation (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size exceeds 10MB limit');
    securityScore -= 40;
  }

  // File type validation
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed. Only images are permitted.');
    securityScore -= 50;
  }

  // File name validation
  const dangerousExtensions = /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|php|asp|jsp)$/i;
  if (dangerousExtensions.test(file.name)) {
    errors.push('Dangerous file extension detected');
    securityScore -= 60;
  }

  // File name length
  if (file.name.length > 255) {
    errors.push('File name too long');
    securityScore -= 20;
  }

  return {
    isValid: errors.length === 0,
    errors,
    securityScore: Math.max(0, securityScore)
  };
};
