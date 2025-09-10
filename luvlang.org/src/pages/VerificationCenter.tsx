import React, { useState, useEffect } from 'react';
import { Shield, Phone, Camera, FileText, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PhoneVerification } from '@/components/verification/PhoneVerification';
import { PhotoVerification } from '@/components/verification/PhotoVerification';
import { IdentityVerification } from '@/components/verification/IdentityVerification';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface VerificationStatus {
  phone_verified: boolean;
  photo_verified: boolean;
  identity_verified: boolean;
  phone_verified_at?: string;
  photo_verified_at?: string;
  identity_verified_at?: string;
}

export const VerificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    phone_verified: false,
    photo_verified: false,
    identity_verified: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone_verified, photo_verified, identity_verified, phone_verified_at, photo_verified_at, identity_verified_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching verification status:', error);
        return;
      }

      setVerificationStatus(data || {
        phone_verified: false,
        photo_verified: false,
        identity_verified: false
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationProgress = () => {
    const completedSteps = [
      verificationStatus.phone_verified,
      verificationStatus.photo_verified,
      verificationStatus.identity_verified
    ].filter(Boolean).length;
    
    return Math.round((completedSteps / 3) * 100);
  };

  const handleVerificationComplete = () => {
    // Refresh verification status when any step is completed
    fetchVerificationStatus();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verification Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your account verification to unlock all features and build trust 
            with other members of our community.
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Verification Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Progress</span>
                <span className="text-sm font-medium">{getVerificationProgress()}% Complete</span>
              </div>
              <Progress value={getVerificationProgress()} className="w-full" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center space-x-3">
                  <Phone className={`w-5 h-5 ${verificationStatus.phone_verified ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <Badge variant={verificationStatus.phone_verified ? 'default' : 'secondary'}>
                      {verificationStatus.phone_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  {verificationStatus.phone_verified && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <Camera className={`w-5 h-5 ${verificationStatus.photo_verified ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium">Photo</p>
                    <Badge variant={verificationStatus.photo_verified ? 'default' : 'secondary'}>
                      {verificationStatus.photo_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  {verificationStatus.photo_verified && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <FileText className={`w-5 h-5 ${verificationStatus.identity_verified ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium">Identity</p>
                    <Badge variant={verificationStatus.identity_verified ? 'default' : 'secondary'}>
                      {verificationStatus.identity_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  {verificationStatus.identity_verified && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Steps */}
        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
          {/* Phone Verification */}
          <div className="flex justify-center">
            <PhoneVerification 
              onVerified={handleVerificationComplete}
              required={true}
            />
          </div>

          {/* Photo Verification */}
          <div className="flex justify-center">
            <PhotoVerification 
              onVerified={handleVerificationComplete}
              required={true}
            />
          </div>

          {/* Identity Verification */}
          <div className="flex justify-center xl:col-span-2 2xl:col-span-1">
            <IdentityVerification 
              onVerified={handleVerificationComplete}
              required={false}
            />
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Why Verify Your Account?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Enhanced Security</h4>
                <p className="text-sm text-gray-600">
                  Protect your account and personal information with multiple layers of verification.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Build Trust</h4>
                <p className="text-sm text-gray-600">
                  Show other members that you're a real person and serious about connecting.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Unlock Features</h4>
                <p className="text-sm text-gray-600">
                  Access advanced matching features and premium functionality.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Priority Support</h4>
                <p className="text-sm text-gray-600">
                  Get faster response times and dedicated support from our team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};