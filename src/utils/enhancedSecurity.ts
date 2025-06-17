
import { supabase } from '@/integrations/supabase/client';
import { SecurityCoreService } from '@/services/security/SecurityCoreService';
import { 
  sanitizeUserInput, 
  validatePasswordSecurity, 
  checkEnhancedRateLimit,
  validateSessionSecurity,
  validateAdminAction,
  validateFileUpload
} from '@/utils/enhancedSecurityValidation';

// Re-export validation functions
export { 
  sanitizeUserInput, 
  validatePasswordSecurity, 
  checkEnhancedRateLimit,
  validateSessionSecurity,
  validateAdminAction,
  validateFileUpload
};

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
  return SecurityCoreService.logSecurityEvent(
    eventType,
    typeof details === 'string' ? { message: details } : details,
    severity
  );
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

    // Enhanced admin role verification using the new RLS-compliant function
    const isValidAdmin = await validateAdminAction(actionType);
    if (!isValidAdmin) {
      throw new Error('Insufficient privileges for admin action');
    }

    const adminAction: Omit<AdminAction, 'id' | 'created_at'> = {
      admin_user_id: user.id,
      action_type: actionType,
      target_user_id: targetUserId,
      target_resource: targetResource,
      details,
      user_agent: navigator.userAgent
    };

    // With new RLS, only admins can insert admin actions
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
        admin_user_id: user.id,
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

    // Use the existing has_role function which works with RLS
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
};

export const getUserRoles = async (): Promise<string[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    // With RLS, users can only see their own roles
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
    // With RLS, only admins can view security logs
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
};

export const resolveSecurityLog = async (logId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to resolve security logs');
    }

    // With RLS, only admins can update security logs
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to assign roles');
    }

    // Use the enhanced validation function
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
      await logSecurityEventToDB(
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

    // With RLS, only admins can insert user roles
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

    await logAdminAction('user_role_assigned', userId, 'user_roles', { role });
  } catch (error) {
    console.error('Error assigning user role:', error);
    throw error;
  }
};

export const enhancedRateLimiting = {
  async checkRateLimit(endpoint: string): Promise<{ allowed: boolean; remainingRequests?: number }> {
    return checkEnhancedRateLimit(endpoint, 60, 60);
  },

  async checkAnonymousRateLimit(endpoint: string): Promise<{ allowed: boolean; remainingRequests?: number }> {
    return checkEnhancedRateLimit(endpoint, 10, 60);
  }
};
