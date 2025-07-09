import { supabase } from '@/integrations/supabase/client';
import { CriticalSecurityService } from '@/services/security/CriticalSecurityService';

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
  retryAfter?: number;
}

export interface SessionValidationResult {
  isValid: boolean;
  requiresRefresh: boolean;
  error?: string;
}

/**
 * Enhanced password security validation
 */
export const validatePasswordSecurity = (password: string): SecurityValidationResult => {
  const errors: string[] = [];
  
  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Enhanced user input sanitization
 */
export const sanitizeUserInput = (
  input: string, 
  allowFormatting: boolean = false
): SecurityValidationResult => {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      errors: ['Invalid input'],
      sanitizedValue: ''
    };
  }

  let sanitized = input.trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  if (!allowFormatting) {
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  return {
    isValid: true,
    errors: [],
    sanitizedValue: sanitized
  };
};

/**
 * Enhanced rate limiting check
 */
export const checkEnhancedRateLimit = async (
  action: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> => {
  try {
    const result = await CriticalSecurityService.checkAdvancedRateLimit(
      action,
      'user',
      maxRequests,
      Math.floor(windowSeconds / 60)
    );
    
    return {
      allowed: result.allowed,
      remainingRequests: result.remainingRequests,
      retryAfter: result.retryAfter
    };
  } catch (error) {
    return { allowed: false };
  }
};

/**
 * Session security validation
 */
export const validateSessionSecurity = async (): Promise<SessionValidationResult> => {
  try {
    const sessionData = await CriticalSecurityService.validateSecureSession();
    
    return {
      isValid: sessionData.isValid,
      requiresRefresh: sessionData.requiresRefresh,
      error: sessionData.error
    };
  } catch (error: any) {
    return {
      isValid: false,
      requiresRefresh: false,
      error: error.message || 'Session validation failed'
    };
  }
};

export const validateAdminAction = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    return userRoles?.some(role => 
      role.role === 'admin' || role.role === 'super_admin'
    ) || false;
  } catch (error) {
    return false;
  }
};

export const validateFileUpload = (file: File): SecurityValidationResult => {
  const errors: string[] = [];
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
  }
  
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File too large. Maximum size is 5MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};