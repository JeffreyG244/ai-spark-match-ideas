import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface EnhancedProfileData {
  // Basic info
  age?: string;
  gender?: string;
  location?: string;
  height?: string;
  bio?: string;
  interests?: string;
  profession?: string;
  education?: string;
  
  // Sexual orientation & preferences
  sexual_orientation?: string;
  interested_in?: string;
  age_preference_min?: string;
  age_preference_max?: string;
  
  // Relationship goals
  relationship_goals?: string;
  
  // Lifestyle & habits
  smoking?: string;
  vaping?: string;
  cannabis?: string;
  drinking?: string;
  exercise?: string;
  diet?: string;
  
  // Personality traits
  extroversion?: string;
  communication_style?: string;
  
  // Photos
  photo_urls?: string[];
}

export const useEnhancedProfileData = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<EnhancedProfileData>({});
  const [profileExists, setProfileExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Load from compatibility_answers table
      const { data: compatibilityData, error: compatibilityError } = await supabase
        .from('compatibility_answers')
        .select('answers')
        .eq('user_id', user.id)
        .maybeSingle();

      if (compatibilityError && compatibilityError.code !== 'PGRST116') {
        console.error('Error loading compatibility answers:', compatibilityError);
      }

      // Combine the data
      const combinedData: EnhancedProfileData = {
        bio: profileData?.bio || '',
        photo_urls: profileData?.photo_urls || [],
        ...((compatibilityData?.answers as any) || {})
      };

      setProfileData(combinedData);
      setProfileExists(!!profileData || !!compatibilityData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (showSuccessToast = true) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save your profile.',
        variant: 'destructive'
      });
      return { success: false };
    }

    if (isSaving) {
      return { success: false };
    }

    // Validate bio minimum length
    if (profileData.bio && profileData.bio.length < 150) {
      toast({
        title: 'Bio Too Short',
        description: 'Please write at least 150 characters about yourself.',
        variant: 'destructive'
      });
      return { success: false };
    }

    setIsSaving(true);
    try {
      // Save to profiles table
      const profilePayload = {
        user_id: user.id,
        email: user.email || '',
        bio: profileData.bio || '',
        photo_urls: profileData.photo_urls || [],
        updated_at: new Date().toISOString()
      };

      let profileResult;
      if (profileExists) {
        profileResult = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('user_id', user.id);
      } else {
        profileResult = await supabase
          .from('profiles')
          .insert([{
            ...profilePayload,
            created_at: new Date().toISOString()
          }]);
      }

      if (profileResult.error) {
        console.error('Profile save error:', profileResult.error);
        toast({
          title: 'Save Failed',
          description: 'Failed to save profile. Please try again.',
          variant: 'destructive'
        });
        return { success: false };
      }

      // Save compatibility answers
      const compatibilityPayload = {
        user_id: user.id,
        answers: profileData as any, // Cast to any for Json compatibility
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };

      const { error: compatibilityError } = await supabase
        .from('compatibility_answers')
        .upsert(compatibilityPayload);

      if (compatibilityError) {
        console.error('Compatibility answers save error:', compatibilityError);
        toast({
          title: 'Save Failed',
          description: 'Failed to save compatibility answers. Please try again.',
          variant: 'destructive'
        });
        return { success: false };
      }

      setProfileExists(true);
      
      if (showSuccessToast) {
        toast({
          title: 'Profile Saved',
          description: 'Your profile has been saved successfully!',
        });
      }
      
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

  const updateProfileField = (field: keyof EnhancedProfileData, value: string | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const isBasicProfileComplete = () => {
    return !!(profileData.bio && profileData.bio.length >= 150 && 
              profileData.age && 
              profileData.gender && 
              profileData.sexual_orientation &&
              profileData.location);
  };

  return {
    profileData,
    profileExists,
    isLoading,
    isSaving,
    loadProfile,
    saveProfile,
    updateProfileField,
    isBasicProfileComplete
  };
};