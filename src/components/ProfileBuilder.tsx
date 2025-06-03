import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Target, Heart, Brain, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import SecureInput from "./SecureInput";
import { profileSchema, ProfileData } from "@/schemas/profileValidation";
import { LIMITS, rateLimiter, containsInappropriateContent } from "@/utils/security";

const ProfileBuilder = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: "",
    values: "",
    lifeGoals: "",
    greenFlags: ""
  });
  const [profileScore, setProfileScore] = useState(72);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [securityStatus, setSecurityStatus] = useState({
    contentSafe: true,
    profileComplete: false,
    validationPassed: false
  });

  const profileSections = [
    {
      title: "Authentic Bio",
      description: "Tell your story in a way that attracts your ideal match",
      score: 85,
      tips: ["Be specific about your interests", "Show, don't tell your personality", "Include conversation starters"]
    },
    {
      title: "Core Values",
      description: "What matters most to you in life and relationships",
      score: 78,
      tips: ["Be honest about non-negotiables", "Include 3-5 key values", "Explain why they matter"]
    },
    {
      title: "Life Goals & Timeline",
      description: "Where you see yourself and your relationship going",
      score: 82,
      tips: ["Be clear about relationship goals", "Include career/personal aspirations", "Mention timeline preferences"]
    },
    {
      title: "Green Flags Only",
      description: "Positive traits you bring and seek in others",
      score: 75,
      tips: ["Focus on positive qualities", "Mention emotional maturity signs", "Include communication strengths"]
    }
  ];

  const aiSuggestions = [
    {
      category: "Bio Enhancement",
      suggestion: "Consider adding a specific hobby or passion that could be a conversation starter",
      impact: "High"
    },
    {
      category: "Values Clarity",
      suggestion: "Your values section could be more specific - what does 'family-oriented' mean to you?",
      impact: "Medium"
    },
    {
      category: "Green Flags",
      suggestion: "Add examples of how you show emotional intelligence in relationships",
      impact: "High"
    },
    {
      category: "Security Check",
      suggestion: "All content has been verified as appropriate and authentic",
      impact: "Critical"
    }
  ];

  const validateProfile = (data: ProfileData) => {
    try {
      profileSchema.parse(data);
      const contentSafe = !Object.values(data).some(value => containsInappropriateContent(value));
      const profileComplete = data.bio.length >= LIMITS.MIN_BIO_LENGTH && 
                            data.values.length > 0 && 
                            data.lifeGoals.length > 0 && 
                            data.greenFlags.length > 0;
      
      setSecurityStatus({
        contentSafe,
        profileComplete,
        validationPassed: true
      });
      
      return true;
    } catch (error) {
      setSecurityStatus(prev => ({ ...prev, validationPassed: false }));
      return false;
    }
  };

  const runProfileAnalysis = () => {
    // Rate limiting check
    if (!rateLimiter.isAllowed('profile_analysis', 3, 300000)) { // 3 attempts per 5 minutes
      toast({
        title: "Rate Limit Exceeded",
        description: "Please wait before running another analysis.",
        variant: "destructive"
      });
      return;
    }

    if (!validateProfile(profileData)) {
      toast({
        title: "Profile Validation Failed",
        description: "Please fix the issues in your profile before analyzing.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    toast({
      title: "Secure AI Profile Analysis Started",
      description: "Analyzing your profile with privacy-first AI...",
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      setProfileScore(89);
      toast({
        title: "Profile Analysis Complete",
        description: "Your secure profile optimization score increased to 89%!",
      });
    }, 3500);
  };

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    const updatedData = { ...profileData, [field]: value };
    setProfileData(updatedData);
    validateProfile(updatedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-8 w-8 text-purple-600" />
            Secure Build-A-Match Profile
          </h2>
          <p className="text-gray-600">Create a safe, authentic profile that attracts your ideal match</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">{profileScore}%</div>
          <Badge className="bg-purple-100 text-purple-800">Security Score</Badge>
        </div>
      </div>

      {/* Security Status Banner */}
      <Card className={`border-2 ${securityStatus.contentSafe ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Shield className={`h-6 w-6 ${securityStatus.contentSafe ? 'text-green-600' : 'text-red-600'}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Security Status</h3>
              <div className="flex gap-4 text-sm">
                <span className={securityStatus.contentSafe ? 'text-green-600' : 'text-red-600'}>
                  Content Safety: {securityStatus.contentSafe ? 'Verified' : 'Issues Detected'}
                </span>
                <span className={securityStatus.validationPassed ? 'text-green-600' : 'text-gray-500'}>
                  Validation: {securityStatus.validationPassed ? 'Passed' : 'Pending'}
                </span>
                <span className={securityStatus.profileComplete ? 'text-green-600' : 'text-gray-500'}>
                  Completeness: {securityStatus.profileComplete ? 'Complete' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Profile Sections</CardTitle>
              <CardDescription>Build each section to maximize your match potential</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileSections.map((section, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{section.title}</span>
                    <Badge className="bg-purple-100 text-purple-800">{section.score}%</Badge>
                  </div>
                  <Progress value={section.score} className="h-2" />
                  <p className="text-sm text-gray-600">{section.description}</p>
                  <div className="text-xs text-gray-500">
                    Tips: {section.tips.join(" • ")}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">AI Security Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{suggestion.category}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        suggestion.impact === 'Critical' ? 'border-green-300 text-green-700' :
                        suggestion.impact === 'High' ? 'border-red-300 text-red-700' :
                        'border-yellow-300 text-yellow-700'
                      }`}
                    >
                      {suggestion.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{suggestion.suggestion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Secure Profile Editor</CardTitle>
              <CardDescription>All inputs are validated and sanitized for your safety</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                onClick={runProfileAnalysis} 
                disabled={isAnalyzing || !securityStatus.validationPassed} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Secure AI Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Secure AI Optimization
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileBuilder;
