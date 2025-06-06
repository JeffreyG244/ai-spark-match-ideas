
import { supabase } from '@/integrations/supabase/client';
import { SecurityLoggingService } from './SecurityLoggingService';

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
}

export class RateLimitingService {
  private static securityLogger = new SecurityLoggingService();

  static async checkRateLimit(endpoint: string): Promise<RateLimitResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return await this.checkAnonymousRateLimit(endpoint);
      }

      const { data: allowed, error } = await supabase
        .rpc('secure_rate_limit_check', {
          p_user_id: user.id,
          p_action: endpoint,
          p_max_requests: 60,
          p_window_seconds: 60
        });

      if (error) {
        console.error('Rate limit check error:', error);
        return { allowed: false };
      }

      return { allowed: allowed || false };
    } catch (error) {
      console.error('Rate limiting error:', error);
      return { allowed: false };
    }
  }

  private static async checkAnonymousRateLimit(endpoint: string): Promise<RateLimitResult> {
    try {
      const identifier = this.getAnonymousIdentifier();
      const windowStart = new Date(Date.now() - 60000);
      
      const rateLimitKey = `rate_limit_${identifier}_${endpoint}`;
      const stored = localStorage.getItem(rateLimitKey);
      const requests = stored ? JSON.parse(stored) : [];
      
      const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart.getTime());
      
      if (recentRequests.length >= 10) {
        await this.securityLogger.logEvent(
          'anonymous_rate_limit_exceeded',
          {
            endpoint,
            identifier,
            request_count: recentRequests.length
          },
          'medium'
        );
        return { allowed: false, remainingRequests: 0 };
      }

      recentRequests.push(Date.now());
      localStorage.setItem(rateLimitKey, JSON.stringify(recentRequests));

      return { 
        allowed: true, 
        remainingRequests: 10 - recentRequests.length - 1 
      };
    } catch (error) {
      console.error('Anonymous rate limiting error:', error);
      return { allowed: false };
    }
  }

  private static getAnonymousIdentifier(): string {
    const stored = localStorage.getItem('anonymous_identifier');
    if (stored) return stored;
    
    const identifier = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_identifier', identifier);
    return identifier;
  }
}
