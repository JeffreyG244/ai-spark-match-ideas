
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  validatePasswordSecurity,
  sanitizeUserInput,
  checkEnhancedRateLimit,
  validateAdminAction,
  validateFileUpload,
  validateSessionSecurity
} from '@/utils/enhancedSecurityValidation';
import { toast } from '@/hooks/use-toast';

export const useEnhancedSecurity = () => {
  const { user, signOut } = useAuth();
  const [securityStatus, setSecurityStatus] = useState({
    sessionValid: true,
    rateLimitStatus: 'normal' as 'normal' | 'warning' | 'blocked',
    lastSecurityCheck: new Date()
  });

  // Enhanced session monitoring
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      const sessionCheck = await validateSessionSecurity();
      
      if (!sessionCheck.isValid) {
        toast({
          title: 'Session Expired',
          description: 'Please log in again for security.',
          variant: 'destructive'
        });
        await signOut();
        return;
      }
      
      if (sessionCheck.requiresRefresh) {
        toast({
          title: 'Session Expiring',
          description: 'Your session will expire soon.',
        });
      }
      
      setSecurityStatus(prev => ({
        ...prev,
        sessionValid: sessionCheck.isValid,
        lastSecurityCheck: new Date()
      }));
    };

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    checkSession(); // Initial check

    return () => clearInterval(interval);
  }, [user, signOut]);

  const secureAction = useCallback(async <T>(
    action: () => Promise<T>,
    options: {
      rateLimitAction?: string;
      requireAdmin?: boolean;
      maxRequests?: number;
      windowSeconds?: number;
    } = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      // Check rate limiting first
      if (options.rateLimitAction) {
        const rateCheck = await checkEnhancedRateLimit(
          options.rateLimitAction
        );
        
        if (!rateCheck.allowed) {
          setSecurityStatus(prev => ({ ...prev, rateLimitStatus: 'blocked' }));
          return {
            success: false,
            error: `Rate limit exceeded. ${rateCheck.retryAfter ? `Try again in ${rateCheck.retryAfter} seconds.` : 'Please wait before trying again.'}`
          };
        }
        
        if (rateCheck.remainingRequests && rateCheck.remainingRequests < 3) {
          setSecurityStatus(prev => ({ ...prev, rateLimitStatus: 'warning' }));
        }
      }

      // Check admin permissions if required
      if (options.requireAdmin) {
        const isValidAdmin = await validateAdminAction(options.rateLimitAction || 'admin_action');
        if (!isValidAdmin) {
          return {
            success: false,
            error: 'Insufficient permissions for this action'
          };
        }
      }

      // Execute the action
      const result = await action();
      
      setSecurityStatus(prev => ({ ...prev, rateLimitStatus: 'normal' }));
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Secure action failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Action failed'
      };
    }
  }, []);

  const validateInput = useCallback((
    input: string,
    options: {
      maxLength?: number;
      allowFormatting?: boolean;
      required?: boolean;
    } = {}
  ) => {
    if (options.required && (!input || input.trim().length === 0)) {
      return {
        isValid: false,
        errors: ['This field is required'],
        sanitizedValue: ''
      };
    }

    if (options.maxLength && input.length > options.maxLength) {
      return {
        isValid: false,
        errors: [`Input must be less than ${options.maxLength} characters`],
        sanitizedValue: input.substring(0, options.maxLength)
      };
    }

    return sanitizeUserInput(input);
  }, []);

  const validatePassword = useCallback((password: string) => {
    return validatePasswordSecurity(password);
  }, []);

  const validateFile = useCallback((file: File) => {
    return validateFileUpload(file);
  }, []);

  const performSecurityCheck = useCallback(async () => {
    const sessionCheck = await validateSessionSecurity();
    setSecurityStatus(prev => ({
      ...prev,
      sessionValid: sessionCheck.isValid,
      lastSecurityCheck: new Date()
    }));
    
    return sessionCheck.isValid;
  }, []);

  return {
    securityStatus,
    secureAction,
    validateInput,
    validatePassword,
    validateFile,
    performSecurityCheck,
    isAuthenticated: !!user
  };
};
