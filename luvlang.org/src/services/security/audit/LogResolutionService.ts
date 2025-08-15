
import { supabase } from '@/integrations/supabase/client';
import { AdminActionService } from './AdminActionService';

export class LogResolutionService {
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

      await AdminActionService.logAdminAction(
        'security_log_resolved', 
        undefined, 
        `security_log:${logId}`
      );
    } catch (error) {
      console.error('Error resolving security log:', error);
      throw error;
    }
  }
}
