import { supabase } from '@/integrations/supabase/client';
import { AuditLogService } from './AuditLogService';
export class AdminActionService {
    static async logAdminAction(actionType, targetUserId, targetResource, details = {}) {
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
            await AuditLogService.logSecurityEvent('admin_action_performed', {
                action_type: actionType,
                target_user_id: targetUserId,
                target_resource: targetResource,
                admin_user_id: user.id,
                ...details
            }, 'medium');
        }
        catch (error) {
            console.error('Failed to log admin action:', error);
            throw error;
        }
    }
}
