
import { useState, useCallback } from 'react';
import { validatePasswordAgainstLeaks, logCriticalSecurityEvent, criticalRateLimit } from '@/utils/criticalSecurityFixes';
import { toast } from '@/hooks/use-toast';

export const useCriticalSecurity = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateCriticalPassword = useCallback(async (password: string) => {
    setIsValidating(true);
    
    try {
      const validation = validatePasswordAgainstLeaks(password);
      
      // Log if password is compromised
      if (!validation.isSecure) {
        await logCriticalSecurityEvent(
          'compromised_password_attempt',
          {
            vulnerabilities: validation.vulnerabilities,
            security_score: validation.securityScore
          },
          'high'
        );
      }
      
      return validation;
    } catch (error) {
      console.error('Critical password validation error:', error);
      return {
        isSecure: false,
        vulnerabilities: ['Validation service temporarily unavailable'],
        securityScore: 0,
        recommendations: ['Please try again later']
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const checkCriticalRateLimit = useCallback((action: string, maxAttempts?: number) => {
    const key = `${action}_${Date.now().toString(36)}`;
    return criticalRateLimit.checkAllowed(key, maxAttempts);
  }, []);

  const reportSecurityIncident = useCallback(async (
    incidentType: string,
    details: Record<string, any>
  ) => {
    await logCriticalSecurityEvent(
      `incident_${incidentType}`,
      details,
      'critical'
    );
    
    toast({
      title: 'Security Alert',
      description: 'A security incident has been logged and reported.',
      variant: 'destructive'
    });
  }, []);

  return {
    validateCriticalPassword,
    checkCriticalRateLimit,
    reportSecurityIncident,
    isValidating
  };
};
