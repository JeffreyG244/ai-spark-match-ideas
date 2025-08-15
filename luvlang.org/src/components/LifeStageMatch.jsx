import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
const LifeStageMatch = () => {
    const [analysisComplete, setAnalysisComplete] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const lifeGoals = [
        { goal: "Career Advancement", priority: 85, timeline: "2-3 years", alignment: 92 },
        { goal: "Family Planning", priority: 78, timeline: "3-5 years", alignment: 88 },
        { goal: "Financial Stability", priority: 91, timeline: "1-2 years", alignment: 95 },
        { goal: "Travel & Adventure", priority: 73, timeline: "Ongoing", alignment: 82 },
        { goal: "Personal Growth", priority: 88, timeline: "Lifelong", alignment: 90 }
    ];
    const lifestageMatches = [
        {
            name: "David Chen",
            lifestageScore: 94,
            stage: "Career Building & Settling",
            goals: ["Tech Leadership", "Home Ownership", "Travel"],
            timeline: "Ready for serious relationship",
            alignment: "Perfect timing alignment"
        },
        {
            name: "Lisa Rodriguez",
            lifestageScore: 89,
            stage: "Growth & Exploration",
            goals: ["Creative Pursuits", "Adventure", "Learning"],
            timeline: "Exploring deep connections",
            alignment: "Complementary growth paths"
        }
    ];
    const milestones = [
        { milestone: "Career Established", status: "achieved", year: "2023" },
        { milestone: "Financial Independence", status: "in-progress", year: "2025" },
        { milestone: "Serious Relationship", status: "seeking", year: "2024" },
        { milestone: "Home Ownership", status: "planned", year: "2026" },
        { milestone: "Family Planning", status: "future", year: "2027" }
    ];
    const runLifestageAnalysis = () => {
        setIsAnalyzing(true);
        toast({
            title: "Life Stage Analysis Started",
            description: "Mapping your life trajectory and matching compatible timelines...",
        });
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisComplete(true);
            toast({
                title: "Life Stage Analysis Complete",
                description: "Found people perfectly aligned with your life journey!",
            });
        }, 4000);
    };
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-blue-600"/>
            LifeStage Match
          </h2>
          <p className="text-gray-600">Life goal alignment for perfect timing</p>
        </div>
        <Button onClick={runLifestageAnalysis} disabled={isAnalyzing} className="bg-blue-600 hover:bg-blue-700">
          {isAnalyzing ? (<>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>) : (<>
              <Calendar className="h-4 w-4 mr-2"/>
              Analyze Life Stage
            </>)}
        </Button>
      </div>

      {analysisComplete && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Your Life Goals</CardTitle>
              <CardDescription>AI-analyzed priorities and timelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lifeGoals.map((goal, index) => (<div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{goal.goal}</span>
                    <Badge className="bg-blue-100 text-blue-800">{goal.alignment}%</Badge>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Priority: {goal.priority}%</span>
                    <span>{goal.timeline}</span>
                  </div>
                  <Progress value={goal.priority} className="h-2"/>
                </div>))}
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Life Milestones</CardTitle>
              <CardDescription>Your journey timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.map((milestone, index) => (<div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{milestone.milestone}</h4>
                    <p className="text-xs text-gray-600">{milestone.year}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${milestone.status === 'achieved' ? 'border-green-300 text-green-700' :
                    milestone.status === 'in-progress' ? 'border-yellow-300 text-yellow-700' :
                        milestone.status === 'seeking' ? 'border-blue-300 text-blue-700' :
                            'border-gray-300 text-gray-700'}`}>
                    {milestone.status}
                  </Badge>
                </div>))}
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Stage-Aligned Matches</CardTitle>
              <CardDescription>People in compatible life stages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lifestageMatches.map((match, index) => (<div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{match.name}</h4>
                    <Badge className="bg-blue-600">{match.lifestageScore}% Match</Badge>
                  </div>
                  <p className="text-sm font-medium text-blue-700 mb-1">{match.stage}</p>
                  <p className="text-xs text-gray-600 mb-2">{match.timeline}</p>
                  <p className="text-xs text-blue-600 italic mb-2">{match.alignment}</p>
                  <div className="flex flex-wrap gap-1">
                    {match.goals.map((goal, i) => (<Badge key={i} variant="outline" className="text-xs border-blue-300">
                        {goal}
                      </Badge>))}
                  </div>
                </div>))}
            </CardContent>
          </Card>
        </div>)}
    </div>);
};
export default LifeStageMatch;
