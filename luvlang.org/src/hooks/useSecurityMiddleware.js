import { useState, useCallback } from 'react';
import { RateLimitingService } from '@/services/security/RateLimitingService';
import { SecurityAuditService } from '@/services/security/SecurityAuditService';
import { ValidationService } from '@/services/security/ValidationService';
import { useAuth } from '@/hooks/useAuth';
export const useSecurityMiddleware = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const checkRateLimit = useCallback(async (endpoint) => {
        try {
            setLoading(true);
            const result = await RateLimitingService.checkRateLimit(endpoint);
            if (!result.allowed) {
                return {
                    allowed: false,
                    reason: 'Rate limit exceeded. Please wait before making more requests.',
                    remainingRequests: result.remainingRequests
                };
            }
            return {
                allowed: true,
                remainingRequests: result.remainingRequests
            };
        }
        catch (error) {
            console.error('Rate limit check failed:', error);
            await SecurityAuditService.logSecurityEvent('rate_limit_check_failed', `Rate limit check failed for ${endpoint}: ${error}`, 'medium');
            return { allowed: false, reason: 'Security check failed' };
        }
        finally {
            setLoading(false);
        }
    }, []);
    const validateContent = useCallback(async (content, contentType) => {
        try {
            if (!user) {
                return { allowed: false, reason: 'Authentication required' };
            }
            const result = await ValidationService.validateMessageContent(content);
            if (!result.isValid) {
                return {
                    allowed: false,
                    reason: result.error
                };
            }
            return { allowed: true };
        }
        catch (error) {
            console.error('Content validation failed:', error);
            await SecurityAuditService.logSecurityEvent('content_validation_failed', `Content validation failed: ${error}`, 'medium');
            return { allowed: false, reason: 'Content validation failed' };
        }
    }, [user]);
    const secureAction = useCallback(async (action, options = {}) => {
        try {
            setLoading(true);
            if (options.requireAuth !== false && !user) {
                await SecurityAuditService.logSecurityEvent('unauthorized_action_attempt', {
                    endpoint: options.endpoint,
                    content_type: options.contentType
                }, 'medium');
                return {
                    success: false,
                    error: 'Authentication required'
                };
            }
            if (options.endpoint) {
                const rateLimitResult = await checkRateLimit(options.endpoint);
                if (!rateLimitResult.allowed) {
                    return {
                        success: false,
                        error: rateLimitResult.reason
                    };
                }
            }
            if (options.content && options.contentType) {
                const contentResult = await validateContent(options.content, options.contentType);
                if (!contentResult.allowed) {
                    return {
                        success: false,
                        error: contentResult.reason
                    };
                }
            }
            const result = await action();
            if (options.endpoint && user) {
                await SecurityAuditService.logSecurityEvent('secure_action_completed', {
                    endpoint: options.endpoint,
                    content_type: options.contentType,
                    user_id: user.id,
                    action_success: true
                }, 'low');
            }
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            console.error('Secure action failed:', error);
            if (options.endpoint) {
                await SecurityAuditService.logSecurityEvent('secure_action_failed', {
                    endpoint: options.endpoint,
                    user_id: user?.id,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }, 'medium');
            }
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Action failed'
            };
        }
        finally {
            setLoading(false);
        }
    }, [checkRateLimit, validateContent, user]);
    return {
        loading,
        checkRateLimit,
        validateContent,
        secureAction,
        isAuthenticated: !!user
    };
};
