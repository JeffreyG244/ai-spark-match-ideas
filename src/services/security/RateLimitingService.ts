
import { RateLimitService, RateLimitResult } from './RateLimitService';

export { RateLimitResult };

export class RateLimitingService {
  static async checkRateLimit(endpoint: string): Promise<RateLimitResult> {
    return RateLimitService.checkRateLimit(endpoint);
  }
}
