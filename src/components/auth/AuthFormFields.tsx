
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  score: number;
  suggestions: string[];
}

interface AuthFormFieldsProps {
  isLogin: boolean;
  formData: AuthFormData;
  passwordValidation: PasswordValidation;
  loading: boolean;
  onFormDataChange: (data: AuthFormData) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

const AuthFormFields = ({
  isLogin,
  formData,
  passwordValidation,
  loading,
  onFormDataChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
  onForgotPassword
}: AuthFormFieldsProps) => {
  
  const handleAccountRecovery = async () => {
    const email = prompt("Enter your email to recover your account:");
    if (!email) return;

    try {
      // Fetch username from 'profiles' table using email
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (fetchError || resetError) {
        toast({
          title: 'Recovery Error',
          description: 'There was a problem. Please try again or contact support.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Recovery Email Sent',
          description: 'If this email is registered, a reset link has been sent to your email address.',
        });
      }
    } catch (error) {
      console.error('Account recovery error:', error);
      toast({
        title: 'Recovery Error',
        description: 'There was a problem. Please try again or contact support.',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
          placeholder="your@email.com"
          required
          disabled={loading}
        />
      </div>

      <PasswordInput
        id="password"
        label="Password"
        value={formData.password}
        onChange={onPasswordChange}
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
          onChange={(value) => onFormDataChange({ ...formData, confirmPassword: value })}
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
        onClick={onToggleMode}
        disabled={loading}
      >
        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </Button>

      {isLogin && (
        <div className="text-center mt-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleAccountRecovery();
            }}
            className="text-sm text-blue-600 hover:text-blue-700 underline cursor-pointer"
          >
            Forgot Username or Password?
          </a>
        </div>
      )}
    </form>
  );
};

export default AuthFormFields;
