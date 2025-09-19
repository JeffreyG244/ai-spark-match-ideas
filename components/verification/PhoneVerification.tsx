import React, { useState } from 'react';
import { Phone, Check, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PhoneVerificationProps {
  onVerified?: () => void;
  required?: boolean;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({ 
  onVerified, 
  required = false 
}) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Send verification code
  const sendVerificationCode = async () => {
    if (!phoneNumber || phoneNumber.length < 14) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Clean phone number for storage
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      
      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code in database temporarily
      const { error: dbError } = await supabase
        .from('phone_verifications')
        .upsert({
          user_id: user?.id,
          phone_number: `+1${cleanedPhone}`,
          verification_code: code,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        });

      if (dbError) throw dbError;

      // Send SMS via edge function
      const { error: smsError } = await supabase.functions.invoke('send-verification-sms', {
        body: {
          phone: `+1${cleanedPhone}`,
          code: code
        }
      });

      if (smsError) {
        console.warn('SMS sending failed, but code stored:', smsError);
        toast({
          title: "SMS Service Unavailable",
          description: `Verification code for testing: ${code}`,
          duration: 10000
        });
      } else {
        toast({
          title: "Verification Code Sent",
          description: "Please check your phone for the 6-digit code",
        });
      }

      setStep('verify');
      
    } catch (error) {
      console.error('Phone verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Could not send verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify the code
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Check verification code
      const { data, error } = await supabase
        .from('phone_verifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('verification_code', verificationCode)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect or expired",
          variant: "destructive"
        });
        return;
      }

      // Update user record with verified phone
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          phone_number: data.phone_number,
          phone_verified: true,
          phone_verified_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Clean up verification record
      await supabase
        .from('phone_verifications')
        .delete()
        .eq('user_id', user?.id);

      setIsVerified(true);
      toast({
        title: "Phone Verified!",
        description: "Your phone number has been successfully verified",
      });

      onVerified?.();

    } catch (error) {
      console.error('Code verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Could not verify the code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">Phone Verified</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Your phone number {phoneNumber} is verified
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="w-5 h-5" />
          <span>Phone Verification</span>
          {required && (
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'input' ? (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                maxLength={14}
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send a verification code to this number
              </p>
            </div>
            
            <Button 
              onClick={sendVerificationCode}
              disabled={isLoading || phoneNumber.length < 14}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Verification Code
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-gray-500 mt-1">
                Code sent to {phoneNumber}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                disabled={isLoading}
                className="flex-1"
              >
                Change Number
              </Button>
              <Button 
                onClick={verifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={sendVerificationCode}
              disabled={isLoading}
              className="w-full text-sm"
            >
              Resend Code
            </Button>
          </>
        )}

        <div className="flex items-start space-x-2 text-xs text-gray-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Phone verification helps ensure account security and enables features like 
            SMS notifications and account recovery.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};