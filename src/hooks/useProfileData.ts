
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { profileSchema, ProfileData } from '@/schemas/profileValidation';
import { sanitizeInput, logSecurityEvent } from '@/utils/security';

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
        logSecurityEvent('profile_load_error', `User ${user.id}: ${error.message}`, 'medium');
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
      logSecurityEvent('profile_load_exception', `User ${user.id}: ${error}`, 'high');
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
      logSecurityEvent('profile_validation_failed', `User ${user?.id}: ${errors.join(', ')}`, 'low');
      return { isValid: false, errors };
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    // Sanitize all inputs
    const sanitizedData = {
      bio: sanitizeInput(profileData.bio),
      values: sanitizeInput(profileData.values),
      lifeGoals: sanitizeInput(profileData.lifeGoals),
      greenFlags: sanitizeInput(profileData.greenFlags)
    };

    const validation = validateProfile(sanitizedData);
    if (!validation.isValid) {
      toast({
        title: 'Validation Error',
        description: validation.errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
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
        console.error('Error saving profile:', result.error);
        logSecurityEvent('profile_save_error', `User ${user.id}: ${result.error.message}`, 'medium');
        toast({
          title: 'Error Saving Profile',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        setProfileExists(true);
        setProfileData(sanitizedData);
        logSecurityEvent('profile_saved', `User ${user.id} updated profile`, 'low');
        toast({
          title: 'Profile Saved Successfully',
          description: 'Your secure profile has been updated.',
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      logSecurityEvent('profile_save_exception', `User ${user.id}: ${error}`, 'high');
      toast({
        title: 'Error Saving Profile',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return {
    profileData,
    profileExists,
    isLoading,
    isSaving,
    loadProfile,
    saveProfile,
    updateProfileField
  };
};
