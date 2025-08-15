import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
const LoginForm = () => {
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast({
                title: 'Missing Information',
                description: 'Please enter both email and password.',
                variant: 'destructive'
            });
            return;
        }
        setLoading(true);
        try {
            await signIn(formData.email, formData.password);
            toast({
                title: 'Welcome back!',
                description: 'You have successfully signed in.',
            });
        }
        catch (error) {
            console.error('Login error:', error);
            toast({
                title: 'Sign In Failed',
                description: 'Please check your credentials and try again.',
                variant: 'destructive'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotPasswordEmail) {
            toast({
                title: 'Email Required',
                description: 'Please enter your email address.',
                variant: 'destructive'
            });
            return;
        }
        console.log('Attempting to send password reset email to:', forgotPasswordEmail);
        setForgotPasswordLoading(true);
        try {
            // Use our custom password reset function
            console.log('Calling send-password-reset function...');
            const { data, error } = await supabase.functions.invoke('send-password-reset', {
                body: { email: forgotPasswordEmail }
            });
            console.log('Password reset response:', { data, error });
            if (error) {
                console.error('Password reset error details:', error);
                toast({
                    title: 'Reset Failed',
                    description: `Error: ${error.message}. Please try again or contact support.`,
                    variant: 'destructive'
                });
            }
            else {
                console.log('Password reset email sent successfully');
                toast({
                    title: '✅ Reset Email Sent!',
                    description: `A password reset link has been sent to ${forgotPasswordEmail}. Please check your email (including spam folder).`,
                    duration: 6000,
                });
                // Clear the form and go back to login after success
                setForgotPasswordEmail('');
                setTimeout(() => {
                    setShowForgotPassword(false);
                }, 2000);
            }
        }
        catch (error) {
            console.error('Unexpected password reset error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast({
                title: 'Reset Failed',
                description: `Unexpected error: ${errorMessage}. Please try again or contact support.`,
                variant: 'destructive'
            });
        }
        finally {
            setForgotPasswordLoading(false);
        }
    };
    if (showForgotPassword) {
        return (<div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white"/>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Reset Your Password
            </CardTitle>
            <p className="text-gray-600 text-sm">Enter your email to receive a password reset link</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="resetEmail">Email Address</Label>
                <Input id="resetEmail" type="email" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} placeholder="Enter your email address" required disabled={forgotPasswordLoading}/>
              </div>

              <Button type="submit" disabled={forgotPasswordLoading || !forgotPasswordEmail.trim()} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-6 text-lg">
                {forgotPasswordLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
            }} disabled={forgotPasswordLoading} className="text-gray-600 hover:text-gray-800">
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-white"/>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600 text-sm">Sign in to continue your journey</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="Enter your email" required/>
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Enter your password" required/>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-6 text-lg mt-6">
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => setShowForgotPassword(true)} className="text-gray-600 hover:text-gray-800 text-sm">
              Forgot your password?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default LoginForm;
