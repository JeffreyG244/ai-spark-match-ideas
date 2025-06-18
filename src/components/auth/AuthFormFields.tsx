
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
  
  const handleForgotPassword = async () => {
    const email = prompt("Enter your email address to reset your password:");
    if (!email) return;
    
    if (!email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Sending password reset email to:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: 'Reset Error',
          description: 'There was a problem sending the reset email. Please try again.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Reset Email Sent',
          description: 'If an account with this email exists, a password reset link has been sent.',
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Reset Error',
        description: 'There was a problem. Please try again or contact support.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
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
      </form>

      {isLogin && (
        <div className="text-center py-2">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
            disabled={loading}
          >
            Forgot your password?
          </button>
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onToggleMode}
        disabled={loading}
      >
        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </Button>
    </div>
  );
};

export default AuthFormFields;
