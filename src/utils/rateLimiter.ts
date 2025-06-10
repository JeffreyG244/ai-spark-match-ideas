
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= config.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
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

export const rateLimiter = new ClientRateLimiter();

// Cleanup every hour
if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 60 * 60 * 1000);
}

export const RATE_LIMITS = {
  MESSAGE_SEND: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  PROFILE_UPDATE: { maxRequests: 5, windowMs: 300000 }, // 5 per 5 minutes
  PHOTO_UPLOAD: { maxRequests: 3, windowMs: 600000 }, // 3 per 10 minutes
  LOGIN_ATTEMPT: { maxRequests: 5, windowMs: 900000 }, // 5 per 15 minutes
} as const;
