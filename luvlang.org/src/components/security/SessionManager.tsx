
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SecurityAuditService } from '@/services/security/SecurityAuditService';
import { toast } from '@/hooks/use-toast';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

const SessionManager = () => {
  const { user, signOut } = useAuth();

  const handleSessionTimeout = useCallback(async () => {
    if (user) {
      await SecurityAuditService.logSecurityEvent(
        'session_timeout',
        'User session expired due to inactivity',
        'low'
      );
      
      toast({
        title: 'Session Expired',
        description: 'You have been logged out due to inactivity.',
        variant: 'destructive'
      });
      
      await signOut();
    }
  }, [user, signOut]);

  const handleSessionWarning = useCallback(() => {
    if (user) {
      toast({
        title: 'Session Expiring Soon',
        description: 'Your session will expire in 5 minutes due to inactivity.',
      });
    }
  }, [user]);

  const resetSessionTimer = useCallback(() => {
    if (!user) return;

    // Clear existing timers
    const existingWarning = localStorage.getItem('session_warning_timer');
    const existingTimeout = localStorage.getItem('session_timeout_timer');
    
    if (existingWarning) {
      clearTimeout(parseInt(existingWarning));
      localStorage.removeItem('session_warning_timer');
    }
    
    if (existingTimeout) {
      clearTimeout(parseInt(existingTimeout));
      localStorage.removeItem('session_timeout_timer');
    }

    // Set new timers
    const warningTimer = setTimeout(handleSessionWarning, SESSION_TIMEOUT - WARNING_TIME);
    const timeoutTimer = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
    
    localStorage.setItem('session_warning_timer', warningTimer.toString());
    localStorage.setItem('session_timeout_timer', timeoutTimer.toString());
    localStorage.setItem('last_activity', Date.now().toString());
  }, [user, handleSessionWarning, handleSessionTimeout]);

  const handleUserActivity = useCallback(() => {
    if (user) {
      resetSessionTimer();
    }
  }, [user, resetSessionTimer]);

  useEffect(() => {
    if (!user) {
      // Clear timers when user logs out
      const existingWarning = localStorage.getItem('session_warning_timer');
      const existingTimeout = localStorage.getItem('session_timeout_timer');
      
      if (existingWarning) {
        clearTimeout(parseInt(existingWarning));
        localStorage.removeItem('session_warning_timer');
      }
      
      if (existingTimeout) {
        clearTimeout(parseInt(existingTimeout));
        localStorage.removeItem('session_timeout_timer');
      }
      
      localStorage.removeItem('last_activity');
      return;
    }

    // Check if session should have expired
    const lastActivity = localStorage.getItem('last_activity');
    if (lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      if (timeSinceActivity > SESSION_TIMEOUT) {
        handleSessionTimeout();
        return;
      }
    }

    // Set up session management
    resetSessionTimer();

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [user, resetSessionTimer, handleUserActivity, handleSessionTimeout]);

  return null;
};

export default SessionManager;
