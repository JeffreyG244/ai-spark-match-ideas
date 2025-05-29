
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, MessageCircle, Brain, Zap, Users, TrendingUp, Shield, Target, CheckCircle, Star } from "lucide-react";
import AIMatchingEngine from "@/components/AIMatchingEngine";
import PersonalityAnalysis from "@/components/PersonalityAnalysis";
import VoiceCompatibility from "@/components/VoiceCompatibility";
import CompatibilityPredictor from "@/components/CompatibilityPredictor";
import SoulSyncAI from "@/components/SoulSyncAI";
import AuthentiDate from "@/components/AuthentiDate";
import LifeStageMatch from "@/components/LifeStageMatch";
import MindMeld from "@/components/MindMeld";
import ProfileBuilder from "@/components/ProfileBuilder";
import SafetyScanner from "@/components/SafetyScanner";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("profile-builder");

  const coreFeatures = [
    {
      title: "SoulSync Core Matching",
      description: "Deep personality & values alignment",
      icon: Brain,
      accuracy: 96,
      status: "active",
      priority: "core"
    },
    {
      title: "AuthentiDate Verification",
      description: "Mandatory safety & authenticity checks",
      icon: Shield,
      accuracy: 98,
      status: "active",
      priority: "core"
    },
    {
      title: "LifeStage Alignment",
      description: "Goals & timeline compatibility",
      icon: Target,
      accuracy: 92,
      status: "active",
      priority: "core"
    },
    {
      title: "MindMeld Connection",
      description: "Text-first meaningful conversations",
      icon: MessageCircle,
      accuracy: 94,
      status: "active",
      priority: "core"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Heart className="h-7 w-7 text-white" />
            </div>
            SoulSync
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered deep connections for serious professionals (30-45yo)
          </p>
        </div>

        {/* Core Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-purple-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <feature.icon className="h-8 w-8 text-purple-600" />
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {feature.accuracy}%
                    </Badge>
                    {feature.priority === "core" && (
                      <Badge className="text-xs bg-purple-600">Core</Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={feature.accuracy} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Navigation */}
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { id: "profile-builder", label: "Build-A-Match Profile", icon: Star },
            { id: "soulsync", label: "SoulSync Core", icon: Brain },
            { id: "safety", label: "Safety Scanner", icon: Shield },
            { id: "mindmeld", label: "MindMeld", icon: MessageCircle },
            { id: "lifestage", label: "LifeStage Match", icon: Target },
            { id: "matches", label: "Smart Matches", icon: Heart },
            { id: "authentidate", label: "AuthentiDate", icon: CheckCircle }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeTab === "profile-builder" && <ProfileBuilder />}
          {activeTab === "soulsync" && <SoulSyncAI />}
          {activeTab === "safety" && <SafetyScanner />}
          {activeTab === "mindmeld" && <MindMeld />}
          {activeTab === "lifestage" && <LifeStageMatch />}
          {activeTab === "matches" && <AIMatchingEngine />}
          {activeTab === "authentidate" && <AuthentiDate />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
