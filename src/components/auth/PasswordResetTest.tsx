
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PasswordResetTest = () => {
  const [email, setEmail] = useState('jeffreytgravescas@gmail.com');
  const [loading, setLoading] = useState(false);

  const testPasswordReset = async () => {
    setLoading(true);
    console.log('Testing password reset for:', email);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      console.log('Password reset test response:', { data, error });

      if (error) {
        console.error('Password reset test error:', error);
        toast({
          title: 'Test Failed',
          description: `Error: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        console.log('Password reset test successful:', data);
        toast({
          title: '✅ Test Successful!',
          description: `Password reset email sent to ${email}. Check your inbox and spam folder!`,
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('Unexpected test error:', error);
      toast({
        title: 'Test Failed',
        description: 'Unexpected error occurred. Check console for details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Password Reset Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-email">Test Email</Label>
          <Input
            id="test-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email to test"
          />
        </div>
        
        <Button 
          onClick={testPasswordReset}
          disabled={loading || !email.trim()}
          className="w-full"
        >
          {loading ? 'Sending Test Email...' : 'Test Password Reset'}
        </Button>
        
        <p className="text-sm text-gray-600">
          This will send a test password reset email using our custom function.
        </p>
      </CardContent>
    </Card>
  );
};

export default PasswordResetTest;
