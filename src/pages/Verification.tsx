import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Phone, Camera, CreditCard, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Verification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneVerification = async () => {
    if (!user || !phoneNumber) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_verifications')
        .upsert({
          user_id: user.id,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Phone number submitted",
        description: "We'll send you a verification code shortly."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit phone number",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Account Verification</h1>
          <p className="text-lg text-gray-600">Verify your account to build trust and unlock premium features</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="photo">Photo</TabsTrigger>
            <TabsTrigger value="identity">Identity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Phone className="h-5 w-5" />
                    Phone Verification
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </CardTitle>
                  <CardDescription>Verify your phone number for account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Adding your phone number helps secure your account and enables SMS notifications.
                  </p>
                  <Button variant="outline" size="sm">
                    Start Verification
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Camera className="h-5 w-5" />
                    Photo Verification
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </CardTitle>
                  <CardDescription>Verify you're a real person with a selfie</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Take a quick selfie to prove you're the person in your profile photos.
                  </p>
                  <Button variant="outline" size="sm">
                    Take Selfie
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <CreditCard className="h-5 w-5" />
                    Identity Verification
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </CardTitle>
                  <CardDescription>Verify with government ID for maximum trust</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a government-issued ID to get the highest level of verification.
                  </p>
                  <Button variant="outline" size="sm">
                    Upload ID
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Users className="h-5 w-5" />
                    Social Media
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Optional
                    </Badge>
                  </CardTitle>
                  <CardDescription>Link your social media accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your social accounts to show authenticity.
                  </p>
                  <Button variant="outline" size="sm">
                    Connect Accounts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="phone" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Verification
                </CardTitle>
                <CardDescription>
                  Enter your phone number to receive a verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <Button onClick={handlePhoneVerification} disabled={loading || !phoneNumber}>
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photo Verification
                </CardTitle>
                <CardDescription>
                  Take a selfie to verify your identity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    We'll compare this selfie with your profile photos to verify it's really you
                  </p>
                  <Button>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Selfie
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Identity Verification
                </CardTitle>
                <CardDescription>
                  Upload a government-issued ID for the highest level of verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">
                      Drag and drop your ID or click to upload
                    </p>
                    <Button variant="outline" className="mt-4">
                      Choose File
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>• Accepted formats: JPG, PNG, PDF</p>
                    <p>• Maximum file size: 10MB</p>
                    <p>• Your information is encrypted and secure</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Verification;