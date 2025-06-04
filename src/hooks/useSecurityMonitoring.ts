
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { validateSession, generateDeviceFingerprint } from '@/utils/securityEnhancements';
import { logSecurityEvent, isProductionEnvironment } from '@/utils/security';

interface SecurityStatus {
  sessionValid: boolean;
  deviceTrusted: boolean;
  lastSecurityCheck: Date;
  riskLevel: 'low' | 'medium' | 'high';
  securityScore: number;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    sessionValid: true,
    deviceTrusted: true,
    lastSecurityCheck: new Date(),
    riskLevel: 'low',
    securityScore: 85
  });

  // Use a callback to ensure the function reference is stable between renders
  const performSecurityCheck = useCallback(async () => {
    if (!user) {
      setSecurityStatus(prev => ({
        ...prev,
        sessionValid: false,
        lastSecurityCheck: new Date(),
        riskLevel: 'medium',
        securityScore: 50
      }));
      return;
    }
    
    try {
      // Check session validity
      const sessionValidation = await validateSession();
      
      // Check device fingerprint against trusted devices
      const deviceFingerprint = generateDeviceFingerprint();
      const knownDevices = JSON.parse(localStorage.getItem(`known_devices_${user.id}`) || '[]');
      const isKnownDevice = knownDevices.includes(deviceFingerprint);
      
      if (!isKnownDevice && isProductionEnvironment()) {
        // Only log in production to avoid polluting test/dev environments
        logSecurityEvent(
          'new_device_detected', 
          `User ${user.id} using new or unrecognized device`, 
          'medium'
        );
        
        // Store device fingerprint (production would typically require verification first)
        if (knownDevices.length < 10) { // Limit number of stored devices
          knownDevices.push(deviceFingerprint);
          localStorage.setItem(`known_devices_${user.id}`, JSON.stringify(knownDevices));
        }
      }
      
      // Check for suspicious activity indicators
      let suspiciousActivityDetected = false;
      let securityScore = 85; // Default good score
      
      // Check browser features often disabled in malicious scenarios
      if (!navigator.cookieEnabled) {
        suspiciousActivityDetected = true;
        securityScore -= 20;
        logSecurityEvent(
          'cookies_disabled', 
          'User has cookies disabled which may indicate privacy mode or spoofing', 
          'medium'
        );
      }
      
      // Check for potential automation/bot indicators
      const automationIndicators = detectAutomationIndicators();
      if (automationIndicators.length > 0) {
        suspiciousActivityDetected = true;
        securityScore -= 15 * automationIndicators.length;
        logSecurityEvent(
          'automation_indicators', 
          `Potential automation detected: ${automationIndicators.join(', ')}`, 
          'high'
        );
      }
      
      // Determine risk level based on findings
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (!sessionValidation.isValid) {
        riskLevel = 'high';
        securityScore = Math.max(0, securityScore - 50);
      } else if (suspiciousActivityDetected || !isKnownDevice) {
        riskLevel = 'medium';
        securityScore = Math.max(0, securityScore - 25);
      }
      
      // Update security status
      setSecurityStatus({
        sessionValid: sessionValidation.isValid,
        deviceTrusted: isKnownDevice,
        lastSecurityCheck: new Date(),
        riskLevel,
        securityScore: Math.max(0, Math.min(100, securityScore))
      });

      if (!sessionValidation.isValid) {
        logSecurityEvent(
          'invalid_session_detected', 
          `User ${user?.id} has invalid session`, 
          'high'
        );
      }

      if (sessionValidation.shouldRefresh) {
        logSecurityEvent(
          'session_refresh_needed', 
          `User ${user?.id} session needs refresh`, 
          'low'
        );
      }
    } catch (error) {
      console.error('Security check error:', error);
      logSecurityEvent(
        'security_check_failed', 
        `Security check failed: ${error}`, 
        'high'
      );
      
      // Update security status to reflect failure
      setSecurityStatus(prev => ({
        ...prev,
        lastSecurityCheck: new Date(),
        riskLevel: 'high',
        securityScore: Math.max(0, prev.securityScore - 30)
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Initial security check
    performSecurityCheck();

    // Periodic security monitoring (every 5 minutes)
    const securityInterval = setInterval(performSecurityCheck, 5 * 60 * 1000);

    // Monitor for suspicious activity (every 30 seconds)
    const activityMonitor = setInterval(monitorUserActivity, 30 * 1000);

    return () => {
      clearInterval(securityInterval);
      clearInterval(activityMonitor);
    };
  }, [user, performSecurityCheck]);

  // Function to detect potential automation indicators
  const detectAutomationIndicators = (): string[] => {
    const indicators: string[] = [];
    
    try {
      // Check for headless browser indicators
      if (navigator.userAgent.includes("HeadlessChrome") || 
          navigator.userAgent.includes("PhantomJS") || 
          /Puppeteer/.test(navigator.userAgent)) {
        indicators.push('headless_browser');
      }
      
      // Check for missing browser features typically present in real browsers
      if (navigator.languages === undefined || navigator.languages.length === 0) {
        indicators.push('no_languages');
      }
      
      // Check unusual screen dimensions
      if (screen.width < 100 || screen.height < 100) {
        indicators.push('tiny_screen');
      }
      
      // Check permissions API availability (often missing in automation)
      if (typeof navigator.permissions === 'undefined') {
        indicators.push('no_permissions_api');
      }
    } catch (e) {
      // An error here might also indicate automation
      indicators.push('feature_detection_error');
    }
    
    return indicators;
  };

  const monitorUserActivity = () => {
    if (!user) return;
    
    try {
      // Monitor for rapid page navigation (potential bot behavior)
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0] as PerformanceNavigationTiming;
        if (entry.loadEventEnd - entry.fetchStart < 100) {
          logSecurityEvent(
            'suspicious_navigation', 
            'Extremely fast page load detected', 
            'medium'
          );
        }
      }

      // Monitor for console manipulation attempts - safely
      try {
        const originalConsole = { ...console };
        // Check if console methods have been tampered with
        if (console && typeof console === 'object') {
          const methods = ['log', 'warn', 'error', 'info', 'debug', 'clear'];
          
          for (const method of methods) {
            if (typeof console[method as keyof Console] === 'function') {
              const nativeToString = Function.prototype.toString;
              const functionString = nativeToString.call(console[method as keyof Console]);
              
              // Native browser functions typically include "[native code]" in their string representation
              if (!functionString.includes('[native code]') && 
                  !functionString.includes('native')) {
                logSecurityEvent(
                  'console_manipulation', 
                  `Console method ${method} has been modified`, 
                  'high'
                );
              }
            }
          }
        }
      } catch (error) {
        // Silently handle console check errors
      }
      
      // Check for storage tampering
      try {
        const storageTest = `__security_check_${Date.now()}__`;
        localStorage.setItem(storageTest, storageTest);
        const retrieved = localStorage.getItem(storageTest);
        localStorage.removeItem(storageTest);
        
        if (retrieved !== storageTest) {
          logSecurityEvent('storage_manipulation', 'LocalStorage may be compromised', 'high');
        }
      } catch (error) {
        // Permissions issue or private browsing - not necessarily malicious
      }
    } catch (error) {
      // Silently handle monitoring errors to avoid breaking user experience
    }
  };

  const reportSecurityIncident = async (incidentType: string, details: string) => {
    logSecurityEvent(incidentType, details, 'high');
    
    // Update security status to reflect reported incident
    setSecurityStatus(prev => ({
      ...prev,
      riskLevel: 'high',
      securityScore: Math.max(0, prev.securityScore - 25)
    }));
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
