
import { useState } from 'react';
import { AuthService, SignUpData, SignInData } from '@/services/auth/AuthService';
import { validateEmailFormat, sanitizeAuthInput } from '@/utils/authConfig';
import { sanitizePasswordInput } from '@/utils/passwordValidation';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useAuthentication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const signUp = async (
    email: string, 
    password: string, 
    confirmPassword: string, 
    firstName: string, 
    lastName: string,
    captchaToken?: string
  ) => {
    setError(null);
    setLoading(true);

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeAuthInput(email);
      const sanitizedPassword = sanitizePasswordInput(password);
      const sanitizedFirstName = sanitizeAuthInput(firstName);
      const sanitizedLastName = sanitizeAuthInput(lastName);

      // Validate inputs
      if (!validateEmailFormat(sanitizedEmail)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (sanitizedPassword !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (!sanitizedFirstName || !sanitizedLastName) {
        setError('First name and last name are required');
        setLoading(false);
        return;
      }

      if (!captchaToken) {
        setError('Please complete the captcha verification');
        setLoading(false);
        return;
      }

      const signUpData: SignUpData = {
        email: sanitizedEmail,
        password: sanitizedPassword,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName
      };

      console.log('Attempting signup with:', { 
        email: sanitizedEmail, 
        firstName: sanitizedFirstName, 
        lastName: sanitizedLastName,
        hasCaptcha: !!captchaToken
      });
      
      const result = await AuthService.signUp(signUpData);

      if (!result.success) {
        console.error('Signup failed:', result.error);
        setError(result.error || 'Signup failed');
        setLoading(false);
        return;
      }

      console.log('Signup successful');
      toast({
        title: 'Account created successfully',
        description: 'Welcome to Luvlang! Please check your email to verify your account.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
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

      console.log('Attempting signin with email:', sanitizedEmail);

      const signInData: SignInData = {
        email: sanitizedEmail,
        password: sanitizedPassword
      };

      const result = await AuthService.signIn(signInData);

      if (!result.success) {
        console.error('Login failed:', result.error);
        
        // Provide more specific error messages
        if (result.error?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (result.error?.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else {
          setError(result.error || 'Login failed');
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
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    signUp,
    signIn
  };
};
