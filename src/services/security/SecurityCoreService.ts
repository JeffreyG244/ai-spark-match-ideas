
import { supabase } from '@/integrations/supabase/client';

export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  timezone: number;
  platform: string;
  cookiesEnabled: boolean;
}

export interface AutomationIndicator {
  type: string;
  detected: boolean;
  description: string;
}

export class SecurityCoreService {
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

  static getDetailedDeviceFingerprint(): DeviceFingerprint {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenWidth: screen.width,
      screenHeight: screen.height,
      timezone: new Date().getTimezoneOffset(),
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled
    };
  }

  static detectAutomationIndicators(): AutomationIndicator[] {
    const indicators: AutomationIndicator[] = [];
    
    try {
      // Headless browser detection
      if (navigator.userAgent.includes("HeadlessChrome") || 
          navigator.userAgent.includes("PhantomJS") || 
          /Puppeteer/.test(navigator.userAgent)) {
        indicators.push({
          type: 'headless_browser',
          detected: true,
          description: 'Headless browser detected in user agent'
        });
      }
      
      // WebDriver detection
      if (navigator.webdriver) {
        indicators.push({
          type: 'webdriver',
          detected: true,
          description: 'WebDriver automation detected'
        });
      }
      
      // Language detection
      if (navigator.languages === undefined || navigator.languages.length === 0) {
        indicators.push({
          type: 'no_languages',
          detected: true,
          description: 'No browser languages detected'
        });
      }
      
      // Screen size detection
      if (screen.width < 100 || screen.height < 100) {
        indicators.push({
          type: 'tiny_screen',
          detected: true,
          description: 'Unusually small screen dimensions'
        });
      }
      
      // Permissions API detection
      if (typeof navigator.permissions === 'undefined') {
        indicators.push({
          type: 'no_permissions_api',
          detected: true,
          description: 'Permissions API not available'
        });
      }

      // Cookie detection
      if (!navigator.cookieEnabled) {
        indicators.push({
          type: 'cookies_disabled',
          detected: true,
          description: 'Cookies are disabled'
        });
      }
    } catch (e) {
      indicators.push({
        type: 'detection_error',
        detected: true,
        description: 'Error during automation detection'
      });
    }
    
    return indicators;
  }

  static isProductionEnvironment(): boolean {
    try {
      const host = window.location.hostname;
      return host !== 'localhost' && 
             !host.includes('127.0.0.1') && 
             !host.includes('.local') &&
             !host.includes('192.168.') &&
             !host.includes('10.') &&
             !host.endsWith('.dev');
    } catch (e) {
      return true;
    }
  }

  static isSecureContext(): boolean {
    return window.isSecureContext || window.location.protocol === 'https:';
  }

  static sanitizeUserAgent(userAgent: string): string {
    return userAgent
      .replace(/\([^)]*\)/g, '') // Remove parenthetical content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200); // Limit length
  }

  static getAnonymousIdentifier(): string {
    const stored = localStorage.getItem('anonymous_identifier');
    if (stored) return stored;
    
    const identifier = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_identifier', identifier);
    return identifier;
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
  setInterval(SecurityCoreService.performSecurityMaintenance, 60 * 60 * 1000);
}
