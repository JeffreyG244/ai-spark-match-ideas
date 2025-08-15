import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, MessageCircle, Lightbulb, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
const MindMeld = () => {
    const [meldActive, setMeldActive] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const connectionDepths = [
        { level: "Intellectual Resonance", depth: 94, description: "Synchronized thinking patterns" },
        { level: "Emotional Wavelength", depth: 88, description: "Harmonized feeling frequencies" },
        { level: "Creative Synergy", depth: 91, description: "Complementary imagination flows" },
        { level: "Philosophical Alignment", depth: 87, description: "Shared worldview foundations" },
        { level: "Intuitive Connection", depth: 92, description: "Natural understanding bond" }
    ];
    const meaningfulMatches = [
        {
            name: "Elena Vasquez",
            meldScore: 96,
            connectionType: "Soul Resonance",
            insights: ["Shares your love for deep philosophy", "Complementary creative energies", "Natural conversation flow"],
            meldDepth: "Profound intellectual and emotional sync"
        },
        {
            name: "Oliver Kim",
            meldScore: 91,
            connectionType: "Mind Bridge",
            insights: ["Similar problem-solving approaches", "Shared curiosity about life", "Balanced introvert-extrovert energy"],
            meldDepth: "Strong mental and creative alignment"
        }
    ];
    const conversationStarters = [
        "What's a book that changed how you see the world?",
        "If you could have dinner with any historical figure, who and why?",
        "What's something you believe that most people disagree with?",
        "Describe a moment when you felt truly connected to someone",
        "What's a dream you've never told anyone about?"
    ];
    const activateMindMeld = () => {
        setIsConnecting(true);
        toast({
            title: "MindMeld Activated",
            description: "Searching for profound intellectual and emotional connections...",
        });
        setTimeout(() => {
            setIsConnecting(false);
            setMeldActive(true);
            toast({
                title: "Deep Connections Found",
                description: "MindMeld has identified souls ready for meaningful dialogue!",
            });
        }, 3800);
    };
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-indigo-600"/>
            MindMeld
          </h2>
          <p className="text-gray-600">Meaningful connections through deep understanding</p>
        </div>
        <Button onClick={activateMindMeld} disabled={isConnecting} className="bg-indigo-600 hover:bg-indigo-700">
          {isConnecting ? (<>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting Minds...
            </>) : (<>
              <Sparkles className="h-4 w-4 mr-2"/>
              Activate MindMeld
            </>)}
        </Button>
      </div>

      {meldActive && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-800 flex items-center gap-2">
                  <Heart className="h-5 w-5"/>
                  Connection Depth Analysis
                </CardTitle>
                <CardDescription>AI-measured meaningful connection potential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectionDepths.map((connection, index) => (<div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{connection.level}</span>
                      <Badge className="bg-indigo-100 text-indigo-800">{connection.depth}%</Badge>
                    </div>
                    <Progress value={connection.depth} className="h-2"/>
                    <p className="text-xs text-gray-600">{connection.description}</p>
                  </div>))}
              </CardContent>
            </Card>

            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-800 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5"/>
                  Deep Conversation Starters
                </CardTitle>
                <CardDescription>Questions designed for meaningful connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conversationStarters.map((starter, index) => (<div key={index} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-sm text-indigo-800">{starter}</p>
                    </div>))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-indigo-200">
            <CardHeader>
              <CardTitle className="text-indigo-800 flex items-center gap-2">
                <Lightbulb className="h-5 w-5"/>
                MindMeld Matches
              </CardTitle>
              <CardDescription>People seeking deep, meaningful connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {meaningfulMatches.map((match, index) => (<div key={index} className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{match.name}</h4>
                    <Badge className="bg-indigo-600">{match.meldScore}% MindMeld</Badge>
                  </div>
                  <p className="text-sm font-medium text-indigo-700 mb-2">{match.connectionType}</p>
                  <p className="text-sm text-gray-600 italic mb-3">{match.meldDepth}</p>
                  
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-indigo-800">Connection Insights:</h5>
                    {match.insights.map((insight, i) => (<p key={i} className="text-xs text-gray-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                        {insight}
                      </p>))}
                  </div>
                  
                  <Button className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-xs">
                    Start Meaningful Conversation
                  </Button>
                </div>))}
            </CardContent>
          </Card>
        </div>)}
    </div>);
};
export default MindMeld;
