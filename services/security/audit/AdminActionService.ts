
import { supabase } from '@/integrations/supabase/client';
import { AuditLogService } from './AuditLogService';

export class AdminActionService {
  static async logAdminAction(
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

      // Mock admin actions logging since admin_actions table doesn't exist
      console.log('Admin action logged (mocked):', adminAction);
      const error = null;

      if (error) {
        throw error;
      }

      await AuditLogService.logSecurityEvent(
        'admin_action_performed',
        'medium',
        {
          action_type: actionType,
          target_user_id: targetUserId,
          target_resource: targetResource,
          admin_user_id: user.id,
          ...details
        }
      );
    } catch (error) {
      console.error('Failed to log admin action:', error);
      throw error;
    }
  }
}
