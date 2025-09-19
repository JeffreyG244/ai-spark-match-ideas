
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, PieChart, TrendingUp, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const PersonalityAnalysis = () => {
  const [analysisComplete, setAnalysisComplete] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const personalityTraits = [
    { trait: "Openness", score: 85, description: "Highly creative and open to new experiences" },
    { trait: "Conscientiousness", score: 78, description: "Well-organized and reliable" },
    { trait: "Extraversion", score: 62, description: "Balanced social energy" },
    { trait: "Agreeableness", score: 91, description: "Very empathetic and cooperative" },
    { trait: "Neuroticism", score: 34, description: "Emotionally stable and calm" }
  ];

  const compatibilityTypes = [
    { type: "Complementary Match", percentage: 68, description: "Partners with opposite traits for balance" },
    { type: "Similar Match", percentage: 45, description: "Partners with similar personalities" },
    { trait: "Growth Match", percentage: 72, description: "Partners who challenge each other to grow" }
  ];

  const runAnalysis = () => {
    setIsAnalyzing(true);
    toast({
      title: "Personality Analysis Started",
      description: "AI is analyzing your communication patterns and responses...",
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      toast({
        title: "Analysis Complete",
        description: "Your personality profile has been updated with new insights!",
      });
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Personality Analysis</h2>
          <p className="text-gray-600">Deep personality insights for better matching</p>
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing} className="flex items-center gap-2">
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Run New Analysis
            </>
          )}
        </Button>
      </div>

      {analysisComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Big Five Personality Traits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Big Five Personality Traits
              </CardTitle>
              <CardDescription>
                AI-analyzed personality dimensions based on your interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalityTraits.map((trait, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{trait.trait}</span>
                    <Badge variant="secondary">{trait.score}%</Badge>
                  </div>
                  <Progress value={trait.score} className="h-2" />
                  <p className="text-sm text-gray-600">{trait.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compatibility Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Compatibility Matching Style
              </CardTitle>
              <CardDescription>
                How you match best with different personality types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {compatibilityTypes.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{type.type}</span>
                    <Badge 
                      variant={type.percentage > 65 ? "default" : "secondary"}
                    >
                      {type.percentage}%
                    </Badge>
                  </div>
                  <Progress value={type.percentage} className="h-2" />
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Personality Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Communication Style</h4>
                  <p className="text-sm text-blue-700">
                    You prefer thoughtful, deep conversations and tend to listen more than you speak.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Relationship Approach</h4>
                  <p className="text-sm text-green-700">
                    You value emotional connection and stability, preferring long-term commitments.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Ideal Partner</h4>
                  <p className="text-sm text-purple-700">
                    Someone who balances your introspective nature with social energy and adventure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PersonalityAnalysis;
