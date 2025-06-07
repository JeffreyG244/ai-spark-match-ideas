
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Brain, ArrowLeft, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompatibilityAnswers } from '@/hooks/useCompatibilityAnswers';
import { useProfileData } from '@/hooks/useProfileData';
import { diverseUsersData } from '@/data/diverseUsersData';
import { compatibilityQuestions } from '@/data/compatibilityQuestions';

interface CompatibilityMatch {
  user: typeof diverseUsersData[0];
  compatibilityScore: number;
  sharedValues: string[];
  matchInsights: string[];
}

const Matches = () => {
  const { user, signOut } = useAuth();
  const { questionAnswers, loadCompatibilityAnswers } = useCompatibilityAnswers();
  const { profileData, loadProfile } = useProfileData();
  const [matches, setMatches] = useState<CompatibilityMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCompatibilityAnswers();
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (Object.keys(questionAnswers).length > 0 && profileData.bio) {
      calculateMatches();
    }
  }, [questionAnswers, profileData]);

  const calculateMatches = () => {
    setIsLoading(true);
    
    // Simulate compatibility calculation based on user's answers and profile
    const calculatedMatches: CompatibilityMatch[] = diverseUsersData.map(seedUser => {
      // Calculate compatibility score based on various factors
      let compatibilityScore = Math.floor(Math.random() * 30) + 70; // Base score 70-100
      
      // Boost score if values align
      const userValues = profileData.values.toLowerCase().split(',').map(v => v.trim());
      const seedUserValues = seedUser.values.toLowerCase().split(',').map(v => v.trim());
      const sharedValues = userValues.filter(value => 
        seedUserValues.some(seedValue => 
          seedValue.includes(value) || value.includes(seedValue)
        )
      );
      
      if (sharedValues.length > 0) {
        compatibilityScore += sharedValues.length * 5;
      }
      
      // Generate match insights based on compatibility questions
      const matchInsights = [];
      
      if (questionAnswers[1]) { // Love vibe question
        matchInsights.push("Similar relationship goals and dating approach");
      }
      
      if (questionAnswers[2]) { // Core values question
        matchInsights.push("Strong alignment on life values and priorities");
      }
      
      if (questionAnswers[3]) { // Dating approach question
        matchInsights.push("Compatible communication and dating styles");
      }
      
      if (sharedValues.length > 0) {
        matchInsights.push(`Shared values: ${sharedValues.slice(0, 2).join(', ')}`);
      }
      
      // Ensure score doesn't exceed 100
      compatibilityScore = Math.min(compatibilityScore, 99);
      
      return {
        user: seedUser,
        compatibilityScore,
        sharedValues,
        matchInsights: matchInsights.length > 0 ? matchInsights : ["Great potential for connection"]
      };
    });
    
    // Sort by compatibility score
    calculatedMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    setMatches(calculatedMatches);
    setIsLoading(false);
  };

  const getCompatibilityLevel = (score: number) => {
    if (score >= 90) return { level: "Exceptional Match", color: "text-green-600", bgColor: "bg-green-100" };
    if (score >= 80) return { level: "Great Match", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (score >= 70) return { level: "Good Match", color: "text-purple-600", bgColor: "bg-purple-100" };
    return { level: "Potential Match", color: "text-gray-600", bgColor: "bg-gray-100" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing compatibility matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Luvlang</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Compatibility Matches</h1>
          <p className="text-gray-600">AI-powered matches based on your profile and compatibility answers</p>
        </div>

        {/* Compatibility Summary */}
        <Card className="border-purple-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Your Compatibility Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(questionAnswers).length}
                </div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {matches.length}
                </div>
                <div className="text-sm text-gray-600">Potential Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {matches.length > 0 ? Math.round(matches.reduce((sum, m) => sum + m.compatibilityScore, 0) / matches.length) : 0}%
                </div>
                <div className="text-sm text-gray-600">Avg Compatibility</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.map((match, index) => {
            const compatibility = getCompatibilityLevel(match.compatibilityScore);
            
            return (
              <Card key={index} className="border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={match.user.photos[0]} 
                        alt={`${match.user.firstName} ${match.user.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {match.user.firstName} {match.user.lastName}
                      </CardTitle>
                      <Badge className={`${compatibility.bgColor} ${compatibility.color} mb-2`}>
                        {compatibility.level}
                      </Badge>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Compatibility Score</span>
                          <span className="font-semibold text-purple-600">{match.compatibilityScore}%</span>
                        </div>
                        <Progress value={match.compatibilityScore} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                    {match.user.bio}
                  </p>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Match Insights
                    </h4>
                    <ul className="space-y-1">
                      {match.matchInsights.slice(0, 2).map((insight, i) => (
                        <li key={i} className="text-sm text-gray-600">• {insight}</li>
                      ))}
                    </ul>
                  </div>

                  {match.sharedValues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Shared Values</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.sharedValues.slice(0, 3).map((value, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-green-300 text-green-700">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Heart className="h-4 w-4 mr-2" />
                      Like
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {matches.length === 0 && (
          <Card className="border-purple-200 text-center py-12">
            <CardContent>
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Complete Your Profile for Better Matches</h3>
              <p className="text-gray-600 mb-6">
                Answer compatibility questions and fill out your profile to see AI-powered matches
              </p>
              <Link to="/dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Complete Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Matches;
