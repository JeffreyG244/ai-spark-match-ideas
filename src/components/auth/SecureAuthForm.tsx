import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff } from 'lucide-react';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const SecureAuthForm = () => {
  const { secureAction, validateInput, validatePassword } = useEnhancedSecurity();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
      errors: validation.errors,
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
        toast({
          title: isLogin ? 'Login Successful' : 'Account Created',
          description: isLogin 
            ? 'Welcome back!' 
            : 'Please check your email to verify your account.',
        });
        
        // Reset form
        setFormData({ email: '', password: '', confirmPassword: '' });
        setPasswordValidation({ isValid: false, errors: [], score: 0, suggestions: [] });
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

  const getPasswordStrengthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Weak';
    return 'Very Weak';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/e501bc81-b261-404b-addf-aecdebd100ae.png" 
            alt="Luvlang" 
            className="h-8 w-auto"
          />
          {isLogin ? 'Welcome Back to Luvlang!' : 'Secure Registration'}
        </CardTitle>
      </CardHeader>
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {!isLogin && formData.password && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Password Strength:</span>
                  <span className={
                    passwordValidation.score >= 80 ? 'text-green-600' :
                    passwordValidation.score >= 60 ? 'text-blue-600' :
                    passwordValidation.score >= 40 ? 'text-yellow-600' :
                    'text-red-600'
                  }>
                    {getPasswordStrengthText(passwordValidation.score)}
                  </span>
                </div>
                <Progress 
                  value={passwordValidation.score} 
                  className="h-2"
                />
                <div className={`h-2 rounded-full ${getPasswordStrengthColor(passwordValidation.score)}`} 
                     style={{ width: `${passwordValidation.score}%` }} />
                
                {passwordValidation.errors.length > 0 && (
                  <Alert>
                    <AlertDescription>
                      <ul className="list-disc list-inside text-sm">
                        {passwordValidation.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                required
                disabled={loading}
              />
            </div>
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
