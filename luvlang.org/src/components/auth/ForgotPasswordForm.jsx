import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
const ForgotPasswordForm = ({ onBackToAuth }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [activeTab, setActiveTab] = useState('password');
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) {
                toast({
                    title: 'Error',
                    description: error.message,
                    variant: 'destructive'
                });
            }
            else {
                setEmailSent(true);
                toast({
                    title: 'Password Reset Email Sent',
                    description: 'Check your email for instructions to reset your password.',
                });
            }
        }
        catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleEmailRecovery = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // For email recovery, we'll send a password reset which will show the email
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) {
                toast({
                    title: 'Error',
                    description: error.message,
                    variant: 'destructive'
                });
            }
            else {
                setEmailSent(true);
                toast({
                    title: 'Account Recovery Email Sent',
                    description: 'If an account exists with this email, you will receive recovery instructions.',
                });
            }
        }
        catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive'
            });
        }
        finally {
            setLoading(false);
        }
    };
    if (emailSent) {
        return (<Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              We've sent recovery instructions to {email}. Please check your email and follow the instructions to recover your account.
            </AlertDescription>
          </Alert>
          <Button variant="ghost" className="w-full mt-4" onClick={onBackToAuth}>
            Back to Sign In
          </Button>
        </CardContent>
      </Card>);
    }
    return (<Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Account Recovery</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Reset Password</TabsTrigger>
            <TabsTrigger value="email">Forgot Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="password" className="space-y-4">
            <div className="text-sm text-muted-foreground text-center mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" required disabled={loading}/>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !email}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="text-sm text-muted-foreground text-center mb-4">
              If you remember any email you might have used, enter it below and we'll help you recover your account.
            </div>
            <form onSubmit={handleEmailRecovery} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Possible Email Address</Label>
                <Input id="recovery-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter a possible email address" required disabled={loading}/>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !email}>
                {loading ? 'Checking...' : 'Send Recovery Email'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <Button type="button" variant="ghost" className="w-full mt-4" onClick={onBackToAuth} disabled={loading}>
          Back to Sign In
        </Button>
      </CardContent>
    </Card>);
};
export default ForgotPasswordForm;
