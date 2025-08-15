import { supabase } from '@/integrations/supabase/client';
/**
 * Secure configuration service that manages sensitive settings
 * through Supabase Edge Function secrets instead of hardcoded values
 */
export class SecureConfigService {
    static configCache = null;
    static cacheTimestamp = 0;
    static CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    /**
     * Get secure configuration from Supabase Edge Functions
     */
    static async getSecureConfig() {
        const now = Date.now();
        // Return cached config if still valid
        if (this.configCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
            return this.configCache;
        }
        try {
            // Call edge function to get secure config
            const { data, error } = await supabase.functions.invoke('get-secure-config');
            if (error) {
                console.error('Failed to fetch secure config:', error);
                return this.getFallbackConfig();
            }
            this.configCache = data;
            this.cacheTimestamp = now;
            return data;
        }
        catch (error) {
            console.error('Error fetching secure config:', error);
            return this.getFallbackConfig();
        }
    }
    /**
     * Get N8N webhook URL securely
     */
    static async getN8NWebhookUrl() {
        const config = await this.getSecureConfig();
        return config.N8N_WEBHOOK_URL || this.getFallbackN8NUrl();
    }
    /**
     * Get rate limiting configuration
     */
    static async getRateLimitConfig() {
        const config = await this.getSecureConfig();
        return config.RATE_LIMIT_DEFAULTS || {
            MESSAGE_LIMIT: 10,
            PROFILE_UPDATE_LIMIT: 5,
            LOGIN_ATTEMPT_LIMIT: 3,
            WINDOW_MINUTES: 15
        };
    }
    /**
     * Get session configuration
     */
    static async getSessionConfig() {
        const config = await this.getSecureConfig();
        return config.SESSION_CONFIG || {
            MAX_AGE_HOURS: 24,
            REFRESH_THRESHOLD_HOURS: 20,
            DEVICE_TRACKING_ENABLED: true
        };
    }
    /**
     * Get security headers configuration
     */
    static async getSecurityHeaders() {
        const config = await this.getSecureConfig();
        return config.SECURITY_HEADERS || {
            CSP_ENABLED: true,
            STRICT_TRANSPORT_SECURITY: true,
            X_FRAME_OPTIONS: 'DENY'
        };
    }
    /**
     * Validate configuration integrity
     */
    static async validateConfigIntegrity() {
        const issues = [];
        try {
            const config = await this.getSecureConfig();
            // Check N8N URL
            if (!config.N8N_WEBHOOK_URL) {
                issues.push('N8N webhook URL not configured');
            }
            else if (config.N8N_WEBHOOK_URL.includes('localhost') && this.isProductionEnvironment()) {
                issues.push('N8N webhook URL points to localhost in production');
            }
            // Check rate limits
            if (!config.RATE_LIMIT_DEFAULTS) {
                issues.push('Rate limit defaults not configured');
            }
            // Check session config
            if (!config.SESSION_CONFIG) {
                issues.push('Session configuration not set');
            }
            return {
                valid: issues.length === 0,
                issues
            };
        }
        catch (error) {
            return {
                valid: false,
                issues: [`Configuration validation failed: ${error}`]
            };
        }
    }
    /**
     * Update configuration (admin only)
     */
    static async updateSecureConfig(newConfig) {
        try {
            const { data, error } = await supabase.functions.invoke('update-secure-config', {
                body: newConfig
            });
            if (error) {
                return { success: false, error: error.message };
            }
            // Clear cache to force reload
            this.configCache = null;
            this.cacheTimestamp = 0;
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    /**
     * Fallback configuration for when secure config is unavailable
     */
    static getFallbackConfig() {
        return {
            RATE_LIMIT_DEFAULTS: {
                MESSAGE_LIMIT: 5, // More restrictive in fallback
                PROFILE_UPDATE_LIMIT: 3,
                LOGIN_ATTEMPT_LIMIT: 3,
                WINDOW_MINUTES: 15
            },
            SESSION_CONFIG: {
                MAX_AGE_HOURS: 12, // Shorter in fallback
                REFRESH_THRESHOLD_HOURS: 10,
                DEVICE_TRACKING_ENABLED: true
            },
            SECURITY_HEADERS: {
                CSP_ENABLED: true,
                STRICT_TRANSPORT_SECURITY: true,
                X_FRAME_OPTIONS: 'DENY'
            }
        };
    }
    /**
     * Fallback N8N URL (should be configured properly in production)
     */
    static getFallbackN8NUrl() {
        if (this.isProductionEnvironment()) {
            console.error('N8N webhook URL not configured for production!');
            return ''; // Force failure in production
        }
        return 'http://localhost:5678/webhook/010d0476-0e1c-4d10-bab7-955a933d1ca1';
    }
    /**
     * Check if running in production environment
     */
    static isProductionEnvironment() {
        return window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1' &&
            !window.location.hostname.includes('.local');
    }
    /**
     * Clear configuration cache (for testing/debugging)
     */
    static clearCache() {
        this.configCache = null;
        this.cacheTimestamp = 0;
    }
}
