
import type { RateLimitResult } from './RateLimitService';

export type { RateLimitResult };

export class RateLimitingService {
  static async checkRateLimit(endpoint: string): Promise<RateLimitResult> {
    const { RateLimitService } = await import('./RateLimitService');
    return RateLimitService.checkRateLimit(endpoint);
  }
}
