
import { supabase } from '@/integrations/supabase/client';
import { SecurityAuditService } from './SecurityAuditService';

export class RoleManagementService {
  static async checkUserRole(requiredRole: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('has_role', {
          check_user_id: user.id,
          required_role: requiredRole as any
        });

      if (error) {
        console.error('Error checking user role:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  static async getUserRoles(): Promise<string[]> {
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
  }

  static async assignUserRole(
    userId: string, 
    role: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated to assign roles');
      }

      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_role_assignment', {
          assigner_id: user.id,
          target_user_id: userId,
          new_role: role as any
        });

      if (validationError) {
        throw new Error(`Role validation failed: ${validationError.message}`);
      }

      if (!validationResult) {
        await SecurityAuditService.logSecurityEvent(
          'unauthorized_role_assignment_attempt',
          {
            assigner_id: user.id,
            target_user_id: userId,
            attempted_role: role
          },
          'high'
        );
        throw new Error('Insufficient privileges to assign this role');
      }

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role as any,
          granted_by: user.id
        });

      if (error) {
        throw error;
      }

      await SecurityAuditService.logSecurityEvent(
        'user_role_assigned',
        { target_user_id: userId, role, granted_by: user.id },
        'medium'
      );
    } catch (error) {
      console.error('Error assigning user role:', error);
      throw error;
    }
  }
}
