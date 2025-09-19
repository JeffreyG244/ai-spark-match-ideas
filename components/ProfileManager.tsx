import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Brain, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { compatibilityQuestions } from '@/data/compatibilityQuestions';
import { useProfileData } from '@/hooks/useProfileData';
import { useCompatibilityAnswers } from '@/hooks/useCompatibilityAnswers';
import ProfileHeader from './profile/ProfileHeader';
import ComprehensiveProfileBuilder from './profile/ComprehensiveProfileBuilder';
import CompatibilityQuestions from './profile/CompatibilityQuestions';
import SimplePhotoCapture from './SimplePhotoCapture';
import ProfileForm from './profile/ProfileForm';
import GuidedProfileFlow from './profile/GuidedProfileFlow';

const ProfileManager = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'guided' | 'comprehensive'>('guided');
  const [activeSection, setActiveSection] = useState<'profile' | 'questions' | 'photos'>('profile');

  const {
    profileData,
    profileExists,
    isLoading,
    isSaving,
    loadProfile,
    saveProfile,
    updateProfileField
  } = useProfileData();

  const {
    questionAnswers,
    isSavingAnswers,
    loadCompatibilityAnswers,
    saveCompatibilityAnswers,
    handleQuestionAnswer
  } = useCompatibilityAnswers();

  useEffect(() => {
    if (user) {
      loadProfile();
      loadCompatibilityAnswers();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const completionPercentage = Math.round(
    Object.values(profileData).filter(value => value.length > 0).length / 4 * 100
  );

  const answeredQuestions = Object.keys(questionAnswers).length;
  const totalQuestions = 17;

  // Show guided profile flow by default for better UX
  if (viewMode === 'guided') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Complete Your Profile</h2>
          <Button
            variant="outline"
            onClick={() => setViewMode('comprehensive')}
            size="sm"
          >
            Switch to Advanced View
          </Button>
        </div>
        <GuidedProfileFlow />
      </div>
    );
  }

  // Comprehensive view (existing functionality)
  if (viewMode === 'comprehensive') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Profile Builder</h2>
          <Button
            variant="outline"
            onClick={() => setViewMode('guided')}
            size="sm"
          >
            Switch to Guided Flow
          </Button>
        </div>
        <ComprehensiveProfileBuilder />
      </div>
    );
  }

  // Fallback to original simple view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Profile Manager</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode('guided')}
            size="sm"
          >
            Guided Flow
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode('comprehensive')}
            size="sm"
          >
            Advanced View
          </Button>
        </div>
      </div>

      <Card className="border-purple-200">
        <ProfileHeader completionPercentage={completionPercentage} />
        <CardContent>
          {/* Section Navigation */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Button
              variant={activeSection === 'profile' ? 'default' : 'outline'}
              onClick={() => setActiveSection('profile')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Create Profile
            </Button>
            <Button
              variant={activeSection === 'questions' ? 'default' : 'outline'}
              onClick={() => setActiveSection('questions')}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Compatibility Questions ({answeredQuestions}/{totalQuestions})
            </Button>
            <Button
              variant={activeSection === 'photos' ? 'default' : 'outline'}
              onClick={() => setActiveSection('photos')}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Profile Pics
            </Button>
          </div>

          {activeSection === 'profile' && (
            <ProfileForm
              profileData={profileData}
              updateProfileField={updateProfileField}
              saveProfile={saveProfile}
              isSaving={isSaving}
              profileExists={profileExists}
            />
          )}

          {activeSection === 'questions' && (
            <CompatibilityQuestions
              questionAnswers={questionAnswers}
              handleQuestionAnswer={handleQuestionAnswer}
              onSaveAnswers={saveCompatibilityAnswers}
              isSaving={isSavingAnswers}
            />
          )}

          {activeSection === 'photos' && (
            <SimplePhotoCapture />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManager;
