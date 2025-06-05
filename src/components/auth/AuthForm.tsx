
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validatePasswordStrength, sanitizePasswordInput } from '@/utils/passwordValidation';
import { logSecurityEventToDB } from '@/utils/enhancedSecurity';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sanitize password input
      const sanitizedPassword = sanitizePasswordInput(password);

      if (mode === 'signup') {
        // Validate password strength for signup
        const passwordValidation = validatePasswordStrength(sanitizedPassword);
        if (!passwordValidation.isValid) {
          setError(passwordValidation.error || 'Invalid password');
          setLoading(false);
          return;
        }

        // Check password confirmation
        if (sanitizedPassword !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Validate required fields
        if (!firstName.trim() || !lastName.trim()) {
          setError('First name and last name are required');
          setLoading(false);
          return;
        }

        // Sign up with custom bypass
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: sanitizedPassword,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim()
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          setError(signUpError.message);
          
          // Log security event for failed signup
          await logSecurityEventToDB(
            'signup_failed',
            { email, error: signUpError.message },
            'medium'
          );
        } else {
          toast({
            title: 'Account created successfully',
            description: 'Please check your email to verify your account.',
          });
          
          // Log successful signup
          await logSecurityEventToDB(
            'user_signup_success',
            { email, user_id: data.user?.id },
            'low'
          );
          
          navigate('/');
        }
      } else {
        // Login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: sanitizedPassword
        });

        if (signInError) {
          console.error('Login error:', signInError);
          setError(signInError.message);
          
          // Log security event for failed login
          await logSecurityEventToDB(
            'login_failed',
            { email, error: signInError.message },
            'medium'
          );
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have been successfully logged in.',
          });
          
          // Log successful login
          await logSecurityEventToDB(
            'user_login_success',
            { email, user_id: data.user?.id },
            'low'
          );
          
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('An unexpected error occurred. Please try again.');
      
      // Log unexpected error
      await logSecurityEventToDB(
        'auth_unexpected_error',
        { email, error: error instanceof Error ? error.message : 'Unknown error' },
        'high'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-blue-600 hover:underline"
            disabled={loading}
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
