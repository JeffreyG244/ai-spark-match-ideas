
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

  const signUp = async (email: string, password: string, confirmPassword: string, firstName: string, lastName: string) => {
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
        return;
      }

      if (sanitizedPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!sanitizedFirstName || !sanitizedLastName) {
        setError('First name and last name are required');
        return;
      }

      const signUpData: SignUpData = {
        email: sanitizedEmail,
        password: sanitizedPassword,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName
      };

      const result = await AuthService.signUp(signUpData);

      if (!result.success) {
        setError(result.error || 'Signup failed');
        return;
      }

      toast({
        title: 'Account created successfully',
        description: 'Welcome to Luvlang! You can now start exploring.',
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
        return;
      }

      const signInData: SignInData = {
        email: sanitizedEmail,
        password: sanitizedPassword
      };

      const result = await AuthService.signIn(signInData);

      if (!result.success) {
        setError(result.error || 'Login failed');
        return;
      }

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
