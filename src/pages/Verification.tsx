import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Phone, Camera, CreditCard, Users, CheckCircle, XCircle, Clock, Upload, ArrowLeft, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVerification } from '@/hooks/useVerification';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/logo';

const Verification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    loading,
    verificationStatus,
    phoneVerification,
    documents,
    verificationCodeSent,
    sendVerificationSMS,
    verifyPhoneCode,
    uploadDocument,
    addSocialMediaVerification,
  } = useVerification();

  // Local state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialProfileUrl, setSocialProfileUrl] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // File upload refs
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    await sendVerificationSMS(phoneNumber);
  };

  const handleCodeVerification = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Error", 
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    const success = await verifyPhoneCode(phoneNumber, verificationCode);
    if (success) {
      setVerificationCode('');
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    await uploadDocument(file, documentType);
  };

  const handleSocialMediaSubmit = async () => {
    if (!socialPlatform || !socialProfileUrl.trim()) {
      toast({
        title: "Error",
        description: "Please select a platform and enter your profile URL",
        variant: "destructive"
      });
      return;
    }

    const success = await addSocialMediaVerification(socialPlatform, socialProfileUrl);
    if (success) {
      setSocialPlatform('');
      setSocialProfileUrl('');
    }
  };

  const getStatusBadge = (verified: boolean) => {
    if (verified) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const isPhoneVerified = verificationStatus?.phone_verified || false;
  const isPhotoVerified = verificationStatus?.photo_verified || false;
  const hasDocuments = documents.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-800">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <Logo size="sm" showText={true} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Account Verification</h1>
          <p className="text-lg text-white/80">Verify your account to build trust and unlock premium features</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/60 border-purple-500/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="phone" className="data-[state=active]:bg-purple-600">Phone</TabsTrigger>
            <TabsTrigger value="photo" className="data-[state=active]:bg-purple-600">Photo</TabsTrigger>
            <TabsTrigger value="identity" className="data-[state=active]:bg-purple-600">Identity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone Verification Card */}
              <Card className="border-green-200/30 bg-green-500/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-300">
                    <Phone className="h-5 w-5" />
                    Phone Verification
                    {getStatusBadge(isPhoneVerified)}
                  </CardTitle>
                  <CardDescription className="text-white/70">Verify your phone number for account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60 mb-4">
                    Adding your phone number helps secure your account and enables SMS notifications.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('phone')}
                    className="border-green-400/50 text-green-300 hover:bg-green-500/20"
                  >
                    {isPhoneVerified ? 'View Details' : 'Start Verification'}
                  </Button>
                </CardContent>
              </Card>

              {/* Photo Verification Card */}
              <Card className="border-blue-200/30 bg-blue-500/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-300">
                    <Camera className="h-5 w-5" />
                    Photo Verification
                    {getStatusBadge(isPhotoVerified)}
                  </CardTitle>
                  <CardDescription className="text-white/70">Verify you're a real person with a selfie</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60 mb-4">
                    Take a quick selfie to prove you're the person in your profile photos.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('photo')}
                    className="border-blue-400/50 text-blue-300 hover:bg-blue-500/20"
                  >
                    {isPhotoVerified ? 'View Details' : 'Take Selfie'}
                  </Button>
                </CardContent>
              </Card>

              {/* Identity Verification Card */}
              <Card className="border-purple-200/30 bg-purple-500/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-300">
                    <CreditCard className="h-5 w-5" />
                    Identity Verification
                    {getStatusBadge(hasDocuments)}
                  </CardTitle>
                  <CardDescription className="text-white/70">Verify with government ID for maximum trust</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60 mb-4">
                    Upload a government-issued ID to get the highest level of verification.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('identity')}
                    className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                  >
                    {hasDocuments ? 'View Documents' : 'Upload ID'}
                  </Button>
                </CardContent>
              </Card>

              {/* Social Media Card */}
              <Card className="border-orange-200/30 bg-orange-500/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-300">
                    <Users className="h-5 w-5" />
                    Social Media
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      <Eye className="h-3 w-3 mr-1" />
                      Optional
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-white/70">Link your social media accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/60 mb-4">
                    Connect your social accounts to show authenticity.
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={socialPlatform}
                        onChange={(e) => setSocialPlatform(e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      >
                        <option value="">Select Platform</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">Twitter</option>
                        <option value="facebook">Facebook</option>
                      </select>
                      <Input
                        placeholder="Profile URL"
                        value={socialProfileUrl}
                        onChange={(e) => setSocialProfileUrl(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSocialMediaSubmit}
                      disabled={loading || !socialPlatform || !socialProfileUrl}
                      className="border-orange-400/50 text-orange-300 hover:bg-orange-500/20 w-full"
                    >
                      {loading ? 'Adding...' : 'Connect Account'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Phone Verification Tab */}
          <TabsContent value="phone" className="space-y-6">
            <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Phone className="h-5 w-5" />
                  Phone Verification
                  {getStatusBadge(isPhoneVerified)}
                </CardTitle>
                <CardDescription className="text-white/70">
                  Enter your phone number to receive a verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isPhoneVerified && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        disabled={verificationCodeSent}
                      />
                    </div>
                    
                    {!verificationCodeSent ? (
                      <Button 
                        onClick={handlePhoneSubmit} 
                        disabled={loading || !phoneNumber}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {loading ? 'Sending...' : 'Send Verification Code'}
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="code" className="text-white">Verification Code</Label>
                          <Input
                            id="code"
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white"
                            maxLength={6}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleCodeVerification} 
                            disabled={loading || !verificationCode}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {loading ? 'Verifying...' : 'Verify Code'}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={handlePhoneSubmit}
                            disabled={loading}
                            className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                          >
                            Resend Code
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {isPhoneVerified && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Phone Verified!</h3>
                    <p className="text-white/70">Your phone number has been successfully verified.</p>
                    {phoneVerification?.phone_number && (
                      <p className="text-purple-300 mt-2">Verified: {phoneVerification.phone_number}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photo Verification Tab */}
          <TabsContent value="photo" className="space-y-6">
            <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Camera className="h-5 w-5" />
                  Photo Verification
                  {getStatusBadge(isPhotoVerified)}
                </CardTitle>
                <CardDescription className="text-white/70">
                  Upload a selfie to verify your identity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isPhotoVerified ? (
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 bg-slate-700 rounded-full mx-auto flex items-center justify-center">
                      <Camera className="h-12 w-12 text-slate-400" />
                    </div>
                    <p className="text-sm text-white/60">
                      We'll compare this selfie with your profile photos to verify it's really you
                    </p>
                    <input
                      ref={selfieInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'selfie');
                      }}
                    />
                    <Button
                      onClick={() => selfieInputRef.current?.click()}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {loading ? 'Uploading...' : 'Upload Selfie'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Photo Verified!</h3>
                    <p className="text-white/70">Your selfie has been successfully verified.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Identity Verification Tab */}
          <TabsContent value="identity" className="space-y-6">
            <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CreditCard className="h-5 w-5" />
                  Identity Verification
                </CardTitle>
                <CardDescription className="text-white/70">
                  Upload a government-issued ID for the highest level of verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                    <CreditCard className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-sm text-white/60 mb-4">
                      Upload your government-issued ID (driver's license, passport, etc.)
                    </p>
                    <input
                      ref={idInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'government_id');
                      }}
                    />
                    <Button 
                      variant="outline" 
                      className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                      onClick={() => idInputRef.current?.click()}
                      disabled={loading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {loading ? 'Uploading...' : 'Choose File'}
                    </Button>
                  </div>
                  
                  {/* Show uploaded documents */}
                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Uploaded Documents</h4>
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                          <span className="text-white text-sm">{doc.document_type.replace('_', ' ').toUpperCase()}</span>
                          <Badge 
                            variant={doc.verification_status === 'approved' ? 'default' : 'secondary'}
                            className={doc.verification_status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'}
                          >
                            {doc.verification_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-white/50">
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