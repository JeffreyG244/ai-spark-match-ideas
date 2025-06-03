
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { profileSchema, ProfileData } from '@/schemas/profileValidation';
import { compatibilityQuestions } from '@/data/compatibilityQuestions';
import ProfileHeader from './profile/ProfileHeader';
import ProfileForm from './profile/ProfileForm';
import CompatibilityQuestions from './profile/CompatibilityQuestions';

const ProfileManager = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: '',
    values: '',
    lifeGoals: '',
    greenFlags: ''
  });
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [profileExists, setProfileExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAnswers, setIsSavingAnswers] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'questions'>('profile');

  useEffect(() => {
    if (user) {
      loadProfile();
      loadCompatibilityAnswers();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('bio, values, life_goals, green_flags, verified')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
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
          values: data.values || '',
          lifeGoals: data.life_goals || '',
          greenFlags: data.green_flags || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompatibilityAnswers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('compatibility_answers')
        .select('answers')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading compatibility answers:', error);
        return;
      }

      if (data && data.answers) {
        setQuestionAnswers(data.answers as Record<number, string>);
      }
    } catch (error) {
      console.error('Error loading compatibility answers:', error);
    }
  };

  const validateProfile = (data: ProfileData) => {
    try {
      profileSchema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error: any) {
      const errors = error.errors?.map((e: any) => e.message) || ['Validation failed'];
      return { isValid: false, errors };
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    const validation = validateProfile(profileData);
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
        bio: profileData.bio,
        values: profileData.values,
        life_goals: profileData.lifeGoals,
        green_flags: profileData.greenFlags,
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
        console.error('Error saving profile:', result.error);
        toast({
          title: 'Error Saving Profile',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        setProfileExists(true);
        toast({
          title: 'Profile Saved Successfully',
          description: 'Your secure profile has been updated.',
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error Saving Profile',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveCompatibilityAnswers = async () => {
    if (!user || Object.keys(questionAnswers).length === 0) return;

    setIsSavingAnswers(true);
    try {
      const answersPayload = {
        user_id: user.id,
        answers: questionAnswers,
        completed_at: new Date().toISOString()
      };

      // Check if compatibility answers already exist
      const { data: existingAnswers } = await supabase
        .from('compatibility_answers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      if (existingAnswers) {
        result = await supabase
          .from('compatibility_answers')
          .update(answersPayload)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('compatibility_answers')
          .insert([answersPayload]);
      }

      if (result.error) {
        console.error('Error saving compatibility answers:', result.error);
        toast({
          title: 'Error Saving Answers',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        const answeredCount = Object.keys(questionAnswers).length;
        const score = Math.round((answeredCount / compatibilityQuestions.length) * 100);
        
        toast({
          title: 'Compatibility Answers Saved',
          description: `Your compatibility score: ${score}%. Answers saved successfully!`,
        });
      }
    } catch (error) {
      console.error('Error saving compatibility answers:', error);
      toast({
        title: 'Error Saving Answers',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsSavingAnswers(false);
    }
  };

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionAnswer = (questionId: number, answer: string) => {
    setQuestionAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

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
