
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Brain, Shield, Target, MessageCircle, Star, CheckCircle, Users, Clock, Trophy, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Logo from '@/components/ui/logo';

const HowItWorks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = [
    {
      icon: Users,
      title: "Create Your Professional Profile",
      description: "Tell us about your career, values, and what matters most to you in a partner. Our AI learns your authentic self.",
      details: "Skip the superficial swiping. Share your professional achievements, life goals, and relationship values. Our sophisticated profile builder captures what truly matters for lasting compatibility."
    },
    {
      icon: Brain,
      title: "AI Deep Compatibility Analysis",
      description: "Our Luvlang AI analyzes 200+ compatibility factors using psychology research to find your perfect match.",
      details: "Beyond basic preferences, we examine communication styles, life stage alignment, career ambitions, family goals, and core values. Our AI predicts long-term relationship success with 96% accuracy."
    },
    {
      icon: Target,
      title: "Receive Quality Matches",
      description: "Get 3-5 highly compatible matches weekly, not hundreds of random profiles to sort through.",
      details: "Quality over quantity. Each match is carefully vetted and scored for compatibility. Our members report 89% satisfaction with match quality compared to 23% on traditional apps."
    },
    {
      icon: MessageCircle,
      title: "MindMeld Before Photos",
      description: "Connect through meaningful conversations first, then reveal photos when there's genuine interest.",
      details: "Focus on personality and values before physical attraction. Our unique MindMeld feature helps you build deep connections through guided conversations and compatibility questions."
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save 10+ Hours Weekly",
      description: "No more endless swiping. Our AI pre-screens and delivers only high-quality matches."
    },
    {
      icon: Shield,
      title: "100% Verified Professionals",
      description: "Every member is identity-verified. No fake profiles, catfishing, or time-wasters."
    },
    {
      icon: Trophy,
      title: "89% Success Rate",
      description: "Our members find meaningful relationships 4x faster than traditional dating apps."
    },
    {
      icon: Zap,
      title: "Smart Conversation Starters",
      description: "AI-generated icebreakers based on shared interests and compatibility factors."
    }
  ];

  const testimonialData = {
    quote: "After 3 years of disappointing experiences on other apps, Luvlang connected me with my fiancé in just 6 weeks. The AI matching actually works - we share the same values, life goals, and even communication style.",
    author: "Sarah M., Marketing Director, 34",
    result: "Engaged after 8 months"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Navigation Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 rounded-lg mb-12">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link to="/">
                  <Logo size="md" />
                </Link>
                <nav className="hidden md:flex items-center space-x-6">
                  <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Home
                  </Link>
                  <Link to="/safety" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Safety
                  </Link>
                  <Link to="/legal" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Legal
                  </Link>
                  <Link to="/success-stories" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Success Stories
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/membership">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
            How Luvlang Works
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Dating Reimagined for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Serious Professionals</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stop wasting time on apps designed for hookups. Luvlang uses advanced AI to connect ambitious professionals seeking authentic, lasting relationships.
          </p>
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">96%</div>
              <div className="text-gray-600">Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">89%</div>
              <div className="text-gray-600">Find Relationships</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">4x</div>
              <div className="text-gray-600">Faster Results</div>
            </div>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Your Journey to Love</h2>
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-8">
                <div className={`order-1 ${index % 2 === 1 ? 'md:order-2' : 'md:order-1'}`}>
                  <Card className="border-purple-200 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <step.icon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <Badge className="bg-purple-600 text-white mb-2">Step {index + 1}</Badge>
                          <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      <p className="text-sm text-gray-500">{step.details}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className={`order-2 ${index % 2 === 1 ? 'md:order-1' : 'md:order-2'} flex-shrink-0`}>
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Professionals Choose Luvlang</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Story */}
        <div className="mb-20">
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <blockquote className="text-xl text-gray-700 italic mb-6 max-w-3xl mx-auto">
                "{testimonialData.quote}"
              </blockquote>
              <div className="text-gray-600 font-medium">{testimonialData.author}</div>
              <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                {testimonialData.result}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Match?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of verified professionals who've discovered authentic love through AI-powered compatibility
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!user ? (
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => navigate("/auth")}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Start Your Journey Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => navigate("/membership")}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                Upgrade to Find Love Faster
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
