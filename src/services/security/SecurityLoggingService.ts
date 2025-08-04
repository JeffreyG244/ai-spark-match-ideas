
import { supabase } from '@/integrations/supabase/client';

export interface SecurityLogEntry {
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  user_agent?: string;
  fingerprint?: string;
  session_id?: string;
}

export class SecurityLoggingService {
  async logEvent(
    eventType: string,
    details: string | Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const logEntry: Omit<SecurityLogEntry, 'id' | 'created_at'> = {
        event_type: eventType,
        severity,
        details: typeof details === 'string' ? { message: details } : details,
        user_agent: navigator.userAgent,
        fingerprint: this.generateDeviceFingerprint(),
        session_id: user?.id ? `session_${user.id}_${Date.now()}` : undefined
      };

      // Mock security logging since security_logs table doesn't exist
      console.log('Security event logged (mocked):', {
        user_id: user?.id || undefined,
        ...logEntry
      });
      const error = null;

      if (error) {
        console.error('Failed to log security event to database:', error);
        this.fallbackLog(logEntry, error.message);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  }

  private fallbackLog(logEntry: any, errorReason: string): void {
    try {
      const fallbackLogs = JSON.parse(localStorage.getItem('security_logs_fallback') || '[]');
      fallbackLogs.push({ 
        ...logEntry, 
        timestamp: new Date().toISOString(),
        fallback_reason: errorReason 
      });
      localStorage.setItem('security_logs_fallback', JSON.stringify(fallbackLogs.slice(-100)));
    } catch (error) {
      console.error('Fallback logging failed:', error);
    }
  }

  private generateDeviceFingerprint(): string {
    try {
      const components = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset(),
        navigator.platform,
        navigator.cookieEnabled
      ];
      
      const fingerprint = components.join('|');
      
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return Math.abs(hash).toString(16);
    } catch (error) {
      console.error('Device fingerprint generation failed:', error);
      return 'unknown';
    }
  }
}
