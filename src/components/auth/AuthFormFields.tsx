
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

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

      {/* Forgot credentials section - more prominent for both login and signup */}
      <div className="text-center space-y-2">
        <Button
          type="button"
          variant="link"
          className="text-sm text-muted-foreground hover:text-primary"
          onClick={onForgotPassword}
          disabled={loading}
        >
          Forgot your email or password?
        </Button>
        <p className="text-xs text-muted-foreground">
          We'll help you recover your account
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onToggleMode}
        disabled={loading}
      >
        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
      </Button>
    </form>
  );
};

export default AuthFormFields;
