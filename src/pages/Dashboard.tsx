
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, MessageCircle, Brain, Zap, Users, TrendingUp, Shield, Target } from "lucide-react";
import AIMatchingEngine from "@/components/AIMatchingEngine";
import PersonalityAnalysis from "@/components/PersonalityAnalysis";
import VoiceCompatibility from "@/components/VoiceCompatibility";
import CompatibilityPredictor from "@/components/CompatibilityPredictor";
import SoulSyncAI from "@/components/SoulSyncAI";
import AuthentiDate from "@/components/AuthentiDate";
import LifeStageMatch from "@/components/LifeStageMatch";
import MindMeld from "@/components/MindMeld";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("matches");

  const aiFeatures = [
    {
      title: "AI Compatibility Predictor",
      description: "Advanced algorithms predict relationship success",
      icon: Brain,
      accuracy: 94,
      status: "active"
    },
    {
      title: "Voice Pattern Analysis",
      description: "Match based on vocal compatibility",
      icon: MessageCircle,
      accuracy: 87,
      status: "active"
    },
    {
      title: "Personality Mirror Matching",
      description: "Deep personality analysis for better matches",
      icon: Users,
      accuracy: 91,
      status: "active"
    },
    {
      title: "Emotional Intelligence AI",
      description: "Assess emotional maturity and compatibility",
      icon: Heart,
      accuracy: 89,
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Dating Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Powered by advanced AI for smarter, more meaningful connections
          </p>
        </div>

        {/* AI Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {aiFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <feature.icon className="h-8 w-8 text-purple-600" />
                  <Badge variant="secondary" className="text-xs">
                    {feature.accuracy}% accuracy
                  </Badge>
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

        {/* Main Content Tabs */}
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { id: "matches", label: "AI Matches", icon: Heart },
            { id: "personality", label: "Personality Analysis", icon: Brain },
            { id: "voice", label: "Voice Compatibility", icon: MessageCircle },
            { id: "predictor", label: "Compatibility Predictor", icon: TrendingUp },
            { id: "soulsync", label: "SoulSync AI", icon: Brain },
            { id: "authentidate", label: "AuthentiDate", icon: Shield },
            { id: "lifestage", label: "LifeStage Match", icon: Target },
            { id: "mindmeld", label: "MindMeld", icon: Zap }
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
          {activeTab === "matches" && <AIMatchingEngine />}
          {activeTab === "personality" && <PersonalityAnalysis />}
          {activeTab === "voice" && <VoiceCompatibility />}
          {activeTab === "predictor" && <CompatibilityPredictor />}
          {activeTab === "soulsync" && <SoulSyncAI />}
          {activeTab === "authentidate" && <AuthentiDate />}
          {activeTab === "lifestage" && <LifeStageMatch />}
          {activeTab === "mindmeld" && <MindMeld />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
