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
      console.log('Profile load skipped: No authenticated user');
      return;
    }
    
    console.log('Loading profile for user:', user.id);
    setIsLoading(true);
    
    try {
      // Load from users table (primary table)
      const { data: userProfile, error: userProfileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (userProfileError && userProfileError.code !== 'PGRST116') {
        console.error('Error loading user profile:', userProfileError);
        toast({
          title: 'Load Error',
          description: 'Failed to load your profile data.',
          variant: 'destructive'
        });
        return;
      }

      console.log('Loaded user profile:', userProfile);

      // Combine the data from users table
      const combinedData: EnhancedProfileData = {
        first_name: userProfile?.first_name || '',
        last_name: userProfile?.last_name || '',
        age: userProfile?.age?.toString() || '',
        gender: userProfile?.gender || '',
        bio: userProfile?.bio || '',
        city: userProfile?.city || '',
        state: userProfile?.state || '',
        zipcode: userProfile?.country || '', // Map country field to zipcode for UI
        interests: userProfile?.interests?.join(', ') || '',
        photo_urls: userProfile?.photos || [],
      };

      console.log('Combined profile data:', combinedData);
      setProfileData(combinedData);
      setProfileExists(!!userProfile);
    } catch (error) {
      console.error('Unexpected error loading profile:', error);
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
      console.error('Profile save failed: No authenticated user');
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save your profile.',
        variant: 'destructive'
      });
      return { success: false };
    }

    if (isSaving) {
      console.log('Profile save skipped: Already saving');
      return { success: false };
    }

    // Validate bio minimum length
    if (profileData.bio && profileData.bio.length < 150) {
      console.warn('Profile save failed: Bio too short', profileData.bio?.length);
      toast({
        title: 'Bio Too Short',
        description: 'Please write at least 150 characters about yourself.',
        variant: 'destructive'
      });
      return { success: false };
    }

    console.log('Starting profile save for user:', user.id);
    setIsSaving(true);
    
    try {
      // Calculate age from date of birth if age is provided
      let dateOfBirth = '1990-01-01'; // default fallback
      if (profileData.age) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - parseInt(profileData.age);
        dateOfBirth = `${birthYear}-01-01`;
      }

      // Save to users table (the main profile table used for matching)
      const userProfilePayload = {
        id: user.id,
        email: user.email || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        age: profileData.age ? parseInt(profileData.age) : null,
        gender: profileData.gender || null,
        bio: profileData.bio || '',
        city: profileData.city || '',
        state: profileData.state || null,
        country: profileData.zipcode || null, // Map zipcode UI field to country DB field
        interests: profileData.interests ? profileData.interests.split(',').map(i => i.trim()) : null,
        photos: profileData.photo_urls || [],
        date_of_birth: dateOfBirth,
        updated_at: new Date().toISOString()
      };

      console.log('Saving user profile payload:', userProfilePayload);

      const { data: upsertData, error: userProfileError } = await supabase
        .from('users')
        .upsert(userProfilePayload, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (userProfileError) {
        console.error('User profile save error:', userProfileError);
        toast({
          title: 'Save Failed',
          description: `Failed to save profile: ${userProfileError.message}`,
          variant: 'destructive'
        });
        return { success: false };
      }

      console.log('Profile save successful:', upsertData);
      setProfileExists(true);
      
      if (showSuccessToast) {
        toast({
          title: 'Profile Saved',
          description: 'Your profile has been saved successfully!',
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Unexpected save error:', error);
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