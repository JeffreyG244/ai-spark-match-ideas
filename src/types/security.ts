
export interface SecurityEvent {
  id?: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  user_id?: string;
  timestamp: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  endpoint: string;
}

export interface SecurityConfig {
  rateLimit: RateLimitConfig[];
  monitoringEnabled: boolean;
  logLevel: 'low' | 'medium' | 'high' | 'critical';
}
