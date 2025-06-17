
import { supabase } from '@/integrations/supabase/client';

export class SecurityCoreService {
  static isProductionEnvironment(): boolean {
    return window.location.hostname !== 'localhost' && 
           !window.location.hostname.includes('127.0.0.1') &&
           !window.location.hostname.includes('.local');
  }

  static generateDeviceFingerprint(): string {
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

  static detectAutomationIndicators(): string[] {
    const indicators: string[] = [];
    
    try {
      // Check for common automation tools
      if (typeof (window as any).webdriver !== 'undefined') {
        indicators.push('webdriver_detected');
      }
      
      if (typeof (window as any).phantom !== 'undefined') {
        indicators.push('phantomjs_detected');
      }
      
      if (typeof (window as any).callPhantom !== 'undefined') {
        indicators.push('phantom_callPhantom_detected');
      }
      
      // Check for unusual navigator properties
      if (navigator.webdriver) {
        indicators.push('navigator_webdriver_true');
      }
      
      // Check for common automation user agents
      const userAgent = navigator.userAgent.toLowerCase();
      const automationPatterns = ['headless', 'phantom', 'selenium', 'chromedriver'];
      
      for (const pattern of automationPatterns) {
        if (userAgent.includes(pattern)) {
          indicators.push(`user_agent_${pattern}`);
        }
      }
      
      // Check for unusual screen properties
      if (screen.width === 0 || screen.height === 0) {
        indicators.push('invalid_screen_dimensions');
      }
      
      // Check for missing or unusual properties
      if (!navigator.languages || navigator.languages.length === 0) {
        indicators.push('missing_languages');
      }
      
    } catch (error) {
      console.error('Automation detection failed:', error);
      indicators.push('detection_error');
    }
    
    return indicators;
  }

  static getAnonymousIdentifier(): string {
    const stored = localStorage.getItem('anonymous_identifier');
    if (stored) return stored;
    
    const identifier = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_identifier', identifier);
    return identifier;
  }

  static async validateSessionSecurity(): Promise<{
    isValid: boolean;
    requiresRefresh: boolean;
    reason?: string;
  }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return { isValid: false, requiresRefresh: false, reason: 'Session error' };
      }
      
      if (!session) {
        return { isValid: false, requiresRefresh: false, reason: 'No session' };
      }
      
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const timeToExpiry = expiresAt - now;
      
      // Session expired
      if (timeToExpiry <= 0) {
        return { isValid: false, requiresRefresh: true, reason: 'Session expired' };
      }
      
      // Session expires soon (within 5 minutes)
      if (timeToExpiry < 300) {
        return { isValid: true, requiresRefresh: true, reason: 'Session expiring soon' };
      }
      
      return { isValid: true, requiresRefresh: false };
      
    } catch (error) {
      console.error('Session validation failed:', error);
      return { isValid: false, requiresRefresh: false, reason: 'Validation failed' };
    }
  }

  static async logSecurityEvent(
    eventType: string,
    details: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const logEntry = {
        user_id: user?.id || undefined,
        event_type: eventType,
        severity,
        details,
        user_agent: navigator.userAgent,
        fingerprint: this.generateDeviceFingerprint(),
        session_id: user?.id ? `session_${user.id}_${Date.now()}` : undefined
      };

      // With the new RLS policies, this will work for system logging
      const { error } = await supabase
        .from('security_logs')
        .insert(logEntry);

      if (error) {
        console.error('Failed to log security event:', error);
        this.fallbackLog(logEntry, error.message);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  }

  private static fallbackLog(logEntry: any, errorReason: string): void {
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
}
