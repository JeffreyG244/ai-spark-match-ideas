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
      console.log('AuthService.signUp starting for:', data.email);
      
      // Client-side validation for better UX
      const passwordValidation = validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error };
      }

      // Use window.location.origin for the redirect URL to ensure it works in all environments
      const redirectUrl = `${window.location.origin}/dashboard`;
      console.log('Using redirect URL:', redirectUrl);
      console.log('Submitting to Supabase without captcha token');

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName
          },
          emailRedirectTo: redirectUrl
          // No captcha token needed since it's disabled
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        await this.securityLogger.logEvent(
          'signup_failed',
          { email: data.email, error: error.message },
          'medium'
        );
        return { success: false, error: error.message };
      }

      console.log('Supabase signup successful:', authData.user?.id);
      await this.securityLogger.logEvent(
        'user_signup_success',
        { email: data.email, user_id: authData.user?.id },
        'low'
      );

      return { success: true, user: authData.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('AuthService.signUp error:', errorMessage);
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
      console.log('AuthService.signIn starting for:', data.email);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        console.error('Supabase signin error:', error);
        await this.securityLogger.logEvent(
          'login_failed',
          { email: data.email, error: error.message },
          'medium'
        );
        return { success: false, error: error.message };
      }

      console.log('Supabase signin successful:', authData.user?.id);
      await this.securityLogger.logEvent(
        'user_login_success',
        { email: data.email, user_id: authData.user?.id },
        'low'
      );

      return { success: true, user: authData.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('AuthService.signIn error:', errorMessage);
      await this.securityLogger.logEvent(
        'auth_unexpected_error',
        { email: data.email, error: errorMessage },
        'high'
      );
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }

  static async signOut(): Promise<void> {
    try {
      console.log('AuthService.signOut starting');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('Sign out successful');
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
    }
  }
}
