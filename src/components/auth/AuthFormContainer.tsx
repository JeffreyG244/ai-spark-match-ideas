
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AuthFormHeader from './AuthFormHeader';
import AuthFormFields from './AuthFormFields';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthFormContainerProps {
  onProfileStepChange: (step: 'auth' | 'profile') => void;
}

type AuthView = 'auth' | 'forgot-password';

const AuthFormContainer = ({ onProfileStepChange }: AuthFormContainerProps) => {
  const { secureAction, validateInput, validatePassword } = useEnhancedSecurity();
  const [currentView, setCurrentView] = useState<AuthView>('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
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
                  password: formData.password
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
          windowSeconds: 300
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
          onProfileStepChange('profile');
        }
        
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

  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handleBackToAuth = () => {
    setCurrentView('auth');
  };

  if (currentView === 'forgot-password') {
    return <ForgotPasswordForm onBackToAuth={handleBackToAuth} />;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <AuthFormHeader />
      <CardContent>
        <AuthFormFields
          isLogin={isLogin}
          formData={formData}
          passwordValidation={passwordValidation}
          loading={loading}
          onFormDataChange={setFormData}
          onPasswordChange={handlePasswordChange}
          onSubmit={handleSubmit}
          onToggleMode={() => setIsLogin(!isLogin)}
          onForgotPassword={handleForgotPassword}
        />
      </CardContent>
    </Card>
  );
};

export default AuthFormContainer;
