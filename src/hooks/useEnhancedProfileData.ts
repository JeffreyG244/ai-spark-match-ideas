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
  
  // Name fields
  first_name?: string;
  last_name?: string;
  
  // Location fields (separate for better handling)
  city?: string;
  state?: string;
  zipcode?: string;
}

export const useEnhancedProfileData = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<EnhancedProfileData>({});
  const [profileExists, setProfileExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfile = async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    
    try {
      // Load from user_profiles table 
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (userProfileError && userProfileError.code !== 'PGRST116') {
        console.error('Profile load error:', userProfileError);
      }

      // Extract data from the user_profiles structure
      const publicData = (userProfile?.public_data as any) || {};
      const privateData = (userProfile?.private_data as any) || {};
      
      // Combine the data from user_profiles table
      const combinedData: EnhancedProfileData = {
        first_name: publicData.first_name || '',
        last_name: publicData.last_name || '',
        age: publicData.age?.toString() || '',
        gender: publicData.gender || '',
        bio: publicData.bio || '',
        city: publicData.city || '',
        state: publicData.state || '',
        zipcode: publicData.zipcode || '',
        interests: Array.isArray(publicData.interests) ? publicData.interests.join(', ') : (publicData.interests || ''),
        photo_urls: userProfile?.photo_urls || [],
      };

      setProfileData(combinedData);
      setProfileExists(!!userProfile);
    } catch (error) {
      console.error('Profile load error:', error);
      toast({
        title: 'Load Error',
        description: 'An unexpected error occurred while loading your profile.',
        variant: 'destructive'
      });
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

    setIsSaving(true);
    
    try {
      // Prepare data for user_profiles table
      const publicData = {
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        age: profileData.age ? parseInt(profileData.age) : null,
        gender: profileData.gender || '',
        bio: profileData.bio || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zipcode: profileData.zipcode || '',
        interests: profileData.interests ? profileData.interests.split(',').map(i => i.trim()) : [],
      };

      // Save to user_profiles table
      const userProfilePayload = {
        id: user.id,
        public_data: publicData,
        private_data: {},
        photo_urls: profileData.photo_urls || [],
        updated_at: new Date().toISOString()
      };

      const { error: userProfileError } = await supabase
        .from('user_profiles')
        .upsert(userProfilePayload, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (userProfileError) {
        console.error('Profile save error:', userProfileError);
        toast({
          title: 'Save Failed',
          description: `Failed to save profile: ${userProfileError.message}`,
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
      console.error('Unexpected profile save error:', error);
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
              profileData.city &&
              profileData.state);
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