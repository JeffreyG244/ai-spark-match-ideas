import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'user' | 'admin' | 'super_admin' | 'moderator';

export interface RoleValidationResult {
  hasRole: boolean;
  userRoles: UserRole[];
  isAuthorized: boolean;
}

export class RoleSecurityService {
  private static roleCache = new Map<string, { roles: UserRole[]; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getUserRoles(userId?: string): Promise<UserRole[]> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!targetUserId) {
        return [];
      }

      // Check cache first
      const cached = this.roleCache.get(targetUserId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.roles;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId);

      if (error) {
        console.error('Failed to fetch user roles:', error);
        return [];
      }

      const roles = data?.map(r => r.role as UserRole) || [];
      
      // Update cache
      this.roleCache.set(targetUserId, {
        roles,
        timestamp: Date.now()
      });

      return roles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  static async hasRole(role: UserRole, userId?: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.includes(role);
  }

  static async hasAnyRole(roles: UserRole[], userId?: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return roles.some(role => userRoles.includes(role));
  }

  static async isAdmin(userId?: string): Promise<boolean> {
    return this.hasAnyRole(['admin', 'super_admin'], userId);
  }

  static async isSuperAdmin(userId?: string): Promise<boolean> {
    return this.hasRole('super_admin', userId);
  }

  static async validateRoleAction(
    requiredRole: UserRole | UserRole[],
    actionType: string,
    targetUserId?: string
  ): Promise<RoleValidationResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          hasRole: false,
          userRoles: [],
          isAuthorized: false
        };
      }

      const userRoles = await this.getUserRoles(user.id);
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const hasRole = requiredRoles.some(role => userRoles.includes(role));

      // Log the role validation attempt
      await this.logRoleAction(actionType, {
        user_id: user.id,
        required_roles: requiredRoles,
        user_roles: userRoles,
        target_user_id: targetUserId,
        authorized: hasRole
      });

      return {
        hasRole,
        userRoles,
        isAuthorized: hasRole
      };
    } catch (error) {
      console.error('Role validation error:', error);
      return {
        hasRole: false,
        userRoles: [],
        isAuthorized: false
      };
    }
  }

  static async assignRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      // Check if current user can assign roles
      const canAssign = await this.isAdmin();
      if (!canAssign) {
        throw new Error('Insufficient permissions to assign roles');
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role })
        .select()
        .single();

      if (error && !error.message.includes('duplicate')) {
        console.error('Failed to assign role:', error);
        return false;
      }

      // Clear cache for the user
      this.roleCache.delete(userId);

      await this.logRoleAction('role_assigned', {
        target_user_id: userId,
        assigned_role: role
      });

      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  static async removeRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      // Check if current user can remove roles
      const canRemove = await this.isAdmin();
      if (!canRemove) {
        throw new Error('Insufficient permissions to remove roles');
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        console.error('Failed to remove role:', error);
        return false;
      }

      // Clear cache for the user
      this.roleCache.delete(userId);

      await this.logRoleAction('role_removed', {
        target_user_id: userId,
        removed_role: role
      });

      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  private static async logRoleAction(actionType: string, details: Record<string, any>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('security_logs')
        .insert({
          user_id: user?.id,
          event_type: `role_${actionType}`,
          severity: 'high',
          details: details
        });
    } catch (error) {
      console.warn('Role action logging failed:', error);
    }
  }

  static clearCache(): void {
    this.roleCache.clear();
  }
}