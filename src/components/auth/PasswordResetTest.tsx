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
    try {
      console.log('Testing password reset for:', email);
      
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: 'Test Failed',
          description: `Error: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        console.log('Password reset response:', data);
        toast({
          title: 'Test Successful!',
          description: `Password reset email sent to ${email}. Check your inbox!`,
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
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
          disabled={loading || !email}
          className="w-full"
        >
          {loading ? 'Sending Test Email...' : 'Test Password Reset'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PasswordResetTest;