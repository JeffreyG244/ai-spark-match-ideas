import { supabase } from '@/integrations/supabase/client';
import { CriticalSecurityService } from '@/services/security/CriticalSecurityService';
/**
 * Enhanced password security validation
 */
export const validatePasswordSecurity = (password) => {
    const errors = [];
    const suggestions = [];
    let score = 100;
    if (!password || password.length < 12) {
        errors.push('Password must be at least 12 characters long');
        suggestions.push('Use at least 12 characters');
        score -= 30;
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
        suggestions.push('Add uppercase letters');
        score -= 20;
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
        suggestions.push('Add lowercase letters');
        score -= 20;
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
        suggestions.push('Add numbers');
        score -= 15;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
        suggestions.push('Add special characters');
        score -= 15;
    }
    const finalScore = Math.max(0, score);
    return {
        isValid: errors.length === 0,
        errors,
        score: finalScore,
        securityScore: finalScore,
        suggestions
    };
};
/**
 * Enhanced user input sanitization
 */
export const sanitizeUserInput = (input, allowFormatting = false) => {
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
export const checkEnhancedRateLimit = async (action, maxRequests = 10, windowSeconds = 60) => {
    try {
        const result = await CriticalSecurityService.checkAdvancedRateLimit(action, 'user', maxRequests, Math.floor(windowSeconds / 60));
        return {
            allowed: result.allowed,
            remainingRequests: result.remainingRequests,
            retryAfter: result.retryAfter
        };
    }
    catch (error) {
        return { allowed: false };
    }
};
/**
 * Session security validation
 */
export const validateSessionSecurity = async () => {
    try {
        const sessionData = await CriticalSecurityService.validateSecureSession();
        return {
            isValid: sessionData.isValid,
            requiresRefresh: sessionData.requiresRefresh,
            error: sessionData.error
        };
    }
    catch (error) {
        return {
            isValid: false,
            requiresRefresh: false,
            error: error.message || 'Session validation failed'
        };
    }
};
export const validateAdminAction = async (actionType) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user)
            return false;
        const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
        return userRoles?.some(role => role.role === 'admin' || role.role === 'super_admin') || false;
    }
    catch (error) {
        return false;
    }
};
export const validateFileUpload = (file) => {
    const errors = [];
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
