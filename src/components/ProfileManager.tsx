
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import SecureInput from './SecureInput';
import { profileSchema, ProfileData } from '@/schemas/profileValidation';
import { LIMITS, containsInappropriateContent } from '@/utils/security';

const ProfileManager = () => {
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

  useEffect(() => {
    if (user) {
      loadProfile();
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

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
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

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-purple-600" />
                Secure Profile Manager
              </CardTitle>
              <CardDescription>
                Connected to database with enterprise-grade security
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{completionPercentage}%</div>
              <Badge className="bg-purple-100 text-purple-800">Complete</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Database Connected</h3>
                <p className="text-sm text-green-600">
                  Your profile is securely stored with Row Level Security enabled
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>

          <SecureInput
            id="bio"
            label="Authentic Bio"
            placeholder="Tell your story in a way that showcases your personality and attracts meaningful connections..."
            value={profileData.bio}
            onChange={(value) => updateProfileField('bio', value)}
            maxLength={LIMITS.BIO_MAX_LENGTH}
            minLength={LIMITS.MIN_BIO_LENGTH}
            required
            validation={(value) => {
              if (containsInappropriateContent(value)) {
                return "Bio contains inappropriate content";
              }
              return null;
            }}
          />

          <SecureInput
            id="values"
            label="Core Values"
            placeholder="What principles guide your life? (e.g., integrity, growth, family, adventure...)"
            value={profileData.values}
            onChange={(value) => updateProfileField('values', value)}
            maxLength={LIMITS.VALUES_MAX_LENGTH}
            validation={(value) => {
              if (containsInappropriateContent(value)) {
                return "Values contain inappropriate content";
              }
              return null;
            }}
          />

          <SecureInput
            id="goals"
            label="Life Goals & Timeline"
            placeholder="Where do you see yourself in 5 years? What are you building toward?"
            value={profileData.lifeGoals}
            onChange={(value) => updateProfileField('lifeGoals', value)}
            maxLength={LIMITS.GOALS_MAX_LENGTH}
            validation={(value) => {
              if (containsInappropriateContent(value)) {
                return "Life goals contain inappropriate content";
              }
              return null;
            }}
          />

          <SecureInput
            id="greenFlags"
            label="Green Flags You Offer"
            placeholder="What positive qualities do you bring to a relationship?"
            value={profileData.greenFlags}
            onChange={(value) => updateProfileField('greenFlags', value)}
            maxLength={LIMITS.GREEN_FLAGS_MAX_LENGTH}
            validation={(value) => {
              if (containsInappropriateContent(value)) {
                return "Green flags contain inappropriate content";
              }
              return null;
            }}
          />

          <Button 
            onClick={saveProfile} 
            disabled={isSaving} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Securely...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                {profileExists ? 'Update Profile' : 'Create Profile'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManager;
