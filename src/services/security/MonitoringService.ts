
import { SecurityLoggingService } from './SecurityLoggingService';

export interface SecurityStatus {
  sessionValid: boolean;
  deviceTrusted: boolean;
  lastSecurityCheck: Date;
  riskLevel: 'low' | 'medium' | 'high';
  securityScore: number;
}

export class MonitoringService {
  private static securityLogger = new SecurityLoggingService();

  static detectAutomationIndicators(): string[] {
    const indicators: string[] = [];
    
    try {
      if (navigator.userAgent.includes("HeadlessChrome") || 
          navigator.userAgent.includes("PhantomJS") || 
          /Puppeteer/.test(navigator.userAgent)) {
        indicators.push('headless_browser');
      }
      
      if (navigator.languages === undefined || navigator.languages.length === 0) {
        indicators.push('no_languages');
      }
      
      if (screen.width < 100 || screen.height < 100) {
        indicators.push('tiny_screen');
      }
      
      if (typeof navigator.permissions === 'undefined') {
        indicators.push('no_permissions_api');
      }
    } catch (e) {
      indicators.push('feature_detection_error');
    }
    
    return indicators;
  }

  static async reportSecurityIncident(incidentType: string, details: string): Promise<void> {
    await this.securityLogger.logEvent(incidentType, details, 'high');
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

  static performSecurityMaintenance(): void {
    try {
      // Clean up old localStorage security data
      const securityKeys = ['security_logs', 'security_logs_fallback', 'audit_logs'];
      securityKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 1000) {
              localStorage.setItem(key, JSON.stringify(parsed.slice(-500)));
            }
          }
        } catch (error) {
          console.warn(`Failed to clean up ${key}:`, error);
        }
      });
    } catch (error) {
      console.error('Security maintenance failed:', error);
    }
  }
}

// Run maintenance every hour
if (typeof window !== 'undefined') {
  setInterval(MonitoringService.performSecurityMaintenance, 60 * 60 * 1000);
}
