import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { EnhancedSessionManager } from '@/services/security/EnhancedSessionManager';
import { SecurityCoreService } from '@/services/security/SecurityCoreService';

interface SecureAuthWrapperProps {
  children: React.ReactNode;
}

export const SecureAuthWrapper: React.FC<SecureAuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Enhanced security logging
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              await SecurityCoreService.logSecurityEvent(
                'session_established',
                {
                  user_id: session.user.id,
                  device_fingerprint: SecurityCoreService.generateDeviceFingerprint(),
                  event_type: event
                },
                'low'
              );

              // Validate session security
              const sessionStatus = await SecurityCoreService.validateSessionSecurity();
              
              if (!sessionStatus.isValid) {
                console.warn('Session security validation failed:', sessionStatus);
                // Log security concern but don't sign out automatically
                await SecurityCoreService.logSecurityEvent(
                  'session_security_warning',
                  { reason: 'Session validation failed', details: sessionStatus },
                  'medium'
                );
              }
            } catch (error) {
              console.error('Auth state security check failed:', error);
            }
          }, 0);
        }

        if (event === 'SIGNED_OUT') {
          setTimeout(async () => {
            try {
              await SecurityCoreService.logSecurityEvent(
                'session_terminated',
                { event_type: event },
                'low'
              );
            } catch (error) {
              console.error('Signout logging failed:', error);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Activity tracking for security
  useEffect(() => {
    if (!user) return;

    const trackActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // Initial activity timestamp
    trackActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};