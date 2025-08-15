
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

  static detectAutomationIndicators(): { detected: boolean; type: string }[] {
    const indicators: { detected: boolean; type: string }[] = [];
    
    try {
      // Check for common automation tools
      if (typeof (window as any).webdriver !== 'undefined') {
        indicators.push({ detected: true, type: 'webdriver_detected' });
      }
      
      if (typeof (window as any).phantom !== 'undefined') {
        indicators.push({ detected: true, type: 'phantomjs_detected' });
      }
      
      if (typeof (window as any).callPhantom !== 'undefined') {
        indicators.push({ detected: true, type: 'phantom_callPhantom_detected' });
      }
      
      // Check for unusual navigator properties
      if (navigator.webdriver) {
        indicators.push({ detected: true, type: 'navigator_webdriver_true' });
      }
      
      // Check for common automation user agents
      const userAgent = navigator.userAgent.toLowerCase();
      const automationPatterns = ['headless', 'phantom', 'selenium', 'chromedriver'];
      
      for (const pattern of automationPatterns) {
        if (userAgent.includes(pattern)) {
          indicators.push({ detected: true, type: `user_agent_${pattern}` });
        }
      }
      
      // Check for unusual screen properties
      if (screen.width === 0 || screen.height === 0) {
        indicators.push({ detected: true, type: 'invalid_screen_dimensions' });
      }
      
      // Check for missing or unusual properties
      if (!navigator.languages || navigator.languages.length === 0) {
        indicators.push({ detected: true, type: 'missing_languages' });
      }
      
    } catch (error) {
      console.error('Automation detection failed:', error);
      indicators.push({ detected: true, type: 'detection_error' });
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

  static performSecurityMaintenance(): void {
    try {
      // Clean up localStorage security data
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      
      // Clean up rate limit data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('rate_limit_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            const cleanedData = data.filter((timestamp: number) => timestamp > oneHourAgo);
            if (cleanedData.length !== data.length) {
              localStorage.setItem(key, JSON.stringify(cleanedData));
            }
          } catch (error) {
            console.error('Failed to clean rate limit data:', error);
          }
        }
      }
      
      // Clean up old security logs from localStorage
      try {
        const fallbackLogs = JSON.parse(localStorage.getItem('security_logs_fallback') || '[]');
        const cleanedLogs = fallbackLogs.slice(-50); // Keep only last 50 entries
        localStorage.setItem('security_logs_fallback', JSON.stringify(cleanedLogs));
      } catch (error) {
        console.error('Failed to clean security logs:', error);
      }
      
      console.log('Security maintenance completed');
    } catch (error) {
      console.error('Security maintenance failed:', error);
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

      // Mock security logging since security_logs table doesn't exist
      console.log('Security event logged (mocked):', logEntry);
      const error = null;

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
