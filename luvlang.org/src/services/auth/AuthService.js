import { supabase } from '@/integrations/supabase/client';
import { validatePasswordStrength } from '@/utils/passwordValidation';
import { SecurityLoggingService } from '../security/SecurityLoggingService';
export class AuthService {
    static securityLogger = new SecurityLoggingService();
    static async signUp(data) {
        try {
            console.log('AuthService.signUp starting for:', data.email);
            // Validate password strength at service level
            const passwordValidation = validatePasswordStrength(data.password);
            if (!passwordValidation.isValid) {
                console.error('Password validation failed at service level:', passwordValidation.error);
                return { success: false, error: passwordValidation.error };
            }
            // Validate required fields
            if (!data.email || !data.password || !data.firstName || !data.lastName) {
                const error = 'All fields are required';
                console.error('Required fields validation failed');
                return { success: false, error };
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                const error = 'Please enter a valid email address';
                console.error('Email format validation failed');
                return { success: false, error };
            }
            // Validate password length (minimum requirement)
            if (data.password.length < 6) {
                const error = 'Password must be at least 6 characters long';
                console.error('Password length validation failed:', data.password.length);
                return { success: false, error };
            }
            console.log('Submitting to Supabase with validated data');
            // Sign up with email confirmations disabled
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        first_name: data.firstName,
                        last_name: data.lastName
                    },
                    emailRedirectTo: undefined // Explicitly disable email confirmation redirect
                }
            });
            if (error) {
                console.error('Supabase signup error:', error);
                // Handle specific Supabase errors
                let errorMessage = error.message;
                if (error.message.includes('User already registered')) {
                    errorMessage = 'An account with this email already exists. Please sign in instead.';
                }
                else if (error.message.includes('Password should be at least')) {
                    errorMessage = 'Password must be at least 6 characters long and meet security requirements.';
                }
                else if (error.message.includes('Unable to validate email address')) {
                    errorMessage = 'Please enter a valid email address.';
                }
                else if (error.message.includes('Signup is disabled')) {
                    errorMessage = 'Account creation is temporarily disabled. Please try again later.';
                }
                await this.securityLogger.logEvent('signup_failed', { email: data.email, error: error.message }, 'medium');
                return { success: false, error: errorMessage };
            }
            if (!authData.user) {
                const error = 'Failed to create user account. Please try again.';
                console.error('No user returned from Supabase');
                return { success: false, error };
            }
            console.log('Supabase signup successful:', authData.user?.id);
            await this.securityLogger.logEvent('user_signup_success', { email: data.email, user_id: authData.user?.id }, 'low');
            return { success: true, user: authData.user };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('AuthService.signUp unexpected error:', errorMessage);
            // Handle common errors without database-specific references
            let userErrorMessage = 'Account creation failed. Please try again.';
            if (errorMessage.includes('duplicate key value')) {
                userErrorMessage = 'An account with this email already exists. Please sign in instead.';
            }
            else if (errorMessage.includes('invalid input syntax')) {
                userErrorMessage = 'Please check your information and try again.';
            }
            await this.securityLogger.logEvent('auth_unexpected_error', { email: data.email, error: errorMessage }, 'high');
            return { success: false, error: userErrorMessage };
        }
    }
    static async signIn(data) {
        try {
            console.log('AuthService.signIn starting for:', data.email);
            // Basic validation
            if (!data.email || !data.password) {
                const error = 'Email and password are required';
                console.error('Required fields validation failed');
                return { success: false, error };
            }
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            });
            if (error) {
                console.error('Supabase signin error:', error);
                // Handle specific Supabase errors - bypass email confirmation completely
                let errorMessage = error.message;
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                }
                else if (error.message.includes('Email not confirmed')) {
                    // Since we've disabled confirmations, try to sign them in anyway
                    console.log('Email confirmation issue detected, but confirmations are disabled. Treating as invalid credentials.');
                    errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                }
                else if (error.message.includes('Too many requests')) {
                    errorMessage = 'Too many login attempts. Please wait a moment and try again.';
                }
                await this.securityLogger.logEvent('login_failed', { email: data.email, error: error.message }, 'medium');
                return { success: false, error: errorMessage };
            }
            if (!authData.user) {
                const error = 'Login failed. Please try again.';
                console.error('No user returned from Supabase signin');
                return { success: false, error };
            }
            console.log('Supabase signin successful:', authData.user?.id);
            await this.securityLogger.logEvent('user_login_success', { email: data.email, user_id: authData.user?.id }, 'low');
            return { success: true, user: authData.user };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('AuthService.signIn unexpected error:', errorMessage);
            await this.securityLogger.logEvent('auth_unexpected_error', { email: data.email, error: errorMessage }, 'high');
            return { success: false, error: 'Login failed. Please check your connection and try again.' };
        }
    }
    static async signOut() {
        try {
            console.log('AuthService.signOut starting');
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
            }
            else {
                console.log('Sign out successful');
            }
        }
        catch (error) {
            console.error('Unexpected sign out error:', error);
        }
    }
    static async resendConfirmationEmail(email) {
        try {
            console.log('AuthService.resendConfirmationEmail starting for:', email);
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                const error = 'Please enter a valid email address';
                console.error('Email format validation failed');
                return { success: false, error };
            }
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) {
                console.error('Supabase resend confirmation error:', error);
                // Handle specific Supabase errors
                let errorMessage = error.message;
                if (error.message.includes('For security purposes')) {
                    errorMessage = 'For security reasons, you can only request a new confirmation email once per minute. Please wait and try again.';
                }
                else if (error.message.includes('User not found')) {
                    errorMessage = 'No account found with this email address. Please sign up first.';
                }
                else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Your email is not confirmed yet. A new confirmation email has been sent.';
                }
                await this.securityLogger.logEvent('resend_confirmation_failed', { email: email, error: error.message }, 'medium');
                return { success: false, error: errorMessage };
            }
            console.log('Confirmation email resent successfully');
            await this.securityLogger.logEvent('resend_confirmation_success', { email: email }, 'low');
            return { success: true };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('AuthService.resendConfirmationEmail unexpected error:', errorMessage);
            await this.securityLogger.logEvent('resend_confirmation_unexpected_error', { email: email, error: errorMessage }, 'high');
            return { success: false, error: 'Failed to resend confirmation email. Please try again.' };
        }
    }
}
