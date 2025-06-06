
import { supabase } from '@/integrations/supabase/client';
import { validatePasswordStrength } from '@/utils/passwordValidation';
import { SecurityLoggingService } from '../security/SecurityLoggingService';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

export class AuthService {
  private static securityLogger = new SecurityLoggingService();

  static async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      // Client-side validation for better UX
      const passwordValidation = validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error };
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            password: data.password // Pass to database trigger for validation
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        await this.securityLogger.logEvent(
          'signup_failed',
          { email: data.email, error: error.message },
          'medium'
        );
        return { success: false, error: error.message };
      }

      await this.securityLogger.logEvent(
        'user_signup_success',
        { email: data.email, user_id: authData.user?.id },
        'low'
      );

      return { success: true, user: authData.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.securityLogger.logEvent(
        'auth_unexpected_error',
        { email: data.email, error: errorMessage },
        'high'
      );
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }

  static async signIn(data: SignInData): Promise<AuthResult> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        await this.securityLogger.logEvent(
          'login_failed',
          { email: data.email, error: error.message },
          'medium'
        );
        return { success: false, error: error.message };
      }

      await this.securityLogger.logEvent(
        'user_login_success',
        { email: data.email, user_id: authData.user?.id },
        'low'
      );

      return { success: true, user: authData.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.securityLogger.logEvent(
        'auth_unexpected_error',
        { email: data.email, error: errorMessage },
        'high'
      );
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }

  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  }
}
