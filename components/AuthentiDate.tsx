
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertTriangle, Camera, Verified } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const AuthentiDate = () => {
  const [verificationLevel, setVerificationLevel] = useState(87);
  const [isVerifying, setIsVerifying] = useState(false);

  const verificationChecks = [
    { check: "Identity Verification", status: "verified", score: 100 },
    { check: "Photo Authenticity", status: "verified", score: 95 },
    { check: "Social Media Cross-Check", status: "verified", score: 88 },
    { check: "Background Screening", status: "pending", score: 75 },
    { check: "Behavioral Analysis", status: "verified", score: 92 }
  ];

  const safetyFeatures = [
    {
      feature: "AI Photo Verification",
      description: "Deep learning detects fake photos and filters",
      status: "active"
    },
    {
      feature: "Real-time Safety Monitoring",
      description: "AI monitors conversations for red flags",
      status: "active"
    },
    {
      feature: "Identity Cross-Verification",
      description: "Multi-source identity confirmation",
      status: "active"
    },
    {
      feature: "Behavioral Pattern Analysis",
      description: "Detects suspicious user behavior",
      status: "active"
    }
  ];

  const authenticMatches = [
    {
      name: "Rachel Kim",
      verificationScore: 98,
      badges: ["ID Verified", "Photo Verified", "Background Clear"],
      trustLevel: "Diamond Verified"
    },
    {
      name: "Marcus Johnson",
      verificationScore: 94,
      badges: ["ID Verified", "Photo Verified", "Social Verified"],
      trustLevel: "Gold Verified"
    }
  ];

  const runVerification = () => {
    setIsVerifying(true);
    toast({
      title: "Enhanced Verification Started",
      description: "Running comprehensive authenticity checks...",
    });

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationLevel(95);
      toast({
        title: "Verification Complete",
        description: "Your authenticity score has been updated!",
      });
    }, 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-green-600" />
            AuthentiDate
          </h2>
          <p className="text-gray-600">Authenticity & Safety through AI verification</p>
        </div>
        <Button onClick={runVerification} disabled={isVerifying} className="bg-green-600 hover:bg-green-700">
          {isVerifying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verifying...
            </>
          ) : (
            <>
              <Verified className="h-4 w-4 mr-2" />
              Enhanced Verification
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Your Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{verificationLevel}%</div>
              <Badge className="bg-green-100 text-green-800">Highly Trusted</Badge>
            </div>
            <Progress value={verificationLevel} className="h-3" />
            
            <div className="space-y-3">
              {verificationChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{check.check}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{check.score}%</span>
                    {check.status === "verified" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Safety Features</CardTitle>
            <CardDescription>AI-powered protection systems</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{feature.feature}</h4>
                  <Badge variant="outline" className="text-xs border-green-300">Active</Badge>
                </div>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Verified Matches</CardTitle>
            <CardDescription>Highly authenticated profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authenticMatches.map((match, index) => (
              <div key={index} className="border border-green-200 rounded-lg p-3 bg-green-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{match.name}</h4>
                  <Badge className="bg-green-600">{match.verificationScore}%</Badge>
                </div>
                <p className="text-sm font-medium text-green-700 mb-2">{match.trustLevel}</p>
                <div className="flex flex-wrap gap-1">
                  {match.badges.map((badge, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-green-300">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthentiDate;
