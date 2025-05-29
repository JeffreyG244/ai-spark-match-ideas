
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Brain, MessageCircle, TrendingUp, Zap, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI Compatibility Predictor",
      description: "Advanced algorithms analyze thousands of data points to predict relationship success with 94% accuracy.",
      badge: "94% Accuracy"
    },
    {
      icon: MessageCircle,
      title: "Voice Pattern Matching",
      description: "Revolutionary voice analysis technology matches you based on vocal compatibility and communication style.",
      badge: "Voice AI"
    },
    {
      icon: Users,
      title: "Personality Mirror Analysis",
      description: "Deep personality profiling using Big Five model with complementary and similar matching options.",
      badge: "Deep Learning"
    },
    {
      icon: Heart,
      title: "Emotional Intelligence AI",
      description: "Assess emotional maturity and compatibility through conversation analysis and behavioral patterns.",
      badge: "EQ Analysis"
    },
    {
      icon: TrendingUp,
      title: "Relationship Success Predictor",
      description: "Timeline predictions for short-term and long-term relationship success based on compatibility factors.",
      badge: "Predictive"
    },
    {
      icon: Zap,
      title: "Real-time Learning",
      description: "AI continuously learns from your interactions to improve match quality and compatibility accuracy.",
      badge: "Adaptive"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-sm font-medium">
              🚀 Next-Generation AI Dating
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect Match with
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"> AI Intelligence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the future of dating with advanced AI that understands compatibility at the deepest level. 
            Our revolutionary algorithms analyze personality, voice patterns, and emotional intelligence for meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
              onClick={() => navigate('/dashboard')}
            >
              Start AI Matching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <feature.icon className="h-8 w-8 text-purple-600" />
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powered by Advanced AI</h2>
            <p className="text-gray-600 text-lg">Our technology delivers results that speak for themselves</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">94%</div>
              <div className="text-gray-600">Compatibility Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">87%</div>
              <div className="text-gray-600">Long-term Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">50K+</div>
              <div className="text-gray-600">Successful Matches</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2.3x</div>
              <div className="text-gray-600">Faster Connections</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Find Your Perfect Match?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands who've found meaningful relationships through AI-powered matching</p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-12 py-4 text-xl"
            onClick={() => navigate('/dashboard')}
          >
            Get Started Now
            <Heart className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
