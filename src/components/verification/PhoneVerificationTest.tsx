import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerification } from '@/hooks/useVerification';
import { Phone, MessageSquare } from 'lucide-react';

export const PhoneVerificationTest = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const {
    loading,
    verificationCodeSent,
    sendVerificationSMS,
    verifyPhoneCode,
    verificationStatus
  } = useVerification();

  const handleSendCode = async () => {
    await sendVerificationSMS(phoneNumber);
  };

  const handleVerifyCode = async () => {
    await verifyPhoneCode(phoneNumber, verificationCode);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Verification Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verificationStatus?.phone_verified ? (
          <>
            <div className="space-y-2">
              <Input
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={verificationCodeSent}
              />
              {!verificationCodeSent && (
                <Button 
                  onClick={handleSendCode} 
                  disabled={loading || !phoneNumber}
                  className="w-full"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </Button>
              )}
            </div>
            
            {verificationCodeSent && (
              <div className="space-y-2">
                <Input
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                <Button 
                  onClick={handleVerifyCode} 
                  disabled={loading || !verificationCode}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-green-600">
            ✅ Phone verified successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
};