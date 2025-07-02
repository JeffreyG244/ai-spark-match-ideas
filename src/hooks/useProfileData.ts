
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { profileSchema, ProfileData } from '@/schemas/profileValidation';

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
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

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
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save your profile.',
        variant: 'destructive'
      });
      return { success: false };
    }

    setIsSaving(true);
    try {
      // Simple validation
      const validation = validateProfile(profileData);
      if (!validation.isValid) {
        toast({
          title: 'Validation Error',
          description: validation.errors.join(', '),
          variant: 'destructive'
        });
        return { success: false };
      }

      const profilePayload = {
        user_id: user.id,
        email: user.email || '',
        bio: profileData.bio,
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
        console.error('Database error:', result.error);
        toast({
          title: 'Save Failed',
          description: 'Failed to save profile. Please try again.',
          variant: 'destructive'
        });
        return { success: false };
      }

      setProfileExists(true);
      toast({
        title: 'Profile Saved',
        description: 'Your profile has been saved successfully!',
      });
      
      return { success: true };
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors for this field
    setValidationErrors(prev => ({ ...prev, [field]: [] }));
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
