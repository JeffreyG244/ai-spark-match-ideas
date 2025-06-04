
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { validateSession, generateDeviceFingerprint } from '@/utils/securityEnhancements';
import { logSecurityEvent } from '@/utils/security';

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState({
    sessionValid: true,
    deviceTrusted: true,
    lastSecurityCheck: new Date()
  });

  useEffect(() => {
    if (!user) return;

    // Initial security check
    performSecurityCheck();

    // Periodic security monitoring (every 5 minutes)
    const securityInterval = setInterval(performSecurityCheck, 5 * 60 * 1000);

    // Monitor for suspicious activity
    const activityMonitor = setInterval(monitorUserActivity, 30 * 1000);

    return () => {
      clearInterval(securityInterval);
      clearInterval(activityMonitor);
    };
  }, [user]);

  const performSecurityCheck = async () => {
    try {
      const sessionValidation = await validateSession();
      
      setSecurityStatus(prev => ({
        ...prev,
        sessionValid: sessionValidation.isValid,
        lastSecurityCheck: new Date()
      }));

      if (!sessionValidation.isValid) {
        logSecurityEvent('invalid_session_detected', `User ${user?.id} has invalid session`, 'medium');
      }

      if (sessionValidation.shouldRefresh) {
        logSecurityEvent('session_refresh_needed', `User ${user?.id} session needs refresh`, 'low');
      }

    } catch (error) {
      logSecurityEvent('security_check_failed', `Security check failed: ${error}`, 'high');
    }
  };

  const monitorUserActivity = () => {
    // Monitor for rapid page navigation (potential bot behavior)
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const entry = navigationEntries[0] as PerformanceNavigationTiming;
      if (entry.loadEventEnd - entry.fetchStart < 100) {
        logSecurityEvent('suspicious_navigation', 'Extremely fast page load detected', 'medium');
      }
    }

    // Monitor for console manipulation attempts
    try {
      if (window.console && window.console.clear && typeof window.console.clear.toString === 'function') {
        if (!window.console.clear.toString().includes('native code')) {
          logSecurityEvent('console_manipulation', 'Console manipulation detected', 'high');
        }
      }
    } catch (error) {
      // Silently handle console check errors
    }
  };

  const reportSecurityIncident = async (incidentType: string, details: string) => {
    logSecurityEvent(incidentType, details, 'high');
  };

  const getDeviceFingerprint = () => {
    return generateDeviceFingerprint();
  };

  return {
    securityStatus,
    reportSecurityIncident,
    getDeviceFingerprint,
    performSecurityCheck
  };
};
