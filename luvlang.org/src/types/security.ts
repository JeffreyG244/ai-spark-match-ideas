
export interface SecurityEvent {
  id?: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  user_id?: string;
  timestamp: string;
}

export interface SecurityLogEntry {
  id?: string;
  user_id?: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  fingerprint?: string;
  created_at?: string;
  resolved?: boolean;
  resolved_by?: string;
  resolved_at?: string;
}

export interface AdminAction {
  id?: string;
  admin_user_id: string;
  action_type: string;
  target_user_id?: string;
  target_resource?: string;
  details: Record<string, any>;
  user_agent?: string;
  created_at?: string;
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
