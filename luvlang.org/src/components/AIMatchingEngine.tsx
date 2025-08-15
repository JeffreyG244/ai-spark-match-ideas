
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, Zap, Brain, MessageCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const AIMatchingEngine = () => {
  const [matches, setMatches] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);

  const sampleMatches = [
    {
      id: 1,
      name: "Sarah Chen",
      age: 28,
      compatibility: 94,
      aiInsights: ["Shared love for classical music", "Compatible communication style", "Similar life goals"],
      personalityMatch: "Complementary introvert-extrovert balance",
      voiceCompatibility: 87,
      emotionalIntelligence: 92,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Alex Rodriguez",
      age: 31,
      compatibility: 89,
      aiInsights: ["Both enjoy outdoor adventures", "Similar humor patterns", "Compatible work-life balance"],
      personalityMatch: "High creativity alignment",
      voiceCompatibility: 91,
      emotionalIntelligence: 85,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Emma Thompson",
      age: 26,
      compatibility: 91,
      aiInsights: ["Shared reading preferences", "Compatible sleep schedules", "Similar financial goals"],
      personalityMatch: "Strong empathy connection",
      voiceCompatibility: 88,
      emotionalIntelligence: 94,
      image: "/placeholder.svg"
    }
  ];

  useEffect(() => {
    setMatches(sampleMatches);
  }, []);

  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    toast({
      title: "AI Analysis Started",
      description: "Running advanced compatibility algorithms...",
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "3 new high-compatibility matches found!",
      });
    }, 3000);
  };

  const handleLike = () => {
    toast({
      title: "Match Liked!",
      description: `You liked ${matches[currentMatch]?.name}. AI is analyzing mutual compatibility.`,
    });
    setCurrentMatch((prev) => (prev + 1) % matches.length);
  };

  const handlePass = () => {
    setCurrentMatch((prev) => (prev + 1) % matches.length);
  };

  const match = matches[currentMatch];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Matching</h2>
          <p className="text-gray-600">Advanced algorithms find your perfect match</p>
        </div>
        <Button onClick={runAIAnalysis} disabled={isAnalyzing} className="flex items-center gap-2">
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Run AI Analysis
            </>
          )}
        </Button>
      </div>

      {match && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Profile Card */}
          <Card className="overflow-hidden">
            <div className="relative">
              <img 
                src={match.image} 
                alt={match.name}
                className="w-full h-64 object-cover"
              />
              <Badge className="absolute top-4 right-4 bg-green-500">
                {match.compatibility}% Match
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {match.name}, {match.age}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePass}
                    className="rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleLike}
                    className="rounded-full bg-pink-500 hover:bg-pink-600"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* AI Insights */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Compatibility Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Overall Compatibility</span>
                    <span className="font-semibold">{match.compatibility}%</span>
                  </div>
                  <Progress value={match.compatibility} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Voice Compatibility</span>
                    <span className="font-semibold">{match.voiceCompatibility}%</span>
                  </div>
                  <Progress value={match.voiceCompatibility} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Emotional Intelligence</span>
                    <span className="font-semibold">{match.emotionalIntelligence}%</span>
                  </div>
                  <Progress value={match.emotionalIntelligence} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>What makes you compatible</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {match.aiInsights.map((insight, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {insight}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">
                    Personality Match: {match.personalityMatch}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMatchingEngine;
