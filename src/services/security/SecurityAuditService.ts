
import { supabase } from '@/integrations/supabase/client';
import { SecurityLogEntry, AdminAction } from '@/types/security';

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

export class SecurityAuditService {
  static async logSecurityEvent(
    eventType: string,
    details: string | Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const logEntry = {
        user_id: user?.id || undefined,
        event_type: eventType,
        severity,
        details: typeof details === 'string' ? { message: details } : details,
        user_agent: navigator.userAgent,
        fingerprint: this.generateDeviceFingerprint(),
        session_id: user?.id ? `session_${user.id}_${Date.now()}` : undefined
      };

      const { error } = await supabase
        .from('security_logs')
        .insert(logEntry);

      if (error) {
        console.error('Failed to log security event to database:', error);
        this.fallbackLog(logEntry, error.message);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  }

  static async getSecurityLogs(limit: number = 50): Promise<SecurityLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

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
  }

  static async resolveSecurityLog(logId: string): Promise<void> {
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

      await this.logAdminAction('security_log_resolved', undefined, `security_log:${logId}`);
    } catch (error) {
      console.error('Error resolving security log:', error);
      throw error;
    }
  }

  private static async logAdminAction(
    actionType: string,
    targetUserId?: string,
    targetResource?: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated to log admin actions');
      }

      const adminAction = {
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

      await this.logSecurityEvent(
        'admin_action_performed',
        {
          action_type: actionType,
          target_user_id: targetUserId,
          target_resource: targetResource,
          admin_user_id: user.id,
          ...details
        },
        'medium'
      );
    } catch (error) {
      console.error('Failed to log admin action:', error);
      throw error;
    }
  }

  private static fallbackLog(logEntry: any, errorReason: string): void {
    try {
      const fallbackLogs = JSON.parse(localStorage.getItem('security_logs_fallback') || '[]');
      fallbackLogs.push({ 
        ...logEntry, 
        timestamp: new Date().toISOString(),
        fallback_reason: errorReason 
      });
      localStorage.setItem('security_logs_fallback', JSON.stringify(fallbackLogs.slice(-100)));
    } catch (error) {
      console.error('Fallback logging failed:', error);
    }
  }

  private static generateDeviceFingerprint(): string {
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
  }
}
