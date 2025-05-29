import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Play, Pause, Volume2, AudioWaveform } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const VoiceCompatibility = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const mediaRecorderRef = useRef(null);

  const voiceMetrics = [
    { metric: "Tone Harmony", score: 88, description: "Your voices complement each other well" },
    { metric: "Pace Compatibility", score: 92, description: "Similar speaking rhythms" },
    { metric: "Vocal Energy", score: 76, description: "Balanced energy levels" },
    { metric: "Pitch Resonance", score: 85, description: "Harmonious vocal frequencies" }
  ];

  const voiceMatches = [
    {
      name: "Emma Wilson",
      compatibility: 94,
      insights: ["Complementary vocal tones", "Similar laugh patterns", "Matching conversation pace"],
      audioSample: "Warm, melodic voice with a gentle speaking pace"
    },
    {
      name: "Sofia Martinez", 
      compatibility: 89,
      insights: ["Harmonious pitch levels", "Compatible vocal energy", "Similar accent patterns"],
      audioSample: "Clear, confident voice with expressive intonation"
    }
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak naturally for 30 seconds for voice analysis",
      });

      setTimeout(() => {
        stopRecording();
      }, 30000);
      
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access for voice analysis",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecording(true);
      
      toast({
        title: "Recording Complete",
        description: "Your voice sample has been captured successfully",
      });
    }
  };

  const analyzeVoice = () => {
    setIsAnalyzing(true);
    toast({
      title: "Voice Analysis Started",
      description: "AI is analyzing your vocal patterns and compatibility...",
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      toast({
        title: "Analysis Complete",
        description: "Voice compatibility results are ready!",
      });
    }, 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Voice Compatibility Analysis</h2>
          <p className="text-gray-600">AI-powered vocal pattern matching for deeper connections</p>
        </div>
      </div>

      {/* Voice Recording Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Sample Recording
          </CardTitle>
          <CardDescription>
            Record a 30-second sample for AI voice analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            {isRecording ? (
              <div className="text-center">
                <div className="animate-pulse">
                  <AudioWaveform className="h-16 w-16 text-red-500 mx-auto mb-4" />
                </div>
                <p className="text-lg font-medium text-red-600">Recording in progress...</p>
                <Button 
                  variant="outline" 
                  onClick={stopRecording}
                  className="mt-4"
                >
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Mic className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-4">
                  {hasRecording ? "Recording Complete" : "Ready to Record"}
                </p>
                <Button 
                  onClick={hasRecording ? analyzeVoice : startRecording}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : hasRecording ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Analyze Voice
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice Analysis Results</CardTitle>
              <CardDescription>AI-analyzed vocal characteristics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {voiceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{metric.metric}</span>
                    <Badge variant={metric.score > 80 ? "default" : "secondary"}>
                      {metric.score}%
                    </Badge>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voice-Compatible Matches</CardTitle>
              <CardDescription>People with complementary vocal patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {voiceMatches.map((match, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{match.name}</h4>
                    <Badge className="bg-green-500">{match.compatibility}% compatible</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{match.audioSample}</p>
                  <div className="space-y-1">
                    {match.insights.map((insight, i) => (
                      <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        {insight}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VoiceCompatibility;
