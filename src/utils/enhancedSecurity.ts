
import { supabase } from '@/integrations/supabase/client';

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

export interface RateLimitRule {
  id?: string;
  rule_name: string;
  endpoint_pattern: string;
  max_requests: number;
  window_seconds: number;
  penalty_multiplier: number;
  max_penalty_duration: number;
}

export interface AdminAction {
  id?: string;
  admin_user_id: string;
  action_type: string;
  target_user_id?: string;
  target_resource?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

const convertSupabaseJsonToRecord = (jsonData: any): Record<string, any> => {
  if (!jsonData) return {};
  if (typeof jsonData === 'object') return jsonData;
  try {
    return JSON.parse(jsonData);
  } catch {
    return { raw: jsonData };
  }
};

const convertToString = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;
  return String(value);
};

export const logSecurityEventToDB = async (
  eventType: string,
  details: string | Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const logEntry: Omit<SecurityLogEntry, 'id' | 'created_at'> = {
      user_id: user?.id || undefined,
      event_type: eventType,
      severity,
      details: typeof details === 'string' ? { message: details } : details,
      user_agent: navigator.userAgent,
      fingerprint: generateDeviceFingerprint(),
      session_id: user?.id ? `session_${user.id}_${Date.now()}` : undefined
    };

    const { error } = await supabase
      .from('security_logs')
      .insert(logEntry);

    if (error) {
      console.error('Failed to log security event to database:', error);
      // Fallback to localStorage for critical events
      const fallbackLogs = JSON.parse(localStorage.getItem('security_logs_fallback') || '[]');
      fallbackLogs.push({ ...logEntry, timestamp: new Date().toISOString() });
      localStorage.setItem('security_logs_fallback', JSON.stringify(fallbackLogs.slice(-100)));
    }
  } catch (error) {
    console.error('Security logging error:', error);
  }
};

export const logAdminAction = async (
  actionType: string,
  targetUserId?: string,
  targetResource?: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to log admin actions');
    }

    const adminAction: Omit<AdminAction, 'id' | 'created_at'> = {
      admin_user_id: user.id,
      action_type: actionType,
      target_user_id: targetUserId,
      target_resource: targetResource,
      details,
      user_agent: navigator.userAgent
    };

    const { error } = await supabase
      .from('admin_actions')
      .insert(adminAction);

    if (error) {
      throw error;
    }

    // Also log as a security event
    await logSecurityEventToDB(
      'admin_action_performed',
      {
        action_type: actionType,
        target_user_id: targetUserId,
        target_resource: targetResource,
        ...details
      },
      'medium'
    );
  } catch (error) {
    console.error('Failed to log admin action:', error);
    throw error;
  }
};

export const checkUserRole = async (requiredRole: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return false;

    const roleHierarchy = ['user', 'moderator', 'admin', 'super_admin'];
    const userRoleIndex = roleHierarchy.indexOf(data.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    return userRoleIndex >= requiredRoleIndex;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

export const getUserRoles = async (): Promise<string[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data.map(role => role.role);
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
};

export const getSecurityLogs = async (limit: number = 50): Promise<SecurityLogEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('security_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    // Convert the Supabase data to match our SecurityLogEntry interface
    return (data || []).map(log => ({
      id: log.id,
      user_id: log.user_id || undefined,
      event_type: log.event_type,
      severity: log.severity as 'low' | 'medium' | 'high' | 'critical',
      details: convertSupabaseJsonToRecord(log.details),
      ip_address: convertToString(log.ip_address),
      user_agent: log.user_agent || undefined,
      session_id: log.session_id || undefined,
      fingerprint: log.fingerprint || undefined,
      created_at: log.created_at || undefined,
      resolved: log.resolved || false,
      resolved_by: log.resolved_by || undefined,
      resolved_at: log.resolved_at || undefined
    }));
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return [];
  }
};

export const resolveSecurityLog = async (logId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to resolve security logs');
    }

    const { error } = await supabase
      .from('security_logs')
      .update({
        resolved: true,
        resolved_by: user.id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', logId);

    if (error) {
      throw error;
    }

    await logAdminAction('security_log_resolved', undefined, `security_log:${logId}`);
  } catch (error) {
    console.error('Error resolving security log:', error);
    throw error;
  }
};

export const assignUserRole = async (
  userId: string, 
  role: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role as any,
        granted_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      throw error;
    }

    await logAdminAction('user_role_assigned', userId, 'user_roles', { role });
  } catch (error) {
    console.error('Error assigning user role:', error);
    throw error;
  }
};

const generateDeviceFingerprint = (): string => {
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
};

export const enhancedRateLimiting = {
  async checkRateLimit(endpoint: string): Promise<{ allowed: boolean; remainingRequests?: number }> {
    try {
      // Get rate limit rules for this endpoint
      const { data: rules, error } = await supabase
        .from('rate_limit_rules')
        .select('*')
        .ilike('endpoint_pattern', `%${endpoint}%`)
        .single();

      if (error || !rules) {
        // Default rate limiting if no specific rule found
        return { allowed: true };
      }

      const { data: { user } } = await supabase.auth.getUser();
      const identifier = user?.id || 'anonymous';

      // Check current usage
      const windowStart = new Date(Date.now() - (rules.window_seconds * 1000));
      
      const { data: recentRequests, error: countError } = await supabase
        .from('rate_limits')
        .select('id')
        .eq('identifier', identifier)
        .eq('action', endpoint)
        .gte('timestamp', windowStart.toISOString());

      if (countError) {
        console.error('Rate limit check error:', countError);
        return { allowed: true };
      }

      const requestCount = recentRequests?.length || 0;
      
      if (requestCount >= rules.max_requests) {
        await logSecurityEventToDB(
          'rate_limit_exceeded',
          {
            endpoint,
            request_count: requestCount,
            max_requests: rules.max_requests,
            window_seconds: rules.window_seconds
          },
          'medium'
        );
        
        return { allowed: false, remainingRequests: 0 };
      }

      // Log this request
      await supabase.from('rate_limits').insert({
        identifier,
        action: endpoint
      });

      return { 
        allowed: true, 
        remainingRequests: rules.max_requests - requestCount - 1 
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      return { allowed: true };
    }
  }
};
