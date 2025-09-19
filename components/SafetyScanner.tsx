
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle, Eye, Search, Zap } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const SafetyScanner = () => {
  const [scanResults, setScanResults] = useState({
    profileSafety: 94,
    conversationSafety: 89,
    behaviorAnalysis: 92,
    verificationStatus: 96
  });
  const [isScanning, setIsScanning] = useState(false);

  const redFlagCategories = [
    {
      category: "Profile Inconsistencies",
      detected: 0,
      examples: ["Photo mismatch", "Age discrepancies", "Location conflicts"],
      severity: "low"
    },
    {
      category: "Communication Red Flags",
      detected: 1,
      examples: ["Excessive compliments too early", "Avoiding video calls", "Money requests"],
      severity: "medium"
    },
    {
      category: "Behavioral Patterns",
      detected: 0,
      examples: ["Love bombing", "Isolation attempts", "Pressure tactics"],
      severity: "high"
    },
    {
      category: "Verification Issues",
      detected: 0,
      examples: ["Failed ID check", "Photo verification failed", "Social media mismatch"],
      severity: "high"
    }
  ];

  const safetyFeatures = [
    {
      feature: "Real-time Profile Scanning",
      description: "AI continuously monitors for fake profiles and catfish attempts",
      status: "active",
      accuracy: 96
    },
    {
      feature: "Conversation Analysis",
      description: "Detects manipulation, scams, and inappropriate behavior in messages",
      status: "active",
      accuracy: 91
    },
    {
      feature: "Behavioral Pattern Recognition",
      description: "Identifies concerning patterns across user interactions",
      status: "active",
      accuracy: 88
    },
    {
      feature: "Multi-source Verification",
      description: "Cross-references multiple data sources for authenticity",
      status: "active",
      accuracy: 94
    }
  ];

  const recentAlerts = [
    {
      type: "warning",
      message: "User 'Jake_M' showed rapid escalation pattern - flagged for review",
      time: "2 hours ago",
      action: "Profile temporarily hidden"
    },
    {
      type: "info",
      message: "3 new profiles verified successfully through enhanced screening",
      time: "4 hours ago",
      action: "Profiles approved"
    },
    {
      type: "success",
      message: "Photo verification system blocked 2 fake profile attempts",
      time: "6 hours ago",
      action: "Accounts rejected"
    }
  ];

  const runSafetyScan = () => {
    setIsScanning(true);
    toast({
      title: "Safety Scan Initiated",
      description: "Running comprehensive safety and authenticity checks...",
    });

    setTimeout(() => {
      setIsScanning(false);
      setScanResults({
        profileSafety: 96,
        conversationSafety: 92,
        behaviorAnalysis: 94,
        verificationStatus: 98
      });
      toast({
        title: "Safety Scan Complete",
        description: "All systems secure. Environment is safe for meaningful connections.",
      });
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-green-600" />
            Safety Scanner
          </h2>
          <p className="text-gray-600">AI-powered protection against catfish, scams, and red flags</p>
        </div>
        <Button onClick={runSafetyScan} disabled={isScanning} className="bg-green-600 hover:bg-green-700">
          {isScanning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Scanning...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Run Safety Scan
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Safety Status</CardTitle>
            <CardDescription>Current protection levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Profile Safety</span>
                  <span className="text-sm font-medium">{scanResults.profileSafety}%</span>
                </div>
                <Progress value={scanResults.profileSafety} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Conversation Safety</span>
                  <span className="text-sm font-medium">{scanResults.conversationSafety}%</span>
                </div>
                <Progress value={scanResults.conversationSafety} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Behavior Analysis</span>
                  <span className="text-sm font-medium">{scanResults.behaviorAnalysis}%</span>
                </div>
                <Progress value={scanResults.behaviorAnalysis} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Verification Status</span>
                  <span className="text-sm font-medium">{scanResults.verificationStatus}%</span>
                </div>
                <Progress value={scanResults.verificationStatus} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Red Flag Detection</CardTitle>
            <CardDescription>AI-identified risk categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {redFlagCategories.map((category, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{category.category}</h4>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={category.detected === 0 ? "outline" : "destructive"} 
                      className="text-xs"
                    >
                      {category.detected} detected
                    </Badge>
                    {category.detected === 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Monitors: {category.examples.join(", ")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Recent Security Alerts</CardTitle>
            <CardDescription>AI safety actions taken</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {alert.type === "info" && <Eye className="h-4 w-4 text-blue-500" />}
                  {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{alert.message}</p>
                <p className="text-xs text-green-600 font-medium">{alert.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Active Safety Features</CardTitle>
          <CardDescription>Comprehensive protection systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{feature.feature}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">{feature.accuracy}%</Badge>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyScanner;
