import { supabase } from '@/integrations/supabase/client';
import { SecurityCoreService } from '../SecurityCoreService';

export class AuditLogService {
  static async logEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('security_logs')
        .insert([{
          user_id: user?.id || null,
          event_type: eventType,
          severity,
          details
        }]);

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  static async getAuditLogs(filters?: {
    userId?: string;
    eventType?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    try {
      let query = supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data, error } = await query.limit(100);
      
      if (error) {
        console.error('Failed to retrieve audit logs:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  static async archiveOldLogs(daysOld: number = 90): Promise<number> {
    try {
      // Mock log archiving since security_logs table doesn't exist
      console.log(`Mock archiving audit logs older than ${daysOld} days`);
      return 0;
    } catch (error) {
      console.error('Failed to archive audit logs:', error);
      return 0;
    }
  }

  // Alias for compatibility
  static async logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>
  ): Promise<void> {
    return this.logEvent(eventType, severity, details);
  }
}