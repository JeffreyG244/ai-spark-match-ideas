import { useState, useCallback } from 'react';
import { CriticalSecurityService } from '@/services/security/CriticalSecurityService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
export const useSecureValidation = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    /**
     * Comprehensive secure validation for user inputs
     */
    const validateSecureInput = useCallback(async (input, contentType = 'general', maxLength = 1000) => {
        try {
            const result = await CriticalSecurityService.validateCriticalInput(input, contentType, maxLength);
            return {
                isValid: result.isValid,
                sanitized: result.sanitized,
                errors: result.errors,
                riskLevel: result.riskLevel,
                blocked: result.blockedReasons && result.blockedReasons.length > 0
            };
        }
        catch (error) {
            console.error('Secure input validation failed:', error);
            return {
                isValid: false,
                errors: ['Validation service unavailable'],
                riskLevel: 'medium'
            };
        }
    }, []);
    /**
     * Execute actions with comprehensive security checks
     */
    const secureAction = useCallback(async (action, options = {}) => {
        try {
            setLoading(true);
            // Authentication check
            if (options.requireAuth !== false && !user) {
                toast({
                    title: 'Authentication Required',
                    description: 'Please log in to perform this action.',
                    variant: 'destructive'
                });
                return {
                    success: false,
                    error: 'Authentication required'
                };
            }
            // Session validation
            if (user) {
                const sessionData = await CriticalSecurityService.validateSecureSession();
                if (!sessionData.isValid) {
                    toast({
                        title: 'Session Invalid',
                        description: 'Your session has expired. Please log in again.',
                        variant: 'destructive'
                    });
                    return {
                        success: false,
                        error: 'Session expired'
                    };
                }
            }
            // Content validation if provided
            if (options.contentValidation) {
                const validation = await validateSecureInput(options.contentValidation.input, options.contentValidation.type, options.contentValidation.maxLength);
                if (!validation.isValid) {
                    setValidationErrors(prev => ({
                        ...prev,
                        [options.contentValidation.type]: validation.errors
                    }));
                    if (validation.blocked) {
                        toast({
                            title: 'Content Blocked',
                            description: 'Your content was blocked for security reasons.',
                            variant: 'destructive'
                        });
                        return {
                            success: false,
                            error: 'Content blocked by security filters',
                            blocked: true
                        };
                    }
                    toast({
                        title: 'Content Validation Failed',
                        description: validation.errors[0] || 'Please check your input.',
                        variant: 'destructive'
                    });
                    return {
                        success: false,
                        error: validation.errors[0]
                    };
                }
            }
            // Rate limiting check
            if (options.rateLimitAction) {
                const identifier = user?.id || 'anonymous';
                const rateLimitResult = await CriticalSecurityService.checkAdvancedRateLimit(options.rateLimitAction, identifier, options.maxRequests, options.windowMinutes);
                if (!rateLimitResult.allowed) {
                    const retryMinutes = rateLimitResult.retryAfter ? Math.ceil(rateLimitResult.retryAfter / 60) : 5;
                    toast({
                        title: 'Rate Limit Exceeded',
                        description: `Too many requests. Please wait ${retryMinutes} minutes before trying again.`,
                        variant: 'destructive'
                    });
                    if (rateLimitResult.threat) {
                        toast({
                            title: 'Security Alert',
                            description: 'Unusual activity detected. Your account may be under review.',
                            variant: 'destructive'
                        });
                    }
                    return {
                        success: false,
                        error: `Rate limit exceeded. Retry after ${retryMinutes} minutes.`,
                        blocked: true
                    };
                }
                if (rateLimitResult.threat) {
                    toast({
                        title: 'Warning',
                        description: 'You are approaching rate limits. Please slow down.',
                    });
                }
            }
            // Execute the action
            const result = await action();
            // Clear any previous validation errors on success
            setValidationErrors({});
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            console.error('Secure action failed:', error);
            toast({
                title: 'Action Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive'
            });
            return {
                success: false,
                error: error.message || 'Action failed'
            };
        }
        finally {
            setLoading(false);
        }
    }, [user, validateSecureInput]);
    /**
     * Batch validation for multiple inputs
     */
    const validateMultipleInputs = useCallback(async (inputs) => {
        const errors = {};
        let hasBlocked = false;
        for (const input of inputs) {
            const validation = await validateSecureInput(input.value, input.type, input.maxLength);
            if (!validation.isValid) {
                errors[input.fieldName] = validation.errors;
                if (validation.blocked) {
                    hasBlocked = true;
                }
            }
        }
        setValidationErrors(errors);
        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            hasBlocked
        };
    }, [validateSecureInput]);
    /**
     * Clear validation errors for a specific field
     */
    const clearValidationErrors = useCallback((fieldName) => {
        if (fieldName) {
            setValidationErrors(prev => {
                const updated = { ...prev };
                delete updated[fieldName];
                return updated;
            });
        }
        else {
            setValidationErrors({});
        }
    }, []);
    return {
        validateSecureInput,
        secureAction,
        validateMultipleInputs,
        clearValidationErrors,
        loading,
        validationErrors,
        isAuthenticated: !!user
    };
};
