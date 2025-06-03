import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Shield, CheckCircle, AlertTriangle, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import SecureInput from './SecureInput';
import { profileSchema, ProfileData } from '@/schemas/profileValidation';
import { LIMITS, containsInappropriateContent } from '@/utils/security';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface QuestionData {
  id: number;
  question: string;
  options: string[];
}

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
  const [activeSection, setActiveSection] = useState<'profile' | 'questions'>('profile');

  const compatibilityQuestions: QuestionData[] = [
    {
      id: 1,
      question: "What \"Love Vibe\" Are You After?",
      options: [
        "Building a supportive, long-term partnership where we grow together",
        "Taking things slow—getting to know each other without rush",
        "Finding an adventurous companion for spontaneous trips and experiences",
        "Enjoying flirty banter and strong emotional chemistry",
        "Exploring intimacy and passion without heavy labels right away",
        "Re-entering the dating scene cautiously, looking to feel comfortable first"
      ]
    },
    {
      id: 2,
      question: "Which Core Values Reflect Your True Self?",
      options: [
        "Family-centered: Prioritizing family gatherings, traditions, and support",
        "Ambitious & goal-driven: Focused on career growth or personal achievement",
        "Socially conscious: Active in community causes, politics, or activism",
        "Spiritually aware: Mindful of inner growth, meditation, or faith practices",
        "Health & wellness advocate: Fitness routines, mental well-being, clean eating",
        "Eco-warrior: Practicing sustainability, zero-waste habits, green living",
        "Emotionally open: Comfortable sharing feelings and listening deeply",
        "Lifelong learner: Passionate about reading, courses, or new skills",
        "Creatively inspired: Engaged in art, music, writing, or other creative outlets",
        "Loyalty & commitment: Valuing trust, honesty, and dependability above all"
      ]
    },
    {
      id: 3,
      question: "How would you describe your approach to dating and relationships?",
      options: [
        "I'm intentional and deliberate—valuing deep, meaningful conversations",
        "I build friendships first, letting sparks come naturally over time",
        "I love fast connections—when it clicks, I dive in confidently",
        "I balance romance with realism—practical but open to passion"
      ]
    },
    {
      id: 4,
      question: "How Do You Prefer to Meet New People?",
      options: [
        "Through shared-interest groups (e.g., hiking clubs, cooking workshops)",
        "At curated in-person mixers or themed events (wine tasting, game nights)",
        "One-on-one introductions through friends or AI matchmaking",
        "Online/virtual communities and chats before meeting in person",
        "Surprise me—if the concept sounds fun, I'm willing to try it"
      ]
    },
    {
      id: 5,
      question: "What's Your Stance on Digital Boundaries During Dates?",
      options: [
        "I'm all for phone-free moments—focus on face-to-face connection",
        "I prefer partial detox—checking in only at certain times",
        "Flexible—phones are fine as long as it doesn't interrupt quality time",
        "I stay connected because sharing online experiences matters to me"
      ]
    },
    {
      id: 6,
      question: "How Eco-Conscious Is Your Lifestyle?",
      options: [
        "Fully committed—zero-waste, plant-based eating, and green transportation",
        "Eco-friendly focus—prioritizing sustainable choices when possible",
        "Interested but still learning—open to partner who guides me",
        "Not top priority—I appreciate green ideas but don't center my life around them",
        "Would love a partner to inspire me toward greener habits"
      ]
    },
    {
      id: 7,
      question: "How Much Do You Value Profile Verification?",
      options: [
        "1 (I trust intuition over digital badges)",
        "2 (Preferred but not essential)",
        "3 (Neutral—depends on the situation)",
        "4 (Important—gives me peace of mind)",
        "5 (Non-negotiable—only verified profiles for me)"
      ]
    },
    {
      id: 8,
      question: "Which Small Romantic Gesture Feels Most Meaningful to You?",
      options: [
        "Curating a personalized playlist or podcast episode just for me",
        "Sending a heartfelt voice note first thing in the morning",
        "Surprising me with thoughtful e-gift cards (coffee, dinner, flowers)",
        "Sharing inside jokes, funny memes, or custom emojis",
        "Receiving handwritten notes or small mailed tokens",
        "Planning a creative mini-date (painting night, stargazing, book exchange)"
      ]
    },
    {
      id: 9,
      question: "Choose Your Ideal First Meet-Up Scenario:",
      options: [
        "Casual coffee at a cozy café with natural lighting",
        "Scenic nature walk or easy hiking trail to chat freely",
        "Fun virtual video date—cooking together or playing a quiz game",
        "Attending a small themed group event (trivia night, gallery opening)",
        "Interactive creative class (pottery, mixology, dance lesson)",
        "Trying a VR/AR experience—immersive art gallery or virtual escape room"
      ]
    },
    {
      id: 10,
      question: "What Conversation Style Fuels Your Fire?",
      options: [
        "Deep, introspective talks about purpose, dreams, and goals",
        "Playful banter, witty comebacks, and light teasing"
      ]
    },
    {
      id: 11,
      question: "Which Compatibility Qualities Matter Most to You in a Match?",
      options: [
        "Physical vibe (height, fitness level, style)",
        "Financial values (spender vs. saver, investment mindset)",
        "Parenting/family goals (kids now or in future, family dynamics)",
        "Political or social beliefs (aligning on major issues)",
        "Career ambition or work-life balance preferences",
        "Pet love (dog person, cat person, or pet allergies)",
        "Health & fitness routine (gym goer, outdoor enthusiast, wellness-focused)",
        "Emotional maturity & communication style"
      ]
    },
    {
      id: 12,
      question: "How Do You Most Enjoy Expressing Your Personality to New People?",
      options: [
        "A short, candid video clip sharing my passions",
        "A voice message with a genuine \"hello\" and fun fact",
        "A creative written bio with humor and heartfelt details",
        "An AI-crafted introduction highlighting my top traits",
        "An interactive mini-quiz about my quirks and preferences"
      ]
    },
    {
      id: 13,
      question: "How Open Are You to an Age Gap?",
      options: [
        "Only within my own decade for life-stage alignment",
        "Up to a 5-year difference if energy matches",
        "Comfortable with 10+ years if we vibe well",
        "Age doesn't matter—if the connection is real, it works"
      ]
    },
    {
      id: 14,
      question: "Social Media Sharing Preferences:",
      options: [
        "Linking socials (Instagram, TikTok, LinkedIn) to show my world",
        "Sharing only curated posts or private story highlights",
        "No social links now—keeping it just within the app",
        "Will share after building trust and seeing genuine interest"
      ]
    },
    {
      id: 15,
      question: "What's Your Date Planning Style?",
      options: [
        "Spontaneous \"surprise\" dates—live in the moment",
        "Meticulous planning—reservations, itineraries, and backups",
        "Hybrid approach—basic plan with room for fun detours",
        "Thoughtful gestures matter more than agendas (flowers, notes, songs)"
      ]
    }
  ];

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
            <div className="space-y-6">
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
            </div>
          )}

          {activeSection === 'questions' && (
            <div className="space-y-8">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">AI Compatibility Matching</h3>
                    <p className="text-sm text-blue-600">
                      Answer these questions to improve your match accuracy and find deeper connections
                    </p>
                  </div>
                </div>
              </div>

              {compatibilityQuestions.map((question) => (
                <Card key={question.id} className="border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-gray-800">
                      {question.id}. {question.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={questionAnswers[question.id] || ''}
                      onValueChange={(value) => handleQuestionAnswer(question.id, value)}
                    >
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-start space-x-2 py-2">
                          <RadioGroupItem value={option} id={`q${question.id}-${index}`} />
                          <Label 
                            htmlFor={`q${question.id}-${index}`} 
                            className="text-sm leading-relaxed cursor-pointer flex-1"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Questions answered: {answeredQuestions} of {totalQuestions}
                </p>
                <Badge 
                  className={`${answeredQuestions === totalQuestions ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {answeredQuestions === totalQuestions ? 'Complete!' : 'In Progress'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManager;
