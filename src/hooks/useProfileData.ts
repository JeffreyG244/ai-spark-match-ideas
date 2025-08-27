import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ProfileData {
  bio: string;
  values: string;
  lifeGoals: string;
  greenFlags: string;
}

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
    if (!user) {
      console.log('🔍 LoadProfile: No user found');
      return;
    }
    
    console.log('🔍 LoadProfile Debug:', {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date().toISOString()
    });
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('bio, family_goals, lifestyle_preference')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ LoadProfile Error:', error);
        console.error('💡 Load Error Details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return;
      }

      if (data) {
        console.log('✅ Profile loaded successfully:', {
          hasBio: !!data.bio,
          hasFamilyGoals: !!data.family_goals,
          hasLifestyle: !!data.lifestyle_preference
        });
        setProfileExists(true);
        setProfileData({
          bio: data.bio || '',
          values: '',
          lifeGoals: data.family_goals || '',
          greenFlags: data.lifestyle_preference || ''
        });
      } else {
        console.log('ℹ️ No existing profile found - user needs to create one');
        setProfileExists(false);
      }
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

    // DEBUG: Log authentication state before save
    console.log('🔍 Profile Save Debug:', {
      userId: user.id,
      userEmail: user.email,
      profileData: {
        bio: profileData.bio?.length,
        lifeGoals: profileData.lifeGoals?.length,
        greenFlags: profileData.greenFlags?.length
      },
      timestamp: new Date().toISOString()
    });

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          bio: profileData.bio,
          family_goals: profileData.lifeGoals,
          lifestyle_preference: profileData.greenFlags,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Profile Save Error:', error);
        console.error('💡 Error Details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // If update fails because record doesn't exist, try to create it
        if (error.message?.includes('no rows') || error.code === 'PGRST116' || !profileExists) {
          console.log('🔧 Attempting to create user profile record...');
          
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              bio: profileData.bio,
              family_goals: profileData.lifeGoals,
              lifestyle_preference: profileData.greenFlags,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              city: '',
              date_of_birth: new Date(Date.now() - (25 * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
              age: 25
            });

          if (createError) {
            console.error('❌ Failed to create user profile:', createError);
            toast({
              title: 'Profile Creation Failed',
              description: 'Could not create your profile. Please contact support.',
              variant: 'destructive'
            });
            return { success: false };
          } else {
            console.log('✅ User profile record created successfully');
            setProfileExists(true);
            if (showSuccessToast) {
              toast({
                title: 'Profile Saved',
                description: 'Your profile has been created and saved successfully!',
              });
            }
            return { success: true };
          }
        }
        
        // Show specific error message to user
        const errorMsg = error.message?.includes('permission denied') 
          ? 'Authentication issue. Please log out and log back in.'
          : error.message?.includes('duplicate key')
          ? 'Profile already exists. Try refreshing the page.'
          : 'Failed to save profile. Please try again.';
          
        toast({
          title: 'Save Failed',
          description: errorMsg,
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

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const isBasicProfileComplete = () => {
    return profileData.bio.length >= 50 && 
           profileData.values.length >= 50 && 
           profileData.lifeGoals.length >= 50 && 
           profileData.greenFlags.length >= 50;
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