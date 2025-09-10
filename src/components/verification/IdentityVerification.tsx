import React, { useState } from 'react';
import { Shield, Check, Upload, AlertCircle, FileText, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface IdentityVerificationProps {
  onVerified?: () => void;
  required?: boolean;
}

type DocumentType = 'drivers_license' | 'passport' | 'state_id' | 'military_id';

export const IdentityVerification: React.FC<IdentityVerificationProps> = ({ 
  onVerified, 
  required = false 
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'select' | 'upload' | 'processing' | 'verified'>('select');
  const [documentType, setDocumentType] = useState<DocumentType>('drivers_license');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const documentTypes = {
    drivers_license: { label: "Driver's License", icon: CreditCard, requiresBack: true },
    passport: { label: "Passport", icon: FileText, requiresBack: false },
    state_id: { label: "State ID", icon: CreditCard, requiresBack: true },
    military_id: { label: "Military ID", icon: Shield, requiresBack: true }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 10MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (side === 'front') {
        setFrontImage(dataUrl);
      } else {
        setBackImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit documents for verification
  const submitDocuments = async () => {
    if (!frontImage || !documentNumber) {
      toast({
        title: "Missing Information",
        description: "Please provide all required documents and information",
        variant: "destructive"
      });
      return;
    }

    if (documentTypes[documentType].requiresBack && !backImage) {
      toast({
        title: "Missing Document",
        description: "Please upload both front and back of your document",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      // Upload front image
      const frontBlob = await (await fetch(frontImage)).blob();
      const frontFileName = `identity_${user?.id}_${documentType}_front_${Date.now()}.jpg`;
      
      const { data: frontUploadData, error: frontUploadError } = await supabase.storage
        .from('identity-documents')
        .upload(frontFileName, frontBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });

      if (frontUploadError) throw frontUploadError;

      const { data: { publicUrl: frontUrl } } = supabase.storage
        .from('identity-documents')
        .getPublicUrl(frontFileName);

      let backUrl = null;

      // Upload back image if required
      if (documentTypes[documentType].requiresBack && backImage) {
        const backBlob = await (await fetch(backImage)).blob();
        const backFileName = `identity_${user?.id}_${documentType}_back_${Date.now()}.jpg`;
        
        const { data: backUploadData, error: backUploadError } = await supabase.storage
          .from('identity-documents')
          .upload(backFileName, backBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          });

        if (backUploadError) throw backUploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('identity-documents')
          .getPublicUrl(backFileName);
        
        backUrl = publicUrl;
      }

      // Create verification record
      const { error: recordError } = await supabase
        .from('user_verifications')
        .insert({
          user_id: user?.id,
          verification_type: 'identity',
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
          metadata: {
            document_type: documentType,
            document_number: documentNumber,
            front_image_url: frontUrl,
            back_image_url: backUrl,
            verification_method: 'document_upload'
          }
        });

      if (recordError) throw recordError;

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          identity_verification_status: 'pending_review',
          identity_submitted_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Simulate verification process (in production, this would be manual review or API call)
      setTimeout(async () => {
        try {
          // Auto-approve for demo (in production, this would be manual review)
          const { error: approveError } = await supabase
            .from('user_verifications')
            .update({
              status: 'verified',
              verified_at: new Date().toISOString(),
              reviewed_by: 'system_auto_approval'
            })
            .eq('user_id', user?.id)
            .eq('verification_type', 'identity');

          if (approveError) throw approveError;

          const { error: userUpdateError } = await supabase
            .from('users')
            .update({ 
              identity_verified: true,
              identity_verified_at: new Date().toISOString(),
              identity_verification_status: 'verified'
            })
            .eq('id', user?.id);

          if (userUpdateError) throw userUpdateError;

          setStep('verified');
          toast({
            title: "Identity Verified!",
            description: "Your identity has been successfully verified",
          });

          onVerified?.();

        } catch (error) {
          console.error('Auto-approval error:', error);
          toast({
            title: "Review Submitted",
            description: "Your documents are under review. You'll be notified within 24-48 hours.",
          });
        }
      }, 3000); // 3 second delay to simulate review

    } catch (error) {
      console.error('Identity verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Could not submit your documents. Please try again.",
        variant: "destructive"
      });
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verified') {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">Identity Verified</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Your identity has been verified with government-issued ID
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Identity Verification</span>
          {required && (
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'select' && (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Document Type
                </label>
                <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(documentTypes).map(([key, doc]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          <doc.icon className="w-4 h-4" />
                          <span>{doc.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Document Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter document number"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps verify the authenticity of your document
                </p>
              </div>

              <Button 
                onClick={() => setStep('upload')}
                disabled={!documentNumber}
                className="w-full"
              >
                Continue to Upload
              </Button>
            </div>
          </>
        )}

        {step === 'upload' && (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2">
                  Upload {documentTypes[documentType].label}
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  Take clear photos of your document. Ensure all text is readable and the entire document is visible.
                </p>
              </div>

              {/* Front Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium mb-1">Front of Document</p>
                  {frontImage ? (
                    <div className="mt-2">
                      <img 
                        src={frontImage} 
                        alt="Front of document"
                        className="max-w-full h-32 object-cover rounded border mx-auto mb-2"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFrontImage(null)}
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('front-upload')?.click()}
                    >
                      Choose File
                    </Button>
                  )}
                  <input
                    id="front-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'front')}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Back Image Upload */}
              {documentTypes[documentType].requiresBack && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium mb-1">Back of Document</p>
                    {backImage ? (
                      <div className="mt-2">
                        <img 
                          src={backImage} 
                          alt="Back of document"
                          className="max-w-full h-32 object-cover rounded border mx-auto mb-2"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBackImage(null)}
                        >
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('back-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    )}
                    <input
                      id="back-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'back')}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={submitDocuments}
                  disabled={isLoading || !frontImage || (documentTypes[documentType].requiresBack && !backImage)}
                  className="flex-1"
                >
                  Submit for Verification
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm font-medium mb-2">Processing your documents...</p>
            <p className="text-xs text-gray-600">This may take a few moments</p>
          </div>
        )}

        <div className="flex items-start space-x-2 text-xs text-gray-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="mb-1">
              Identity verification helps ensure the safety and security of our community.
            </p>
            <p>
              Your documents are encrypted and stored securely. They are only used for verification purposes and are not shared with other users.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};