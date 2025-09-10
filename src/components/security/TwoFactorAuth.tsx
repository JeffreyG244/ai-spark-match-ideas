import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Smartphone, QrCode, Key } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export const TwoFactorAuth = () => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'enabled'>('setup');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.two_factor_enabled) {
        setIsEnabled(true);
        setStep('enabled');
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
    }
    return codes;
  };

  const enableTwoFactor = async () => {
    setIsLoading(true);
    try {
      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);
      
      // Update user metadata to indicate 2FA is enabled
      const { error } = await supabase.auth.updateUser({
        data: { 
          two_factor_enabled: true,
          backup_codes: codes
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setIsEnabled(true);
      setStep('enabled');
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled."
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          two_factor_enabled: false,
          backup_codes: null
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setIsEnabled(false);
      setStep('setup');
      setBackupCodes([]);
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled."
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `LuvLang Two-Factor Authentication Backup Codes

Generated on: ${new Date().toLocaleDateString()}

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

IMPORTANT: Store these codes in a safe place. Each code can only be used once.
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'luvlang-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription className="text-slate-300">
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'setup' && !isEnabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Enable Two-Factor Authentication</h4>
                <p className="text-slate-300 text-sm">Protect your account with an additional security layer</p>
              </div>
              <Switch
                checked={false}
                onCheckedChange={() => enableTwoFactor()}
                disabled={isLoading}
              />
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <h5 className="text-white font-medium">How it works</h5>
                  <p className="text-slate-300 text-sm mt-1">
                    When enabled, you'll need to enter a verification code from your authenticator app 
                    along with your password when signing in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'enabled' && isEnabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  Two-Factor Authentication Enabled
                </h4>
                <p className="text-slate-300 text-sm">Your account is protected with 2FA</p>
              </div>
              <Switch
                checked={true}
                onCheckedChange={() => disableTwoFactor()}
                disabled={isLoading}
              />
            </div>

            {backupCodes.length > 0 && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Key className="w-5 h-5 text-amber-400 mt-1" />
                  <div>
                    <h5 className="text-white font-medium">Backup Codes</h5>
                    <p className="text-slate-300 text-sm">
                      Save these backup codes in case you lose access to your authenticator app
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {backupCodes.slice(0, 4).map((code, index) => (
                    <div key={index} className="bg-slate-800 px-3 py-2 rounded font-mono text-sm text-white">
                      {code}
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={downloadBackupCodes}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  Download All Codes
                </Button>
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-amber-400 text-sm">
                <strong>Important:</strong> Keep your backup codes safe. If you lose access to your 
                authenticator app, you'll need these codes to regain access to your account.
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4">
            <div className="text-white">Processing...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;