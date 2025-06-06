
import { supabase } from '@/integrations/supabase/client';
import { SecurityAuditService } from './SecurityAuditService';
import { SecurityCoreService } from './SecurityCoreService';

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
}

export class RateLimitService {
  private static requests = new Map<string, number[]>();

  static isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      SecurityAuditService.logSecurityEvent(
        'client_rate_limit_exceeded',
        { key, maxRequests, windowMs, currentCount: validRequests.length },
        'medium'
      );
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

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
      const identifier = SecurityCoreService.getAnonymousIdentifier();
      const windowStart = new Date(Date.now() - 60000);
      
      const rateLimitKey = `rate_limit_${identifier}_${endpoint}`;
      const stored = localStorage.getItem(rateLimitKey);
      const requests = stored ? JSON.parse(stored) : [];
      
      const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart.getTime());
      
      if (recentRequests.length >= 10) {
        await SecurityAuditService.logSecurityEvent(
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

  static cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < maxAge);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Run cleanup every hour
if (typeof window !== 'undefined') {
  setInterval(RateLimitService.cleanup, 60 * 60 * 1000);
}
