import { useState } from 'react';
import { AuthService } from '@/services/auth/AuthService';
import { validateEmailFormat, sanitizeAuthInput } from '@/utils/authConfig';
import { validatePasswordStrength, sanitizePasswordInput } from '@/utils/passwordValidation';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
export const useAuthentication = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const signUp = async (email, password, confirmPassword, firstName, lastName) => {
        console.log('useAuthentication.signUp called with:', {
            email,
            firstName,
            lastName,
            passwordLength: password.length
        });
        setError(null);
        setLoading(true);
        try {
            // Sanitize inputs first
            const sanitizedEmail = sanitizeAuthInput(email);
            const sanitizedPassword = sanitizePasswordInput(password);
            const sanitizedFirstName = sanitizeAuthInput(firstName);
            const sanitizedLastName = sanitizeAuthInput(lastName);
            console.log('Sanitized inputs:', {
                email: sanitizedEmail,
                passwordLength: sanitizedPassword.length,
                firstName: sanitizedFirstName,
                lastName: sanitizedLastName
            });
            // Validate email format
            if (!validateEmailFormat(sanitizedEmail)) {
                const errorMsg = 'Please enter a valid email address';
                console.error('Email validation failed:', errorMsg);
                setError(errorMsg);
                setLoading(false);
                return;
            }
            // Validate password strength BEFORE sending to database
            const passwordValidation = validatePasswordStrength(sanitizedPassword);
            if (!passwordValidation.isValid) {
                const errorMsg = passwordValidation.error || 'Password does not meet requirements';
                console.error('Password validation failed:', errorMsg);
                setError(errorMsg);
                setLoading(false);
                return;
            }
            // Check password confirmation
            if (sanitizedPassword !== confirmPassword) {
                const errorMsg = 'Passwords do not match';
                console.error('Password confirmation failed');
                setError(errorMsg);
                setLoading(false);
                return;
            }
            // Validate names
            if (!sanitizedFirstName.trim() || !sanitizedLastName.trim()) {
                const errorMsg = 'First name and last name are required';
                console.error('Name validation failed');
                setError(errorMsg);
                setLoading(false);
                return;
            }
            const signUpData = {
                email: sanitizedEmail,
                password: sanitizedPassword,
                firstName: sanitizedFirstName,
                lastName: sanitizedLastName
            };
            console.log('Calling AuthService.signUp with validated data');
            const result = await AuthService.signUp(signUpData);
            if (!result.success) {
                console.error('Signup failed:', result.error);
                // Handle specific database errors
                if (result.error?.includes('Password must be at least')) {
                    setError('Password must be at least 6 characters long and meet security requirements.');
                }
                else if (result.error?.includes('User already registered')) {
                    setError('An account with this email already exists. Please sign in instead.');
                }
                else if (result.error?.includes('Invalid email')) {
                    setError('Please enter a valid email address.');
                }
                else {
                    setError(result.error || 'Account creation failed. Please try again.');
                }
                setLoading(false);
                return;
            }
            console.log('Signup successful, user created');
            toast({
                title: 'Account created successfully',
                description: 'Welcome to Luvlang! You can now start using the app.',
            });
            navigate('/dashboard');
        }
        catch (error) {
            console.error('Signup unexpected error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            if (errorMessage.includes('Password must be at least')) {
                setError('Password must be at least 6 characters long and meet security requirements.');
            }
            else if (errorMessage.includes('duplicate key value')) {
                setError('An account with this email already exists. Please sign in instead.');
            }
            else {
                setError('Account creation failed. Please check your information and try again.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    const signIn = async (email, password) => {
        setError(null);
        setLoading(true);
        try {
            const sanitizedEmail = sanitizeAuthInput(email);
            const sanitizedPassword = sanitizePasswordInput(password);
            if (!validateEmailFormat(sanitizedEmail)) {
                setError('Please enter a valid email address');
                setLoading(false);
                return;
            }
            if (!sanitizedPassword || sanitizedPassword.length < 1) {
                setError('Please enter your password');
                setLoading(false);
                return;
            }
            console.log('Attempting signin with email:', sanitizedEmail);
            const signInData = {
                email: sanitizedEmail,
                password: sanitizedPassword
            };
            const result = await AuthService.signIn(signInData);
            if (!result.success) {
                console.error('Login failed:', result.error);
                // Provide more specific error messages
                if (result.error?.includes('Invalid login credentials')) {
                    setError('Invalid email or password. Please check your credentials and try again.');
                }
                else if (result.error?.includes('Email not confirmed')) {
                    setError('Please check your email and click the confirmation link before signing in.');
                }
                else if (result.error?.includes('Too many requests')) {
                    setError('Too many login attempts. Please wait a moment and try again.');
                }
                else {
                    setError(result.error || 'Login failed. Please try again.');
                }
                setLoading(false);
                return;
            }
            console.log('Login successful');
            toast({
                title: 'Welcome back!',
                description: 'You have been successfully logged in.',
            });
            navigate('/dashboard');
        }
        catch (error) {
            console.error('Login unexpected error:', error);
            setError('Login failed. Please check your connection and try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const resendConfirmationEmail = async (email) => {
        setError(null);
        setLoading(true);
        try {
            const sanitizedEmail = sanitizeAuthInput(email);
            if (!validateEmailFormat(sanitizedEmail)) {
                setError('Please enter a valid email address');
                setLoading(false);
                return;
            }
            console.log('Resending confirmation email to:', sanitizedEmail);
            const result = await AuthService.resendConfirmationEmail(sanitizedEmail);
            if (!result.success) {
                console.error('Resend confirmation failed:', result.error);
                setError(result.error || 'Failed to resend confirmation email. Please try again.');
                setLoading(false);
                return;
            }
            console.log('Confirmation email resent successfully');
            toast({
                title: 'Confirmation email sent',
                description: 'Please check your email and click the confirmation link to activate your account.',
            });
        }
        catch (error) {
            console.error('Resend confirmation unexpected error:', error);
            setError('Failed to resend confirmation email. Please check your connection and try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return {
        loading,
        error,
        signUp,
        signIn,
        resendConfirmationEmail
    };
};
