import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Crown, Briefcase, Coffee, Shield, Sparkles, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Logo from '@/components/ui/logo';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fix: Move navigation to useEffect to prevent render-time navigation
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="lg" showText={true} />
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <Button variant="ghost" onClick={() => navigate("/how-it-works")} className="text-white hover:bg-white/10">
                  How It Works
                </Button>
                <Button variant="ghost" onClick={() => navigate("/safety")} className="text-white hover:bg-white/10">
                  Safety
                </Button>
                <Button variant="ghost" onClick={() => navigate("/legal")} className="text-white hover:bg-white/10">
                  Legal
                </Button>
                <Button variant="ghost" onClick={() => navigate("/success-stories")} className="text-white hover:bg-white/10">
                  Success Stories
                </Button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => navigate("/auth")} variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white">
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-white mb-6">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Executive Match</span> ✨
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-powered connections for C-suite executives and senior professionals. Premium matching for those who demand excellence in life and love.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg px-8 py-4 text-lg">
              Start Your Journey
            </Button>
          </div>
        </div>

        {/* Executive Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-white mb-2">500+</div>
            <div className="text-purple-300">C-Suite Executives</div>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-white mb-2">94%</div>
            <div className="text-blue-300">Compatibility Rate</div>
          </div>
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-white mb-2">$500K+</div>
            <div className="text-green-300">Average Income</div>
          </div>
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-white mb-2">89%</div>
            <div className="text-orange-300">Success Rate</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 text-center hover:scale-105 transition-all">
            <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">Executive Verified</h3>
            <p className="text-gray-300">Comprehensive background checks, company verification, and identity validation for C-suite professionals.</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 text-center hover:scale-105 transition-all">
            <Briefcase className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">AI-Powered Matching</h3>
            <p className="text-gray-300">Advanced algorithms analyze professional compatibility, leadership styles, and lifestyle preferences.</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 text-center hover:scale-105 transition-all">
            <Coffee className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">Concierge Service</h3>
            <p className="text-gray-300">White-glove meeting coordination, restaurant reservations, and travel arrangement assistance.</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-6">How It Works</h2>
          <p className="text-xl text-gray-300 mb-12">Simple, secure, and sophisticated matching for executives</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">1. Verify Your Executive Status</h3>
            <p className="text-gray-300">Complete our comprehensive verification process including company authentication and background checks.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">2. AI Creates Your Matches</h3>
            <p className="text-gray-300">Our advanced AI analyzes professional compatibility, values, and lifestyle to find your perfect executive match.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">3. Premium Meeting Experience</h3>
            <p className="text-gray-300">Enjoy white-glove concierge service for scheduling, venues, and coordination of executive-level meetings.</p>
          </div>
        </div>

        {/* Premium Membership CTA */}
        <div className="bg-gradient-to-r from-yellow-600/10 via-orange-600/10 to-red-600/10 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-12 text-center">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Find Your Executive Match?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the most exclusive network of verified C-suite executives and senior professionals seeking meaningful connections.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-12 py-4 text-xl font-bold">
            Apply for Membership
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;