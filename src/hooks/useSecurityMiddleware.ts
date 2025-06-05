
import { useState, useCallback } from 'react';
import { enhancedRateLimiting, logSecurityEventToDB } from '@/utils/enhancedSecurity';
import { enforceContentPolicy } from '@/utils/enhancedInputSecurity';

interface SecurityMiddlewareResult {
  allowed: boolean;
  reason?: string;
  remainingRequests?: number;
}

export const useSecurityMiddleware = () => {
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
      // Fail secure - deny if rate limiting fails
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
      const result = await enforceContentPolicy(content, contentType);
      return {
        allowed: result.allowed,
        reason: result.reason
      };
    } catch (error) {
      console.error('Content validation failed:', error);
      await logSecurityEventToDB(
        'content_validation_failed',
        `Content validation failed: ${error}`,
        'medium'
      );
      return { allowed: false, reason: 'Content validation failed' };
    }
  }, []);

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

      // Execute the action
      const result = await action();
      
      // Log successful action
      if (options.endpoint) {
        await logSecurityEventToDB(
          'secure_action_completed',
          {
            endpoint: options.endpoint,
            content_type: options.contentType,
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
      
      // Log failed action
      if (options.endpoint) {
        await logSecurityEventToDB(
          'secure_action_failed',
          {
            endpoint: options.endpoint,
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
  }, [checkRateLimit, validateContent]);

  return {
    loading,
    checkRateLimit,
    validateContent,
    secureAction
  };
};
