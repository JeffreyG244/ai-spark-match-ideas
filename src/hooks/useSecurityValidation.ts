
import { useState, useCallback } from 'react';
import { ContentValidationService } from '@/services/security/ContentValidationService';
import { useAuth } from '@/hooks/useAuth';

interface SecurityValidationResult {
  allowed: boolean;
  reason?: string;
  remainingRequests?: number;
}

export const useSecurityValidation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const validateContent = useCallback(async (
    content: string, 
    contentType: string
  ): Promise<SecurityValidationResult> => {
    try {
      if (!user) {
        return { allowed: false, reason: 'Authentication required' };
      }

      if (!content || content.trim().length === 0) {
        return { allowed: false, reason: 'Content cannot be empty' };
      }

      if (content.length > 10000) {
        return { allowed: false, reason: 'Content too long' };
      }

      const result = await ContentValidationService.enforceContentPolicy(content, contentType);
      
      if (!result.allowed) {
        return {
          allowed: false,
          reason: result.reason
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Content validation failed:', error);
      return { allowed: false, reason: 'Content validation failed' };
    }
  }, [user]);

  const validateUserAction = useCallback(async (
    targetUserId?: string
  ): Promise<SecurityValidationResult> => {
    if (!user) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (targetUserId && targetUserId !== user.id) {
      try {
        const { RoleManagementService } = await import('@/services/security/RoleManagementService');
        const adminCheck = await RoleManagementService.checkUserRole('admin');
        
        if (!adminCheck) {
          return { allowed: false, reason: 'Insufficient permissions' };
        }
      } catch (error) {
        return { allowed: false, reason: 'Permission check failed' };
      }
    }

    return { allowed: true };
  }, [user]);

  return {
    loading,
    validateContent,
    validateUserAction,
    isAuthenticated: !!user
  };
};
