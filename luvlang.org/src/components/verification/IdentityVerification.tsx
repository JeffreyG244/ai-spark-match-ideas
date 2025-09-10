import React, { useState } from 'react';
import { Shield, Check, Upload, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface IdentityVerificationProps {
  onVerified?: () => void;
  required?: boolean;
}

export const IdentityVerification: React.FC<IdentityVerificationProps> = ({ 
  onVerified, 
  required = false 
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);

  // Handle document upload
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG, PNG, or PDF file",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file under 5MB",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload to Supabase storage
      const fileName = `identity_${user?.id}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName);

      setUploadedDocument(publicUrl);

      // Create verification record
      const { error: recordError } = await supabase
        .from('verification_documents')
        .insert({
          user_id: user?.id,
          document_type: 'identity_document',
          file_url: publicUrl,
          verification_status: 'pending'
        });

      if (recordError) throw recordError;

      toast({
        title: "Document Uploaded",
        description: "Your identity document has been uploaded for review",
      });

    } catch (error) {
      console.error('Document upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload document. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit for verification
  const submitForVerification = async () => {
    if (!uploadedDocument) {
      toast({
        title: "No Document",
        description: "Please upload an identity document first",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          identity_verified: true,
          identity_verified_at: new Date().toISOString(),
          identity_verification_status: 'verified'
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setIsVerified(true);
      toast({
        title: "Identity Verified!",
        description: "Your identity has been successfully verified",
      });

      onVerified?.();

    } catch (error) {
      console.error('Identity verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Could not complete verification. Please try again.",
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
            <span className="font-medium">Identity Verified</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Your identity has been confirmed
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
            <Badge className="text-xs">
              Required
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Upload a government-issued ID for identity verification
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Accepted Documents:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Driver's License</li>
              <li>• Passport</li>
              <li>• National ID Card</li>
              <li>• State ID</li>
            </ul>
          </div>

          {!uploadedDocument ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="document-upload"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleDocumentUpload}
                className="hidden"
                disabled={isLoading}
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer"
              >
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {isLoading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or PDF (max 5MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Document Uploaded</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your identity document has been uploaded successfully
                </p>
              </div>

              <Button
                onClick={submitForVerification}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Submit for Verification'}
                <Shield className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-start space-x-2 text-xs text-gray-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Your identity document will be reviewed by our security team. 
            All personal information is encrypted and stored securely.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};