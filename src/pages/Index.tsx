
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Brain, Shield, Target, MessageCircle, Star, CheckCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "SoulSync AI Matching",
      description: "Deep personality and values alignment using advanced AI psychology models"
    },
    {
      icon: Shield,
      title: "AuthentiDate Security",
      description: "Mandatory verification and AI-powered safety scanning for authentic connections"
    },
    {
      icon: Target,
      title: "LifeStage Alignment",
      description: "Match with people who share your timeline and life goals"
    },
    {
      icon: MessageCircle,
      title: "MindMeld First",
      description: "Text-based connections before photos - meaningful conversations first"
    }
  ];

  const stats = [
    { number: "96%", label: "Compatibility Accuracy" },
    { number: "89%", label: "Long-term Success Rate" },
    { number: "30-45", label: "Target Age Range" },
    { number: "100%", label: "Verified Profiles" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SoulSync</h1>
          </div>
          <Button onClick={() => navigate("/dashboard")} className="bg-purple-600 hover:bg-purple-700">
            Enter Dashboard
          </Button>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Soul Match</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered deep connections for serious professionals (30-45). No swiping, no games - just authentic, meaningful relationships built on compatibility.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="bg-purple-600 hover:bg-purple-700">
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline">
              How It Works
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-purple-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">How SoulSync Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Build Your Authentic Profile</h3>
              <p className="text-gray-600">Use our AI-guided Build-A-Match system to create a profile that attracts your ideal partner</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Deep Matching</h3>
              <p className="text-gray-600">Our SoulSync AI analyzes personality, values, and life goals for profound compatibility</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. MindMeld Conversations</h3>
              <p className="text-gray-600">Connect through meaningful text conversations before photos - depth before attraction</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Soul Match?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of professionals who've found meaningful love through AI</p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/dashboard")}>
            Start Matching Today
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
