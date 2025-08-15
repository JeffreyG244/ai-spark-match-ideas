import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from './PasswordInput';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
const AuthFormFields = ({ isLogin, formData, passwordValidation, loading, onFormDataChange, onPasswordChange, onSubmit, onToggleMode, onForgotPassword, onResendConfirmation }) => {
    const [showForgotForm, setShowForgotForm] = useState(false);
    const [showResendForm, setShowResendForm] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [resendEmail, setResendEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const handleForgotPassword = async (e) => {
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
            }
            else {
                toast({
                    title: 'Reset Email Sent',
                    description: 'If an account with this email exists, a password reset link has been sent.',
                });
                setShowForgotForm(false);
                setForgotEmail('');
            }
        }
        catch (error) {
            console.error('Password reset error:', error);
            toast({
                title: 'Reset Error',
                description: 'There was a problem. Please try again or contact support.',
                variant: 'destructive'
            });
        }
        finally {
            setForgotLoading(false);
        }
    };
    const handleResendConfirmation = async (e) => {
        e.preventDefault();
        if (!resendEmail) {
            toast({
                title: 'Email Required',
                description: 'Please enter your email address.',
                variant: 'destructive'
            });
            return;
        }
        setResendLoading(true);
        try {
            if (onResendConfirmation) {
                await onResendConfirmation(resendEmail);
                setShowResendForm(false);
                setResendEmail('');
            }
        }
        catch (error) {
            console.error('Resend confirmation error:', error);
        }
        finally {
            setResendLoading(false);
        }
    };
    const handleFormSubmit = (e) => {
        e.preventDefault();
        console.log('Form submit attempt:', {
            isLogin,
            email: formData.email,
            hasPassword: !!formData.password,
            passwordLength: formData.password?.length || 0,
            passwordValid: passwordValidation.isValid
        });
        // Basic client-side validation before calling parent submit
        if (!formData.email) {
            toast({
                title: 'Email Required',
                description: 'Please enter your email address.',
                variant: 'destructive'
            });
            return;
        }
        if (!formData.password) {
            toast({
                title: 'Password Required',
                description: 'Please enter your password.',
                variant: 'destructive'
            });
            return;
        }
        if (!isLogin && formData.password.length < 6) {
            toast({
                title: 'Password Too Short',
                description: 'Password must be at least 6 characters long.',
                variant: 'destructive'
            });
            return;
        }
        if (!isLogin && !passwordValidation.isValid) {
            toast({
                title: 'Weak Password',
                description: 'Please choose a stronger password that meets the security requirements.',
                variant: 'destructive'
            });
            return;
        }
        if (!isLogin && formData.password !== formData.confirmPassword) {
            toast({
                title: 'Passwords Don\'t Match',
                description: 'Please make sure both passwords are identical.',
                variant: 'destructive'
            });
            return;
        }
        // Call parent submit handler
        onSubmit(e);
    };
    if (showForgotForm) {
        return (<div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Forgot Password or Username?</h3>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you recovery instructions.
          </p>
        </div>
        
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email Address</Label>
            <Input id="forgot-email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Enter your email address" required disabled={forgotLoading}/>
          </div>

          <Button type="submit" className="w-full" disabled={forgotLoading || !forgotEmail}>
            {forgotLoading ? 'Sending...' : 'Send Recovery Email'}
          </Button>
        </form>

        <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotForm(false)} disabled={forgotLoading}>
          Back to Sign In
        </Button>
      </div>);
    }
    if (showResendForm) {
        return (<div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Resend Confirmation Email</h3>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a new confirmation link.
          </p>
        </div>
        
        <form onSubmit={handleResendConfirmation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resend-email">Email Address</Label>
            <Input id="resend-email" type="email" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} placeholder="Enter your email address" required disabled={resendLoading}/>
          </div>

          <Button type="submit" className="w-full" disabled={resendLoading || !resendEmail}>
            {resendLoading ? 'Sending...' : 'Resend Confirmation Email'}
          </Button>
        </form>

        <Button type="button" variant="ghost" className="w-full" onClick={() => setShowResendForm(false)} disabled={resendLoading}>
          Back to Sign In
        </Button>
      </div>);
    }
    return (<div className="space-y-4">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })} placeholder="your@email.com" required disabled={loading} autoComplete="email"/>
        </div>

        <PasswordInput id="password" label="Password" value={formData.password} onChange={onPasswordChange} disabled={loading} required autoComplete={isLogin ? "current-password" : "new-password"}/>

        <PasswordStrengthIndicator passwordValidation={passwordValidation} showIndicator={!isLogin && !!formData.password}/>

        {!isLogin && (<PasswordInput id="confirmPassword" label="Confirm Password" value={formData.confirmPassword} onChange={(value) => onFormDataChange({ ...formData, confirmPassword: value })} placeholder="Confirm your password" disabled={loading} required showVisibilityToggle={false} autoComplete="new-password"/>)}

        <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white" disabled={loading || (!isLogin && (!passwordValidation.isValid || formData.password.length < 6))}>
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <button type="button" onClick={() => setShowForgotForm(true)} className="text-sm text-blue-600 hover:text-blue-800 underline font-medium block" disabled={loading}>
          Forgot your password or username?
        </button>
        
        {isLogin && (<button type="button" onClick={() => setShowResendForm(true)} className="text-sm text-green-600 hover:text-green-800 underline font-medium block" disabled={loading}>
            Didn't receive confirmation email?
          </button>)}
      </div>

      <Button type="button" variant="ghost" className="w-full" onClick={onToggleMode} disabled={loading}>
        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </Button>
    </div>);
};
export default AuthFormFields;
