import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import HCaptchaComponent from './HCaptchaComponent';
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
  onSubmit: (e: React.FormEvent, captchaToken?: string) => void;
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
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    console.log('Captcha verified successfully:', token.substring(0, 20) + '...');
    toast({
      title: 'Captcha Verified',
      description: 'You can now proceed with account creation.',
    });
  };

  const handleCaptchaError = () => {
    setCaptchaToken('');
    toast({
      title: 'Captcha Error',
      description: 'Please complete the captcha verification to continue.',
      variant: 'destructive'
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive'
      });
      return;
    }

    setForgotLoading(true);
    try {
      console.log('Sending password reset email to:', forgotEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
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
        setShowForgotForm(false);
        setForgotEmail('');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Reset Error',
        description: 'There was a problem. Please try again or contact support.',
        variant: 'destructive'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !captchaToken) {
      toast({
        title: 'Captcha Required',
        description: 'Please complete the captcha verification before creating your account.',
        variant: 'destructive'
      });
      return;
    }
    
    // Pass the captcha token to the parent component
    onSubmit(e, captchaToken);
  };

  if (showForgotForm) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Forgot Password or Username?</h3>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you recovery instructions.
          </p>
        </div>
        
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email Address</Label>
            <Input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={forgotLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={forgotLoading || !forgotEmail}
          >
            {forgotLoading ? 'Sending...' : 'Send Recovery Email'}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => setShowForgotForm(false)}
          disabled={forgotLoading}
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleFormSubmit} className="space-y-4">
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
          <>
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
            
            <HCaptchaComponent 
              onVerify={handleCaptchaVerify}
              onError={handleCaptchaError}
            />
          </>
        )}

        <Button 
          type="submit" 
          className="w-full bg-black hover:bg-gray-800 text-white" 
          disabled={loading || (!isLogin && (!passwordValidation.isValid || !captchaToken))}
        >
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </Button>
      </form>

      {/* Moved forgot password link right below the Create Account/Sign In button */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowForgotForm(true)}
          className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
          disabled={loading}
        >
          Forgot your password or username?
        </button>
      </div>

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
