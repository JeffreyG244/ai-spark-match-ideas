import { supabase } from '@/integrations/supabase/client';
import { validatePasswordWithDatabase } from '@/utils/databasePasswordValidation';
import { sanitizeInput } from '@/utils/inputSanitizer';
import { SecurityCoreService } from './SecurityCoreService';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
  requiresVerification?: boolean;
}

export interface SecureSignUpData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export class EnhancedAuthService {
  private static readonly MAX_LOGIN_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  static async secureSignUp(data: SecureSignUpData): Promise<AuthResult> {
    try {
      // Input validation and sanitization
      const sanitizedEmail = sanitizeInput(data.email);
      if (!this.isValidEmail(sanitizedEmail)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Password confirmation check
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      // Enhanced password validation
      const passwordValidation = await validatePasswordWithDatabase(data.password);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          error: `Password requirements not met: ${passwordValidation.errors.join(', ')}` 
        };
      }

      // Check for leaked password (if available)
      if (passwordValidation.isLeaked) {
        return { 
          success: false, 
          error: 'This password has been found in data breaches. Please choose a different password.' 
        };
      }

      // Simple rate limiting check (fallback implementation)
      const rateLimitKey = `signup_${sanitizedEmail}`;
      const attempts = JSON.parse(localStorage.getItem(rateLimitKey) || '[]');
      const now = Date.now();
      const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < 60000);
      
      if (recentAttempts.length >= 3) {
        return { 
          success: false, 
          error: 'Too many signup attempts. Please try again later.' 
        };
      }

      // Secure signup with proper redirect
      const redirectUrl = `${window.location.origin}/`;
      const { data: authData, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        // Log security event
        await SecurityCoreService.logSecurityEvent(
          'signup_failed',
          { email: sanitizedEmail, error: error.message },
          'medium'
        );
        return { success: false, error: error.message };
      }

      // Store rate limit attempt
      recentAttempts.push(now);
      localStorage.setItem(rateLimitKey, JSON.stringify(recentAttempts));

      // Log successful signup
      await SecurityCoreService.logSecurityEvent(
        'signup_success',
        { email: sanitizedEmail, user_id: authData.user?.id },
        'low'
      );

      return { 
        success: true, 
        user: authData.user,
        requiresVerification: !authData.session 
      };

    } catch (error) {
      console.error('Secure signup error:', error);
      return { success: false, error: 'Signup service temporarily unavailable' };
    }
  }

  static async secureSignIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Input sanitization
      const sanitizedEmail = sanitizeInput(email);
      if (!this.isValidEmail(sanitizedEmail)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Simple rate limiting check
      const rateLimitKey = `signin_${sanitizedEmail}`;
      const attempts = JSON.parse(localStorage.getItem(rateLimitKey) || '[]');
      const now = Date.now();
      const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < 15 * 60000);
      
      if (recentAttempts.length >= this.MAX_LOGIN_ATTEMPTS) {
        return { 
          success: false, 
          error: 'Too many login attempts. Please try again later.' 
        };
      }

      // Attempt signin
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password
      });

      if (error) {
        // Store failed attempt
        recentAttempts.push(now);
        localStorage.setItem(rateLimitKey, JSON.stringify(recentAttempts));
        
        // Log failed signin attempt
        await SecurityCoreService.logSecurityEvent(
          'signin_failed',
          { 
            email: sanitizedEmail, 
            error: error.message,
            remaining_attempts: this.MAX_LOGIN_ATTEMPTS - recentAttempts.length 
          },
          'medium'
        );
        return { success: false, error: error.message };
      }

      // Clear rate limit on successful signin
      localStorage.removeItem(rateLimitKey);

      // Log successful signin
      await SecurityCoreService.logSecurityEvent(
        'signin_success',
        { 
          email: sanitizedEmail, 
          user_id: data.user?.id,
          session_id: data.session?.access_token?.substring(0, 10) + '...' 
        },
        'low'
      );

      return { success: true, user: data.user };

    } catch (error) {
      console.error('Secure signin error:', error);
      return { success: false, error: 'Signin service temporarily unavailable' };
    }
  }

  static async secureSignOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      // Log signout
      await SecurityCoreService.logSecurityEvent(
        'signout',
        { timestamp: new Date().toISOString() },
        'low'
      );

      return { success: true };

    } catch (error) {
      console.error('Secure signout error:', error);
      return { success: false, error: 'Signout failed' };
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  static async resetPassword(email: string): Promise<AuthResult> {
    try {
      const sanitizedEmail = sanitizeInput(email);
      if (!this.isValidEmail(sanitizedEmail)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Rate limiting for password reset
      const rateLimitKey = `password_reset_${sanitizedEmail}`;
      const attempts = JSON.parse(localStorage.getItem(rateLimitKey) || '[]');
      const now = Date.now();
      const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < 60 * 60000);
      
      if (recentAttempts.length >= 2) {
        return { 
          success: false, 
          error: 'Too many password reset attempts. Please try again later.' 
        };
      }

      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: redirectUrl
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Store rate limit attempt
      recentAttempts.push(now);
      localStorage.setItem(rateLimitKey, JSON.stringify(recentAttempts));

      // Log password reset request
      await SecurityCoreService.logSecurityEvent(
        'password_reset_requested',
        { email: sanitizedEmail },
        'medium'
      );

      return { success: true };

    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset service temporarily unavailable' };
    }
  }
}