
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AuthFormHeader from './AuthFormHeader';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import ProfileManager from '@/components/ProfileManager';

type AuthStep = 'auth' | 'profile';

const SecureAuthForm = () => {
  const { secureAction, validateInput, validatePassword } = useEnhancedSecurity();
  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState<AuthStep>('auth');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [] as string[],
    score: 0,
    suggestions: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    const validation = validatePassword(password);
    
    // Ensure all required properties are present with defaults
    setPasswordValidation({
      isValid: validation.isValid,
      errors: validation.errors || [],
      score: validation.score || validation.securityScore || 0,
      suggestions: validation.suggestions || []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email
      const emailValidation = validateInput(formData.email, {
        required: true,
        maxLength: 254
      });

      if (!emailValidation.isValid) {
        toast({
          title: 'Invalid Email',
          description: emailValidation.errors.join(', '),
          variant: 'destructive'
        });
        return;
      }

      // For registration, validate password
      if (!isLogin) {
        if (!passwordValidation.isValid) {
          toast({
            title: 'Weak Password',
            description: 'Please choose a stronger password.',
            variant: 'destructive'
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: 'Password Mismatch',
            description: 'Passwords do not match.',
            variant: 'destructive'
          });
          return;
        }
      }

      const actionResult = await secureAction(
        async () => {
          if (isLogin) {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: emailValidation.sanitizedValue!,
              password: formData.password
            });
            
            if (error) throw error;
            return data;
          } else {
            const { data, error } = await supabase.auth.signUp({
              email: emailValidation.sanitizedValue!,
              password: formData.password,
              options: {
                emailRedirectTo: `${window.location.origin}/`,
                data: {
                  password: formData.password // This will trigger our enhanced validation
                }
              }
            });
            
            if (error) throw error;
            return data;
          }
        },
        {
          rateLimitAction: isLogin ? 'login_attempt' : 'signup_attempt',
          maxRequests: 5,
          windowSeconds: 300 // 5 minutes
        }
      );

      if (actionResult.success) {
        if (isLogin) {
          toast({
            title: 'Login Successful',
            description: 'Welcome back!',
          });
        } else {
          toast({
            title: 'Account Created',
            description: 'Complete your profile to get started!',
          });
          // For new signups, immediately move to profile creation step
          setCurrentStep('profile');
        }
        
        // Reset form only if staying on auth step
        if (isLogin) {
          setFormData({ email: '', password: '', confirmPassword: '' });
          setPasswordValidation({ isValid: false, errors: [], score: 0, suggestions: [] });
        }
      } else {
        toast({
          title: 'Authentication Failed',
          description: actionResult.error || 'Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // If user is in profile creation step, show ProfileManager with all tabs
  if (currentStep === 'profile') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <AuthFormHeader title="Complete Your Luvlang Profile" />
        <CardContent>
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep('auth')}
              className="mb-4"
            >
              ← Back to Authentication
            </Button>
          </div>
          <ProfileManager />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <AuthFormHeader />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <PasswordInput
            id="password"
            label="Password"
            value={formData.password}
            onChange={handlePasswordChange}
            disabled={loading}
            required
          />

          <PasswordStrengthIndicator
            passwordValidation={passwordValidation}
            showIndicator={!isLogin && !!formData.password}
          />

          {!isLogin && (
            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              placeholder="Confirm your password"
              disabled={loading}
              required
              showVisibilityToggle={false}
            />
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || (!isLogin && !passwordValidation.isValid)}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecureAuthForm;
