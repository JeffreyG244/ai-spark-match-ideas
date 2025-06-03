
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { compatibilityQuestions } from '@/data/compatibilityQuestions';
import { useProfileData } from '@/hooks/useProfileData';
import { useCompatibilityAnswers } from '@/hooks/useCompatibilityAnswers';
import ProfileHeader from './profile/ProfileHeader';
import ProfileForm from './profile/ProfileForm';
import CompatibilityQuestions from './profile/CompatibilityQuestions';

const ProfileManager = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'questions'>('profile');

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
  const totalQuestions = compatibilityQuestions.length;

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <ProfileHeader completionPercentage={completionPercentage} />
        <CardContent>
          {/* Section Navigation */}
          <div className="flex gap-4 mb-6">
            <Button
              variant={activeSection === 'profile' ? 'default' : 'outline'}
              onClick={() => setActiveSection('profile')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Profile Details
            </Button>
            <Button
              variant={activeSection === 'questions' ? 'default' : 'outline'}
              onClick={() => setActiveSection('questions')}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Compatibility Questions ({answeredQuestions}/{totalQuestions})
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManager;
