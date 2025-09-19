import React, { useState, useEffect } from 'react';
import { Shield, Phone, Camera, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneVerification } from '@/components/verification/PhoneVerification';
import { PhotoVerification } from '@/components/verification/PhotoVerification';
import { IdentityVerification } from '@/components/verification/IdentityVerification';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VerificationStatus {
  phone_verified: boolean;
  photo_verified: boolean;
  identity_verified: boolean;
  phone_number?: string;
  verification_photo_url?: string;
  identity_verification_status?: string;
}

const VerificationCenter = () => {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    phone_verified: false,
    photo_verified: false,
    identity_verified: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('phone');

  // Load verification status
  useEffect(() => {
    loadVerificationStatus();
  }, [user]);

  const loadVerificationStatus = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          phone_verified,
          photo_verified,
          identity_verified,
          phone_number,
          verification_photo_url,
          identity_verification_status
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setVerificationStatus(data || {
        phone_verified: false,
        photo_verified: false,
        identity_verified: false
      });

    } catch (error) {
      console.error('Error loading verification status:', error);
      toast({
        title: "Error",
        description: "Could not load verification status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = (type: string) => {
    setVerificationStatus(prev => ({
      ...prev,
      [`${type}_verified`]: true
    }));
    
    toast({
      title: "Verification Complete!",
      description: `Your ${type} verification has been completed`,
    });
    
    // Move to next tab
    if (type === 'phone' && !verificationStatus.photo_verified) {
      setActiveTab('photo');
    } else if (type === 'photo' && !verificationStatus.identity_verified) {
      setActiveTab('identity');
    }
  };

  const getVerificationLevel = () => {
    const { phone_verified, photo_verified, identity_verified } = verificationStatus;
    
    if (identity_verified) return { level: 'Premium', color: 'bg-purple-100 text-purple-800', count: 3 };
    if (photo_verified) return { level: 'Enhanced', color: 'bg-blue-100 text-blue-800', count: 2 };
    if (phone_verified) return { level: 'Basic', color: 'bg-green-100 text-green-800', count: 1 };
    return { level: 'Unverified', color: 'bg-gray-100 text-gray-800', count: 0 };
  };

  const verificationLevel = getVerificationLevel();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Center</h1>
          <p className="text-gray-600 mb-6">
            Complete your verification to build trust and unlock premium features
          </p>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-4">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Verification Level:</span>
                    <Badge variant="secondary" className={verificationLevel.color}>
                      {verificationLevel.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {verificationLevel.count}/3 verifications complete
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Benefits */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className={`border-2 ${verificationStatus.phone_verified ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Phone className="w-6 h-6 text-green-600" />
                {verificationStatus.phone_verified && <Check className="w-4 h-4 text-green-600 ml-1" />}
              </div>
              <h3 className="font-semibold text-sm">Phone Verification</h3>
              <p className="text-xs text-gray-600 mt-1">
                Secure account recovery & notifications
              </p>
            </CardContent>
          </Card>

          <Card className={`border-2 ${verificationStatus.photo_verified ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Camera className="w-6 h-6 text-blue-600" />
                {verificationStatus.photo_verified && <Check className="w-4 h-4 text-green-600 ml-1" />}
              </div>
              <h3 className="font-semibold text-sm">Photo Verification</h3>
              <p className="text-xs text-gray-600 mt-1">
                Authentic profile & increased trust
              </p>
            </CardContent>
          </Card>

          <Card className={`border-2 ${verificationStatus.identity_verified ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-purple-600" />
                {verificationStatus.identity_verified && <Check className="w-4 h-4 text-green-600 ml-1" />}
              </div>
              <h3 className="font-semibold text-sm">Identity Verification</h3>
              <p className="text-xs text-gray-600 mt-1">
                Maximum trust & premium features
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Verification Tabs */}
        <Card className="max-w-2xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="phone" 
                className={verificationStatus.phone_verified ? 'text-green-600' : ''}
              >
                <Phone className="w-4 h-4 mr-2" />
                Phone
                {verificationStatus.phone_verified && <Check className="w-4 h-4 ml-2" />}
              </TabsTrigger>
              <TabsTrigger 
                value="photo"
                className={verificationStatus.photo_verified ? 'text-green-600' : ''}
              >
                <Camera className="w-4 h-4 mr-2" />
                Photo
                {verificationStatus.photo_verified && <Check className="w-4 h-4 ml-2" />}
              </TabsTrigger>
              <TabsTrigger 
                value="identity"
                className={verificationStatus.identity_verified ? 'text-green-600' : ''}
              >
                <Shield className="w-4 h-4 mr-2" />
                Identity
                {verificationStatus.identity_verified && <Check className="w-4 h-4 ml-2" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="p-6">
              {verificationStatus.phone_verified ? (
                <div className="text-center py-8">
                  <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-600 mb-2">Phone Verified</h3>
                  <p className="text-gray-600">Your phone number is verified</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
                    {verificationStatus.phone_number}
                  </Badge>
                </div>
              ) : (
                <div className="flex justify-center">
                  <PhoneVerification 
                    onVerified={() => handleVerificationComplete('phone')}
                    required={false}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="photo" className="p-6">
              {verificationStatus.photo_verified ? (
                <div className="text-center py-8">
                  <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-600 mb-2">Photo Verified</h3>
                  <p className="text-gray-600">Your photo has been verified</p>
                  {verificationStatus.verification_photo_url && (
                    <img 
                      src={verificationStatus.verification_photo_url} 
                      alt="Verified photo"
                      className="w-24 h-24 rounded-full mx-auto mt-4 border-4 border-green-200"
                    />
                  )}
                </div>
              ) : (
                <div className="flex justify-center">
                  <PhotoVerification 
                    onVerified={() => handleVerificationComplete('photo')}
                    required={false}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="identity" className="p-6">
              {verificationStatus.identity_verified ? (
                <div className="text-center py-8">
                  <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-600 mb-2">Identity Verified</h3>
                  <p className="text-gray-600">Your identity has been verified with government ID</p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 mt-2">
                    Premium Member
                  </Badge>
                </div>
              ) : (
                <div className="flex justify-center">
                  <IdentityVerification 
                    onVerified={() => handleVerificationComplete('identity')}
                    required={false}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Benefits Info */}
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Verification Benefits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  Phone
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Secure Account Recovery</p>
                  <p className="text-xs text-gray-600">Two-factor authentication & SMS notifications</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  Photo
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Increased Profile Trust</p>
                  <p className="text-xs text-gray-600">Verified badge & higher match visibility</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                  Identity
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Premium Features</p>
                  <p className="text-xs text-gray-600">Advanced matching, priority support & exclusive events</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerificationCenter;