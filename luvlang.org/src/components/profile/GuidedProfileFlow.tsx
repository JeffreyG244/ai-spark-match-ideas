
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, User, Brain, Heart, Camera, ArrowRight } from 'lucide-react';
import { useEnhancedProfileData } from '@/hooks/useEnhancedProfileData';
import { useCompatibilityAnswers } from '@/hooks/useCompatibilityAnswers';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BasicProfileQuestions from './BasicProfileQuestions';
import PersonalityQuestions from './PersonalityQuestions';
import InterestsSelector from './InterestsSelector';
import EnhancedPhotoUpload from './EnhancedPhotoUpload';
import { toast } from '@/hooks/use-toast';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

const GuidedProfileFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<string, string>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);

  const {
    profileData,
    profileExists,
    isLoading,
    isSaving,
    loadProfile,
    saveProfile,
    updateProfileField,
    isBasicProfileComplete
  } = useEnhancedProfileData();

  const {
    questionAnswers,
    loadCompatibilityAnswers,
    saveCompatibilityAnswers
  } = useCompatibilityAnswers();

  const { completionPercentage, isProfileComplete } = useProfileCompletion(
    profileData || { bio: '' },
    personalityAnswers || {},
    interests || [],
    photos || []
  );

  useEffect(() => {
    loadProfile();
    loadCompatibilityAnswers();
  }, []);

  // Load saved data into local state when data is loaded
  useEffect(() => {
    if (questionAnswers && Object.keys(questionAnswers).length > 0) {
      setPersonalityAnswers(questionAnswers);
    }
    if (profileData?.interests) {
      if (typeof profileData.interests === 'string') {
        setInterests(profileData.interests.split(',').map(i => i.trim()).filter(Boolean));
      }
    }
    if (profileData?.photo_urls && Array.isArray(profileData.photo_urls)) {
      const formattedPhotos = profileData.photo_urls.map((url, index) => ({
        id: `photo-${index}`,
        url,
        isPrimary: index === 0
      }));
      setPhotos(formattedPhotos);
    }
  }, [questionAnswers, profileData]);

  const steps = [
    {
      id: 1,
      title: 'Basic Profile',
      description: 'Personal info & preferences',
      icon: User,
      isComplete: isBasicProfileComplete()
    },
    {
      id: 2,
      title: 'Personality',
      description: 'Answer compatibility questions',
      icon: Brain,
      isComplete: Object.keys(personalityAnswers || {}).length >= 6
    },
    {
      id: 3,
      title: 'Interests',
      description: 'Select your interests',
      icon: Heart,
      isComplete: (interests || []).length >= 5
    },
    {
      id: 4,
      title: 'Photos',
      description: 'Add your best photos',
      icon: Camera,
      isComplete: (photos || []).length >= 3
    }
  ];

  const completedSteps = steps.filter(step => step.isComplete).length;

  const handleStepComplete = async (stepId: number) => {
    if (stepId === 1 && isBasicProfileComplete()) {
      // Save the profile data
      await saveProfile(false);
      toast({
        title: 'Basic Profile Completed!',
        description: 'Moving to personality questions...',
      });
      setCurrentStep(2);
    } else if (stepId === 2 && Object.keys(personalityAnswers || {}).length >= 6) {
      // Save personality answers through compatibility answers hook
      await saveCompatibilityAnswers();
      
      // Also update enhanced profile data with personality answers
      Object.entries(personalityAnswers).forEach(([key, value]) => {
        updateProfileField(key as any, value);
      });
      await saveProfile(false);
      
      toast({
        title: 'Personality Questions Completed!',
        description: 'Now let\'s add your interests...',
      });
      setCurrentStep(3);
    } else if (stepId === 3 && (interests || []).length >= 5) {
      // Save interests to profile
      updateProfileField('interests', interests.join(', '));
      await saveProfile(false);
      
      toast({
        title: 'Interests Added!',
        description: 'Finally, let\'s add some photos...',
      });
      setCurrentStep(4);
    }
  };

  const handleBasicProfileAnswer = (questionId: string, answer: string) => {
    updateProfileField(questionId as any, answer);
  };

  const handlePersonalityAnswer = (questionId: string, answer: string) => {
    setPersonalityAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleCompleteProfile = async () => {
    if (!user || isCompletingProfile) return;
    
    setIsCompletingProfile(true);
    try {
      // Save all profile data first
      await saveProfile(false);
      await saveCompatibilityAnswers();
      
      // Trigger the profile webhook for matchmaking
      const { data, error } = await supabase.functions.invoke('profile-webhook', {
        body: { 
          user_id: user.id, 
          event_type: 'profile_completed' 
        }
      });

      if (error) {
        console.error('Webhook error:', error);
        toast({
          title: 'Profile Saved',
          description: 'Profile saved but matchmaking may be delayed. You can still browse matches!',
        });
      } else {
        toast({
          title: 'Profile Complete!',
          description: 'Your profile has been saved and sent for matching analysis.',
        });
      }

      // Navigate to analysis results page
      navigate('/analysis-results');
    } catch (error) {
      console.error('Error completing profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCompletingProfile(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Complete Your Profile
            </CardTitle>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-semibold text-purple-600">
                {completedSteps}/4 Complete
              </div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((step) => (
          <Card
            key={step.id}
            className={`cursor-pointer transition-all ${
              currentStep === step.id
                ? step.id === 1 
                  ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-lg' 
                  : step.id === 2
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                  : step.id === 3
                  ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg'
                  : 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg'
                : step.isComplete
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => setCurrentStep(step.id)}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <step.icon
                  className={`h-6 w-6 ${
                    step.isComplete
                      ? 'text-green-600'
                      : currentStep === step.id
                      ? step.id === 1 
                        ? 'text-red-600' 
                        : step.id === 2
                        ? 'text-blue-600'
                        : step.id === 3
                        ? 'text-orange-600'
                        : 'text-green-600'
                      : 'text-gray-400'
                  }`}
                />
                {step.isComplete && (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-1" />
                )}
              </div>
              <h3 className={`font-semibold text-sm ${
                currentStep === step.id 
                  ? step.id === 1 
                    ? 'text-red-700' 
                    : step.id === 2
                    ? 'text-blue-700'
                    : step.id === 3
                    ? 'text-orange-700'
                    : 'text-green-700'
                  : ''
              }`}>
                {step.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2 text-red-700">Complete Your Basic Profile</h2>
                <p className="text-gray-600">This information helps us find your perfect matches</p>
              </div>
               <BasicProfileQuestions
                answers={profileData}
                onAnswerChange={handleBasicProfileAnswer}
              />
              <div className="text-center pt-6">
                <Button
                  onClick={() => handleStepComplete(1)}
                  disabled={!isBasicProfileComplete()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold disabled:opacity-50"
                  size="lg"
                >
                  Continue to Personality Questions
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Personality Questions</h2>
                <p className="text-gray-600">Answer at least 6 questions to continue</p>
              </div>
              <PersonalityQuestions
                answers={personalityAnswers}
                onAnswerChange={handlePersonalityAnswer}
              />
              <div className="text-center pt-4">
                <Button
                  onClick={() => handleStepComplete(2)}
                  disabled={Object.keys(personalityAnswers || {}).length < 6}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Interests ({Object.keys(personalityAnswers || {}).length}/6)
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Your Interests</h2>
                <p className="text-gray-600">Select at least 5 interests that describe you</p>
              </div>
              <InterestsSelector
                selectedInterests={interests}
                onInterestsChange={setInterests}
              />
              {(interests || []).length >= 5 && (
                <div className="text-center pt-4">
                  <Button
                    onClick={() => handleStepComplete(3)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Continue to Photos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Add Your Photos</h2>
                <p className="text-gray-600">Upload at least 3 photos to complete your profile</p>
              </div>
              <EnhancedPhotoUpload
                photos={photos}
                onPhotosChange={(newPhotos) => {
                  setPhotos(newPhotos);
                  // Update profile data with photo URLs
                  const photoUrls = newPhotos.map(photo => photo.url);
                  updateProfileField('photo_urls', photoUrls);
                  // Auto-save photos to database
                  saveProfile(false);
                }}
              />
              {(photos || []).length >= 3 && (
                <div className="text-center pt-4">
                  <Button
                    onClick={handleCompleteProfile}
                    disabled={isCompletingProfile}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Complete Profile & Start Discovering Matches
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button - Show when profile is complete */}
      {isProfileComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Profile Complete! 🎉
            </h2>
            <p className="text-green-700 mb-4">
              Your profile is now ready for AI analysis to find your perfect matches.
            </p>
            <Button
              onClick={() => navigate('/analysis-results')}
              className="bg-green-600 hover:bg-green-700"
            >
              View AI Analysis Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GuidedProfileFlow;
