
import { useState, useCallback } from 'react';
import { enhancedRateLimiting, logSecurityEventToDB } from '@/utils/enhancedSecurity';
import { useAuth } from '@/hooks/useAuth';

interface SecurityMiddlewareResult {
  allowed: boolean;
  reason?: string;
  remainingRequests?: number;
}

export const useSecurityMiddleware = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const checkRateLimit = useCallback(async (endpoint: string): Promise<SecurityMiddlewareResult> => {
    try {
      setLoading(true);
      const result = await enhancedRateLimiting.checkRateLimit(endpoint);
      
      if (!result.allowed) {
        return {
          allowed: false,
          reason: 'Rate limit exceeded. Please wait before making more requests.',
          remainingRequests: result.remainingRequests
        };
      }

      return {
        allowed: true,
        remainingRequests: result.remainingRequests
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      await logSecurityEventToDB(
        'rate_limit_check_failed',
        `Rate limit check failed for ${endpoint}: ${error}`,
        'medium'
      );
      return { allowed: false, reason: 'Security check failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateContent = useCallback(async (
    content: string, 
    contentType: string
  ): Promise<SecurityMiddlewareResult> => {
    try {
      // Enhanced content validation with RLS protection
      if (!user) {
        return { allowed: false, reason: 'Authentication required' };
      }

      if (!content || content.trim().length === 0) {
        return { allowed: false, reason: 'Content cannot be empty' };
      }

      if (content.length > 10000) {
        return { allowed: false, reason: 'Content too long' };
      }

      // Enhanced security patterns
      const dangerousPatterns = [
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi,
        /<iframe[\s\S]*?>/gi,
        /<object[\s\S]*?>/gi,
        /<embed[\s\S]*?>/gi,
        /data:text\/html/gi
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          await logSecurityEventToDB(
            'dangerous_content_detected',
            `Dangerous pattern detected in ${contentType} content`,
            'high'
          );
          return { allowed: false, reason: 'Content contains potentially dangerous patterns' };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Content validation failed:', error);
      await logSecurityEventToDB(
        'content_validation_failed',
        `Content validation failed: ${error}`,
        'medium'
      );
      return { allowed: false, reason: 'Content validation failed' };
    }
  }, [user]);

  const secureAction = useCallback(async (
    action: () => Promise<any>,
    options: {
      endpoint?: string;
      content?: string;
      contentType?: string;
      requireAuth?: boolean;
    } = {}
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      setLoading(true);

      // Enhanced authentication check
      if (options.requireAuth !== false && !user) {
        await logSecurityEventToDB(
          'unauthorized_action_attempt',
          {
            endpoint: options.endpoint,
            content_type: options.contentType
          },
          'medium'
        );
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Check rate limiting if endpoint provided
      if (options.endpoint) {
        const rateLimitResult = await checkRateLimit(options.endpoint);
        if (!rateLimitResult.allowed) {
          return {
            success: false,
            error: rateLimitResult.reason
          };
        }
      }

      // Validate content if provided
      if (options.content && options.contentType) {
        const contentResult = await validateContent(options.content, options.contentType);
        if (!contentResult.allowed) {
          return {
            success: false,
            error: contentResult.reason
          };
        }
      }

      // Execute the action with RLS protection
      const result = await action();
      
      // Log successful action with user context
      if (options.endpoint && user) {
        await logSecurityEventToDB(
          'secure_action_completed',
          {
            endpoint: options.endpoint,
            content_type: options.contentType,
            user_id: user.id,
            action_success: true
          },
          'low'
        );
      }

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Secure action failed:', error);
      
      // Enhanced error logging with user context
      if (options.endpoint) {
        await logSecurityEventToDB(
          'secure_action_failed',
          {
            endpoint: options.endpoint,
            user_id: user?.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          'medium'
        );
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Action failed'
      };
    } finally {
      setLoading(false);
    }
  }, [checkRateLimit, validateContent, user]);

  const validateUserAction = useCallback(async (
    targetUserId?: string
  ): Promise<SecurityMiddlewareResult> => {
    if (!user) {
      return { allowed: false, reason: 'Authentication required' };
    }

    // If targeting another user, ensure it's allowed
    if (targetUserId && targetUserId !== user.id) {
      // Check if user has admin privileges for cross-user actions
      try {
        const adminCheck = await import('@/utils/enhancedSecurity').then(
          module => module.checkUserRole('admin')
        );
        
        if (!adminCheck) {
          await logSecurityEventToDB(
            'unauthorized_cross_user_action',
            {
              requesting_user: user.id,
              target_user: targetUserId
            },
            'high'
          );
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
    checkRateLimit,
    validateContent,
    secureAction,
    validateUserAction,
    isAuthenticated: !!user
  };
};
