export class RateLimitingService {
    static async checkRateLimit(endpoint) {
        const { RateLimitService } = await import('./RateLimitService');
        return RateLimitService.checkRateLimit(endpoint);
    }
}
