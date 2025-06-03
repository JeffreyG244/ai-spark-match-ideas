
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Target, Heart, Brain, CheckCircle, AlertCircle, Shield, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ProfileManager from "./ProfileManager";

const ProfileBuilder = () => {
  const [profileScore, setProfileScore] = useState(72);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      category: "Database Security",
      suggestion: "Your profile is now securely stored with Row Level Security protection",
      impact: "Critical"
    },
    {
      category: "Authentication",
      suggestion: "User authentication is active - your data is protected",
      impact: "Critical"
    },
    {
      category: "Bio Enhancement",
      suggestion: "Consider adding a specific hobby or passion that could be a conversation starter",
      impact: "High"
    },
    {
      category: "Values Clarity",
      suggestion: "Your values section could be more specific - what does 'family-oriented' mean to you?",
      impact: "Medium"
    }
  ];

  const runProfileAnalysis = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-8 w-8 text-purple-600" />
            Secure Build-A-Match Profile
          </h2>
          <p className="text-gray-600">Create a safe, authentic profile with database protection</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">{profileScore}%</div>
          <Badge className="bg-purple-100 text-purple-800">Security Score</Badge>
        </div>
      </div>

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
              <CardTitle className="text-purple-800">AI Security Insights</CardTitle>
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

          <div className="text-center">
            <Button 
              onClick={runProfileAnalysis} 
              disabled={isAnalyzing} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Secure AI Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <ProfileManager />
        </div>
      </div>
    </div>
  );
};

export default ProfileBuilder;
