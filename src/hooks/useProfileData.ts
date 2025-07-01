
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSecureForm } from '@/hooks/useSecureForm';
import { toast } from '@/hooks/use-toast';
import { profileSchema, ProfileData } from '@/schemas/profileValidation';
import { EnhancedSecurityService } from '@/services/security/EnhancedSecurityService';

export const useProfileData = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: '',
    values: '',
    lifeGoals: '',
    greenFlags: ''
  });
  const [profileExists, setProfileExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { secureSubmit, validateField, isSubmitting: isSaving, validationErrors } = useSecureForm({
    rateLimitAction: 'profile_update',
    validateContent: true,
    maxRequests: 10,
    windowMinutes: 60
  });

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('bio, photo_urls')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error Loading Profile',
          description: 'Failed to load your profile data.',
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        setProfileExists(true);
        setProfileData({
          bio: data.bio || '',
          values: '', // Not available in profiles table
          lifeGoals: '', // Not available in profiles table  
          greenFlags: '' // Not available in profiles table
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateProfile = (data: ProfileData) => {
    try {
      profileSchema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error: any) {
      const errors = error.errors?.map((e: any) => e.message) || ['Validation failed'];
      return { isValid: false, errors };
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    const submitFn = async (sanitizedData: ProfileData) => {
      // Additional validation
      const validation = validateProfile(sanitizedData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const profilePayload = {
        user_id: user.id,
        email: user.email || '',
        bio: sanitizedData.bio,
        updated_at: new Date().toISOString()
      };

      let result;
      if (profileExists) {
        result = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('profiles')
          .insert([{
            ...profilePayload,
            created_at: new Date().toISOString()
          }]);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      setProfileExists(true);
      return result.data;
    };

    const result = await secureSubmit(profileData, submitFn);
    
    if (result.success) {
      setProfileData(profileData); // Keep the current data since it was successfully saved
    }

    return result;
  };

  const updateProfileField = async (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const contentType = field === 'bio' ? 'bio' : 
                       field === 'values' ? 'values' :
                       field === 'lifeGoals' ? 'goals' : 'greenFlags';
    
    await validateField(field, value, contentType);
  };

  return {
    profileData,
    profileExists,
    isLoading,
    isSaving,
    validationErrors,
    loadProfile,
    saveProfile,
    updateProfileField
  };
};
