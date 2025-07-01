
import { useState, useCallback } from 'react';
import { EnhancedSecurityService } from '@/services/security/EnhancedSecurityService';
import { toast } from './use-toast';

interface SecureFormOptions {
  rateLimitAction: string;
  validateContent?: boolean;
  maxRequests?: number;
  windowMinutes?: number;
}

export const useSecureForm = (options: SecureFormOptions) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const secureSubmit = useCallback(async (
    formData: Record<string, any>,
    submitFn: (data: Record<string, any>) => Promise<any>
  ) => {
    try {
      setIsSubmitting(true);
      setValidationErrors({});

      // Session validation
      const sessionCheck = await EnhancedSecurityService.validateSession();
      if (!sessionCheck.isValid) {
        toast({
          title: 'Session Invalid',
          description: sessionCheck.error || 'Please log in again',
          variant: 'destructive'
        });
        return { success: false, error: 'Session invalid' };
      }

      // Rate limiting check
      const rateLimitResult = await EnhancedSecurityService.checkRateLimit(
        options.rateLimitAction,
        sessionCheck.user.id,
        options.maxRequests,
        options.windowMinutes
      );

      if (!rateLimitResult.allowed) {
        const waitTime = rateLimitResult.retryAfter ? Math.ceil(rateLimitResult.retryAfter / 60) : 5;
        toast({
          title: 'Too Many Requests',
          description: `Please wait ${waitTime} minutes before trying again.`,
          variant: 'destructive'
        });
        return { success: false, error: 'Rate limit exceeded' };
      }

      // Content validation if enabled
      const errors: Record<string, string[]> = {};
      const sanitizedData: Record<string, any> = {};

      if (options.validateContent) {
        for (const [key, value] of Object.entries(formData)) {
          if (typeof value === 'string' && value.trim()) {
            const validation = await EnhancedSecurityService.validateAndSanitizeInput(
              value,
              key as any
            );
            
            if (!validation.isValid) {
              errors[key] = validation.errors;
            } else {
              sanitizedData[key] = validation.sanitized;
            }

            if (validation.warnings.length > 0) {
              toast({
                title: `Warning for ${key}`,
                description: validation.warnings.join(', '),
              });
            }
          } else {
            sanitizedData[key] = value;
          }
        }
      } else {
        Object.assign(sanitizedData, formData);
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast({
          title: 'Validation Failed',
          description: 'Please fix the highlighted errors.',
          variant: 'destructive'
        });
        return { success: false, error: 'Validation failed', validationErrors: errors };
      }

      // Submit the form with sanitized data
      const result = await submitFn(sanitizedData);
      
      toast({
        title: 'Success',
        description: 'Form submitted successfully.',
      });

      return { success: true, data: result };

    } catch (error) {
      console.error('Secure form submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive'
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsSubmitting(false);
    }
  }, [options]);

  const validateField = useCallback(async (
    fieldName: string,
    value: string,
    contentType: 'bio' | 'message' | 'values' | 'goals' | 'greenFlags' | 'general' = 'general'
  ) => {
    if (!value || !value.trim()) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: [] }));
      return { isValid: true };
    }

    const validation = await EnhancedSecurityService.validateAndSanitizeInput(value, contentType);
    
    if (!validation.isValid) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: validation.errors }));
      return { isValid: false, errors: validation.errors };
    }

    setValidationErrors(prev => ({ ...prev, [fieldName]: [] }));
    return { isValid: true, sanitized: validation.sanitized };
  }, []);

  return {
    secureSubmit,
    validateField,
    isSubmitting,
    validationErrors
  };
};
