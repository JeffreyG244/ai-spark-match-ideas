import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VerificationStatus {
  phone_verified: boolean;
  photo_verified: boolean;
  email_verified: boolean;
  phone_verified_at?: string;
  photo_verified_at?: string;
  email_verified_at?: string;
}

interface PhoneVerification {
  phone_number: string;
  verified_at?: string;
  code_expires_at?: string;
}

interface VerificationDocument {
  id: string;
  document_type: string;
  file_url: string;
  verification_status: string;
  created_at: string;
}

export const useVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [phoneVerification, setPhoneVerification] = useState<PhoneVerification | null>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
      fetchPhoneVerification();
      fetchDocuments();
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

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching verification status:', error);
        return;
      }

      setVerificationStatus(data ? {
        phone_verified: data.phone_verified || false,
        photo_verified: data.photo_verified || false,
        email_verified: data.identity_verified || false,
        phone_verified_at: data.phone_verified_at,
        photo_verified_at: data.photo_verified_at,
        email_verified_at: data.identity_verified_at
      } : {
        phone_verified: false,
        photo_verified: false,
        email_verified: false
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPhoneVerification = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('phone_verifications')
        .select('phone_number, created_at, expires_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching phone verification:', error);
        return;
      }

      if (data) {
        setPhoneVerification({
          phone_number: data.phone_number,
          verified_at: data.created_at,
          code_expires_at: data.expires_at
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select('id, document_type, file_url, verification_status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendVerificationSMS = async (phoneNumber: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-sms', {
        body: { phoneNumber },
      });

      if (error) throw error;

      setVerificationCodeSent(true);
      toast({
        title: "Verification code sent",
        description: `We've sent a verification code to ${phoneNumber}`,
      });

      // In development, show the code for easy testing
      if (data?.verificationCode) {
        toast({
          title: "Development Mode",
          description: `Verification code: ${data.verificationCode}`,
          duration: 10000,
        });
      }

      await fetchPhoneVerification();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneCode = async (phoneNumber: string, verificationCode: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-phone-code', {
        body: { phoneNumber, verificationCode },
      });

      if (error) throw error;

      toast({
        title: "Phone verified!",
        description: "Your phone number has been successfully verified.",
      });

      await fetchVerificationStatus();
      await fetchPhoneVerification();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, documentType: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const { data, error } = await supabase.functions.invoke('upload-verification-document', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded and is being reviewed.",
      });

      await fetchDocuments();
      await fetchVerificationStatus();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addSocialMediaVerification = async (platform: string, profileUrl: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('social_media_verifications')
        .upsert({
          user_id: user.id,
          platform,
          profile_url: profileUrl,
          verification_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Social media added",
        description: `Your ${platform} profile has been submitted for verification.`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add social media profile",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    verificationStatus,
    phoneVerification,
    documents,
    verificationCodeSent,
    sendVerificationSMS,
    verifyPhoneCode,
    uploadDocument,
    addSocialMediaVerification,
    fetchVerificationStatus,
    fetchPhoneVerification,
    fetchDocuments,
  };
};