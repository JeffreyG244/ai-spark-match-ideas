
import { useState, useCallback } from 'react';
import { useSecurityValidation } from './useSecurityValidation';
import { rateLimiter, RATE_LIMITS } from '@/utils/rateLimiter';
import { toast } from './use-toast';

interface SecureFormOptions {
  rateLimitKey: keyof typeof RATE_LIMITS;
  validateContent?: boolean;
}

export const useSecureForm = (options: SecureFormOptions) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateContent } = useSecurityValidation();

  const secureSubmit = useCallback(async (
    formData: Record<string, any>,
    submitFn: (data: Record<string, any>) => Promise<any>
  ) => {
    try {
      // Rate limiting check
      if (!rateLimiter.isAllowed('form_submit', RATE_LIMITS[options.rateLimitKey])) {
        toast({
          title: 'Too Many Requests',
          description: 'Please wait before trying again.',
          variant: 'destructive'
        });
        return { success: false, error: 'Rate limit exceeded' };
      }

      setIsSubmitting(true);

      // Content validation if enabled
      if (options.validateContent) {
        for (const [key, value] of Object.entries(formData)) {
          if (typeof value === 'string' && value.trim()) {
            const validation = await validateContent(value, key);
            if (!validation.allowed) {
              toast({
                title: 'Invalid Content',
                description: `${key}: ${validation.reason}`,
                variant: 'destructive'
              });
              return { success: false, error: validation.reason };
            }
          }
        }
      }

      // Submit the form
      const result = await submitFn(formData);
      return { success: true, data: result };

    } catch (error) {
      console.error('Secure form submission error:', error);
      toast({
        title: 'Submission Failed',
        description: 'An error occurred while submitting the form.',
        variant: 'destructive'
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsSubmitting(false);
    }
  }, [validateContent, options]);

  return {
    secureSubmit,
    isSubmitting
  };
};
