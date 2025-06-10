import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Brain, Shield, Target, MessageCircle, Star, CheckCircle, Users, Lock, Quote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: "Luvlang AI Matching",
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

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      comment: "After years of endless swiping and superficial matches on other apps, Luvlang was a breath of fresh air. The AI matching actually works - I met my partner through deep compatibility, not just looks."
    },
    {
      name: "Michael Rodriguez",
      role: "Software Engineer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      comment: "Other dating apps felt like a game where no one was serious. Luvlang's verification process and focus on values meant I could trust that people were genuinely looking for meaningful relationships."
    },
    {
      name: "Emma Thompson",
      role: "Financial Analyst",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      comment: "I was so tired of small talk and ghosting on traditional apps. The MindMeld feature helped me connect with someone who actually shared my life goals before we even exchanged photos."
    },
    {
      name: "David Park",
      role: "Product Manager",
      image: "https://images.unsplash.com/photo-1507003211169-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      comment: "The security features gave me confidence that wasn't possible on other platforms. No fake profiles, no scammers - just real professionals looking for authentic connections."
    },
    {
      name: "Jessica Williams",
      role: "UX Designer",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      comment: "Finally, a dating platform that understands quality over quantity. Instead of hundreds of meaningless matches, I got 3 highly compatible connections that led to real relationships."
    },
    {
      name: "James Foster",
      role: "Consultant",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      comment: "Luvlang solved the biggest problem with modern dating - authenticity. The personality analysis meant I could skip the games and connect with someone who truly understood me."
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Luvlang</h1>
          </div>
          <div className="flex gap-3">
            {!user && (
              <>
                <Button onClick={() => navigate("/auth")} variant="outline">
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")} className="bg-purple-600 hover:bg-purple-700">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Security Notice */}
        {!user && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Enterprise Security Enabled</h3>
                <p className="text-sm text-green-600">
                  Your data is protected with Supabase authentication, Row Level Security, and end-to-end encryption
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Soul Match</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered deep connections for serious professionals. No swiping, no games - just authentic, meaningful relationships built on compatibility.
          </p>
          <div className="flex gap-4 justify-center">
            {!user && (
              <>
                <Button size="lg" onClick={() => navigate("/auth")} className="bg-purple-600 hover:bg-purple-700">
                  Start Your Journey
                </Button>
                <Button size="lg" variant="outline">
                  How It Works
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Free Account Call-to-Action */}
        {!user && (
          <div className="mb-20 bg-white rounded-2xl p-8 shadow-lg border border-purple-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Your Free Account Today</h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of verified professionals who've discovered authentic love beyond superficial swiping. 
                Your perfect match is waiting - and it's completely free to start.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" onClick={() => navigate("/auth")} className="bg-purple-600 hover:bg-purple-700 px-8">
                  Create Free Account
                </Button>
                <p className="text-sm text-gray-500">No credit card required • 2-minute setup</p>
              </div>
            </div>
          </div>
        )}

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
          <h2 className="text-4xl font-bold text-gray-900 mb-12">How Luvlang Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Create Secure Profile</h3>
              <p className="text-gray-600">Use our secure profile builder with database protection and content validation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Deep Matching</h3>
              <p className="text-gray-600">Our Luvlang AI analyzes personality, values, and life goals for profound compatibility</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Secure Connections</h3>
              <p className="text-gray-600">Connect through verified, secure messaging with privacy protection</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Real professionals who found authentic love beyond the superficial swipe culture</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Quote className="h-8 w-8 text-purple-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 italic leading-relaxed">
                      {index === 0 ? "After years of endless swiping and superficial matches on other apps, Luvlang was a breath of fresh air. The AI matching actually works - I met my partner through deep compatibility, not just looks." :
                       index === 1 ? "Other dating apps felt like a game where no one was serious. Luvlang's verification process and focus on values meant I could trust that people were genuinely looking for meaningful relationships." :
                       index === 4 ? "Finally, a dating platform that understands quality over quantity. Instead of hundreds of meaningless matches, I got 3 highly compatible connections that led to real relationships." :
                       index === 5 ? "Luvlang solved the biggest problem with modern dating - authenticity. The personality analysis meant I could skip the games and connect with someone who truly understood me." :
                       testimonial.comment}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Soul Match?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of professionals who've found meaningful love through secure AI matching</p>
          {!user && (
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
              Start Matching Today
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
