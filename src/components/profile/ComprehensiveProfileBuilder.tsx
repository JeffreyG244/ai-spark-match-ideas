
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, Brain, Camera, Heart, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileData } from '@/hooks/useProfileData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfileForm from './ProfileForm';
import PersonalityQuestions from './PersonalityQuestions';
import InterestsSelector from './InterestsSelector';
import EnhancedPhotoUpload from './EnhancedPhotoUpload';

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
        setPersonalityAnswers(data.personality_answers || {});
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

  const calculateCompletionPercentage = () => {
    let completed = 0;
    let total = 4;

    // Basic profile (25%)
    if (profileData.bio && profileData.values && profileData.lifeGoals && profileData.greenFlags) {
      completed += 1;
    }

    // Personality questions (25%)
    if (Object.keys(personalityAnswers).length >= 6) {
      completed += 1;
    }

    // Interests (25%)
    if (interests.length >= 5) {
      completed += 1;
    }

    // Photos (25%)
    if (photos.length >= 3) {
      completed += 1;
    }

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-purple-800">Complete Your Profile</h2>
              <p className="text-gray-600">Create an authentic profile that attracts meaningful connections</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{completionPercentage}%</div>
              <p className="text-sm text-gray-500">Complete</p>
            </div>
          </div>
          
          <Progress value={completionPercentage} className="mb-4" />
          
          {completionPercentage === 100 && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Profile Complete! Ready to find matches.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant={activeSection === 'profile' ? 'default' : 'outline'}
          onClick={() => setActiveSection('profile')}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Basic Profile
        </Button>
        <Button
          variant={activeSection === 'personality' ? 'default' : 'outline'}
          onClick={() => setActiveSection('personality')}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          Personality ({Object.keys(personalityAnswers).length}/6)
        </Button>
        <Button
          variant={activeSection === 'interests' ? 'default' : 'outline'}
          onClick={() => setActiveSection('interests')}
          className="flex items-center gap-2"
        >
          <Heart className="h-4 w-4" />
          Interests ({interests.length})
        </Button>
        <Button
          variant={activeSection === 'photos' ? 'default' : 'outline'}
          onClick={() => setActiveSection('photos')}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Photos ({photos.length}/6)
        </Button>
      </div>

      {/* Section Content */}
      {activeSection === 'profile' && (
        <ProfileForm
          profileData={profileData}
          updateProfileField={updateProfileField}
          saveProfile={() => {}} // We'll use the comprehensive save function
          isSaving={false}
          profileExists={profileExists}
        />
      )}

      {activeSection === 'personality' && (
        <PersonalityQuestions
          answers={personalityAnswers}
          onAnswerChange={handlePersonalityAnswer}
        />
      )}

      {activeSection === 'interests' && (
        <InterestsSelector
          selectedInterests={interests}
          onInterestsChange={setInterests}
        />
      )}

      {activeSection === 'photos' && (
        <EnhancedPhotoUpload
          photos={photos}
          onPhotosChange={handlePhotosChange}
        />
      )}

      {/* Save Button */}
      <div className="sticky bottom-4">
        <Card className="border-purple-200 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <Button 
              onClick={saveCompleteProfile} 
              disabled={isSaving} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Complete Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveProfileBuilder;
