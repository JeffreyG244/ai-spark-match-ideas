
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Heart, Brain, Calendar, Target } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const CompatibilityPredictor = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionComplete, setPredictionComplete] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState("");

  const compatibilityFactors = [
    { factor: "Communication Patterns", weight: 25, score: 92, impact: "High" },
    { factor: "Life Goals Alignment", weight: 20, score: 88, impact: "High" },
    { factor: "Personality Compatibility", weight: 20, score: 85, impact: "Medium" },
    { factor: "Shared Interests", weight: 15, score: 78, impact: "Medium" },
    { factor: "Lifestyle Compatibility", weight: 10, score: 91, impact: "High" },
    { factor: "Emotional Intelligence", weight: 10, score: 89, impact: "Medium" }
  ];

  const predictions = {
    shortTerm: {
      success: 94,
      insights: [
        "Strong initial attraction predicted",
        "Excellent conversation compatibility",
        "Shared humor patterns detected"
      ]
    },
    longTerm: {
      success: 87,
      insights: [
        "High potential for lasting relationship",
        "Compatible life trajectory analysis",
        "Strong emotional support compatibility"
      ]
    },
    challenges: [
      "Different social energy levels may require balance",
      "Communication style differences in conflict resolution",
      "Career ambition alignment needs attention"
    ]
  };

  const runPrediction = () => {
    setIsAnalyzing(true);
    toast({
      title: "Compatibility Prediction Started",
      description: "AI is analyzing thousands of relationship data points...",
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      setPredictionComplete(true);
      toast({
        title: "Prediction Complete",
        description: "Comprehensive compatibility analysis is ready!",
      });
    }, 4000);
  };

  const overallScore = compatibilityFactors.reduce((acc, factor) => 
    acc + (factor.score * factor.weight / 100), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Compatibility Predictor</h2>
          <p className="text-gray-600">Advanced algorithms predict relationship success probability</p>
        </div>
        <Button onClick={runPrediction} disabled={isAnalyzing} className="flex items-center gap-2">
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Run Prediction
            </>
          )}
        </Button>
      </div>

      {/* Match Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select Match for Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Sarah Chen", "Alex Rodriguez", "Emma Thompson"].map((name) => (
              <Button
                key={name}
                variant={selectedMatch === name ? "default" : "outline"}
                onClick={() => setSelectedMatch(name)}
                className="h-auto p-4"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-gray-500">94% initial match</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {predictionComplete && selectedMatch && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compatibility Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Compatibility Analysis
              </CardTitle>
              <CardDescription>
                Weighted factors contributing to relationship success
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600">{Math.round(overallScore)}%</div>
                <p className="text-sm text-gray-600">Overall Compatibility Score</p>
              </div>
              
              {compatibilityFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{factor.factor}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={factor.impact === "High" ? "default" : "secondary"} className="text-xs">
                        {factor.impact}
                      </Badge>
                      <span className="text-sm">{factor.score}%</span>
                    </div>
                  </div>
                  <Progress value={factor.score} className="h-1.5" />
                  <p className="text-xs text-gray-500">Weight: {factor.weight}%</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Predictions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Relationship Timeline Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">3-Month Success Rate</h4>
                    <Badge className="bg-green-500">{predictions.shortTerm.success}%</Badge>
                  </div>
                  <ul className="space-y-1">
                    {predictions.shortTerm.insights.map((insight, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Long-Term Success Rate</h4>
                    <Badge className="bg-blue-500">{predictions.longTerm.success}%</Badge>
                  </div>
                  <ul className="space-y-1">
                    {predictions.longTerm.insights.map((insight, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Potential Challenges
                </CardTitle>
                <CardDescription>AI-identified areas for attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {predictions.challenges.map((challenge, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompatibilityPredictor;
