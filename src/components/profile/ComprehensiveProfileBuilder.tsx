
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileData } from '@/hooks/useProfileData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import ProfileCompletionHeader from './ProfileCompletionHeader';
import ProfileSectionNavigation from './ProfileSectionNavigation';
import ProfileSectionContent from './ProfileSectionContent';
import ProfileSaveButton from './ProfileSaveButton';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

const ComprehensiveProfileBuilder = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'personality' | 'interests' | 'photos'>('profile');
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<string, string>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const {
    profileData,
    profileExists,
    isLoading,
    loadProfile,
    updateProfileField
  } = useProfileData();

  const { completionPercentage } = useProfileCompletion(profileData, personalityAnswers, interests, photos);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadAdditionalData();
    }
  }, [user]);

  const loadAdditionalData = async () => {
    if (!user) return;

    try {
      // Load existing profile data including new fields
      const { data, error } = await supabase
        .from('user_profiles')
        .select('personality_answers, interests, photos')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading additional data:', error);
        return;
      }

      if (data) {
        // Fix: Properly handle the jsonb type for personality_answers
        setPersonalityAnswers((data.personality_answers as Record<string, string>) || {});
        setInterests(data.interests || []);
        
        // Convert photo URLs to Photo objects
        const photoUrls = data.photos || [];
        const photoObjects = photoUrls.map((url: string, index: number) => ({
          id: `existing-${index}`,
          url,
          isPrimary: index === 0
        }));
        setPhotos(photoObjects);
      }
    } catch (error) {
      console.error('Error loading additional data:', error);
    }
  };

  const handlePersonalityAnswer = (questionId: string, answer: string) => {
    setPersonalityAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handlePhotosChange = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
  };

  const saveCompleteProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const photoUrls = photos.map(photo => photo.url);
      
      const profilePayload = {
        user_id: user.id,
        email: user.email || '',
        bio: profileData.bio,
        values: profileData.values,
        life_goals: profileData.lifeGoals,
        green_flags: profileData.greenFlags,
        personality_answers: personalityAnswers,
        interests: interests,
        photos: photoUrls,
        verified: false,
        updated_at: new Date().toISOString()
      };

      let result;
      if (profileExists) {
        result = await supabase
          .from('user_profiles')
          .update(profilePayload)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('user_profiles')
          .insert([{
            ...profilePayload,
            created_at: new Date().toISOString()
          }]);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Profile Saved Successfully',
        description: 'Your comprehensive profile has been updated.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error Saving Profile',
        description: 'Failed to save your profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ProfileCompletionHeader completionPercentage={completionPercentage} />

      <ProfileSectionNavigation
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        personalityAnswerCount={Object.keys(personalityAnswers).length}
        interestCount={interests.length}
        photoCount={photos.length}
      />

      <ProfileSectionContent
        activeSection={activeSection}
        profileData={profileData}
        updateProfileField={updateProfileField}
        profileExists={profileExists}
        personalityAnswers={personalityAnswers}
        onPersonalityAnswerChange={handlePersonalityAnswer}
        interests={interests}
        onInterestsChange={setInterests}
        photos={photos}
        onPhotosChange={handlePhotosChange}
      />

      <ProfileSaveButton onSave={saveCompleteProfile} isSaving={isSaving} />
    </div>
  );
};

export default ComprehensiveProfileBuilder;
