import { supabase } from '@/integrations/supabase/client';
import { SECURITY_CONFIG } from '@/utils/securityConfig';

export interface SessionSecurityStatus {
  isValid: boolean;
  requiresRefresh: boolean;
  deviceTrusted: boolean;
  suspiciousActivity: boolean;
  sessionAge: number;
  lastActivity: Date;
}

export class EnhancedSessionManager {
  private static readonly DEVICE_FINGERPRINT_KEY = 'device_fingerprint';
  private static readonly LAST_ACTIVITY_KEY = 'last_activity';
  private static readonly SESSION_START_KEY = 'session_start';

  static generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }

  static async validateSession(): Promise<SessionSecurityStatus> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return {
          isValid: false,
          requiresRefresh: false,
          deviceTrusted: false,
          suspiciousActivity: false,
          sessionAge: 0,
          lastActivity: new Date()
        };
      }

      const now = new Date();
      const sessionStart = new Date(session.expires_at ? new Date(session.expires_at).getTime() - (session.expires_in || 3600) * 1000 : Date.now());
      const sessionAge = now.getTime() - sessionStart.getTime();
      
      // Check session timeout
      if (sessionAge > SECURITY_CONFIG.SESSION_TIMEOUT) {
        await this.logSecurityEvent('session_expired', {
          session_age: sessionAge,
          max_timeout: SECURITY_CONFIG.SESSION_TIMEOUT
        });
        
        return {
          isValid: false,
          requiresRefresh: false,
          deviceTrusted: false,
          suspiciousActivity: false,
          sessionAge,
          lastActivity: now
        };
      }

      // Check device fingerprint
      const currentFingerprint = this.generateDeviceFingerprint();
      const storedFingerprint = localStorage.getItem(this.DEVICE_FINGERPRINT_KEY);
      const deviceTrusted = storedFingerprint === currentFingerprint;
      
      if (!deviceTrusted && storedFingerprint) {
        await this.logSecurityEvent('device_change_detected', {
          previous_fingerprint: storedFingerprint?.substring(0, 8),
          current_fingerprint: currentFingerprint.substring(0, 8)
        });
      }

      // Update device fingerprint if not set
      if (!storedFingerprint) {
        localStorage.setItem(this.DEVICE_FINGERPRINT_KEY, currentFingerprint);
      }

      // Check for refresh requirement
      const requiresRefresh = sessionAge > SECURITY_CONFIG.SESSION_REFRESH_THRESHOLD;
      
      // Update last activity
      localStorage.setItem(this.LAST_ACTIVITY_KEY, now.toISOString());
      
      // Check for suspicious activity patterns
      const suspiciousActivity = await this.detectSuspiciousActivity(session.user.id);

      return {
        isValid: true,
        requiresRefresh,
        deviceTrusted,
        suspiciousActivity,
        sessionAge,
        lastActivity: now
      };

    } catch (error) {
      console.error('Session validation error:', error);
      return {
        isValid: false,
        requiresRefresh: false,
        deviceTrusted: false,
        suspiciousActivity: true,
        sessionAge: 0,
        lastActivity: new Date()
      };
    }
  }

  private static async detectSuspiciousActivity(userId: string): Promise<boolean> {
    try {
      // Check security logs for suspicious patterns
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_logs')
        .select('severity, event_type')
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo)
        .in('severity', ['high', 'critical']);

      if (error) {
        console.warn('Suspicious activity detection failed:', error);
        return false;
      }

      // Consider more than 3 high/critical events in an hour as suspicious
      return (data?.length || 0) > 3;
    } catch (error) {
      console.warn('Suspicious activity detection error:', error);
      return false;
    }
  }

  static async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        return false;
      }

      await this.logSecurityEvent('session_refreshed', {
        refresh_time: new Date().toISOString()
      });

      return !!data.session;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }

  static async invalidateSession(reason: string = 'user_logout'): Promise<void> {
    try {
      await this.logSecurityEvent('session_invalidated', { reason });
      
      // Clear local storage
      localStorage.removeItem(this.DEVICE_FINGERPRINT_KEY);
      localStorage.removeItem(this.LAST_ACTIVITY_KEY);
      localStorage.removeItem(this.SESSION_START_KEY);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Session invalidation error:', error);
    }
  }

  private static async logSecurityEvent(eventType: string, details: Record<string, any>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('security_logs')
        .insert({
          user_id: user?.id,
          event_type: eventType,
          severity: 'medium',
          details: details
        });
    } catch (error) {
      console.warn('Security event logging failed:', error);
    }
  }

  static startActivityTracking(): void {
    const updateActivity = () => {
      localStorage.setItem(this.LAST_ACTIVITY_KEY, new Date().toISOString());
    };

    // Track various user activities
    const events = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Set initial session start time
    if (!localStorage.getItem(this.SESSION_START_KEY)) {
      localStorage.setItem(this.SESSION_START_KEY, new Date().toISOString());
    }
  }
}