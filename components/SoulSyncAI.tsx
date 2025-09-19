
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, AlertTriangle, CheckCircle, Eye, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const SoulSyncAI = () => {
  const [safetyActive, setSafetyActive] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const safetyFeatures = [
    { feature: "Profile Verification", status: "Active", score: 98 },
    { feature: "Background Check", status: "Verified", score: 95 },
    { feature: "Behavioral Analysis", status: "Monitoring", score: 92 },
    { feature: "Photo Authenticity", status: "Verified", score: 100 },
    { feature: "Communication Safety", status: "Protected", score: 96 }
  ];

  const safetyAlerts = [
    {
      type: "Verified Match",
      name: "Sarah Chen",
      level: "Trusted",
      details: "Full verification completed, clean background check"
    },
    {
      type: "Safety Alert",
      name: "Anonymous User",
      level: "Caution",
      details: "Incomplete verification - proceed with standard safety protocols"
    }
  ];

  const activateSafetyGuard = () => {
    setIsScanning(true);
    toast({
      title: "Personal Safety Guard Activated",
      description: "Conducting comprehensive safety analysis of your connections...",
    });

    setTimeout(() => {
      setIsScanning(false);
      setSafetyActive(true);
      toast({
        title: "Safety Analysis Complete",
        description: "Your connections have been verified and safety protocols are active!",
      });
    }, 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            Personal Safety Guard
          </h2>
          <p className="text-gray-600">Advanced protection for your dating experience</p>
        </div>
        <Button onClick={activateSafetyGuard} disabled={isScanning} className="bg-emerald-600 hover:bg-emerald-700">
          {isScanning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Scanning Safety...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Activate Safety Guard
            </>
          )}
        </Button>
      </div>

      {safetyActive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Safety Status Monitor</CardTitle>
              <CardDescription>Real-time protection metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {safetyFeatures.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-sm">{item.feature}</p>
                      <p className="text-xs text-gray-600">{item.status}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white">{item.score}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">Safety Alerts & Verifications</CardTitle>
              <CardDescription>Current safety status of your connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {safetyAlerts.map((alert, index) => (
                <div key={index} className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm">{alert.name}</h4>
                    <Badge className={alert.level === "Trusted" ? "bg-emerald-600" : "bg-amber-500"}>
                      {alert.level}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-emerald-700 mb-2 flex items-center gap-2">
                    {alert.level === "Trusted" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    {alert.type}
                  </p>
                  <p className="text-xs text-gray-600">{alert.details}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="text-xs border-emerald-300">
                      <Eye className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-emerald-300">
                      <Lock className="h-3 w-3 mr-1" />
                      Safety Options
                    </Button>
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

export default SoulSyncAI;
