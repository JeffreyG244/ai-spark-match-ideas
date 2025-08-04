import React from 'react';
import { 
  Heart, 
  Shield, 
  Target, 
  Coffee, 
  Sparkles, 
  Bell, 
  Settings,
  Briefcase,
  Building,
  Award,
  MessageCircle,
  Calendar,
  Verified
} from 'lucide-react';

const Crown = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 4l5.5 5L12 4l3.5 5L21 4l-2 12H5zm2.7-2h8.6l.9-5.4-2.1 1.7L12 8l-3.1 2.3-2.1-1.7L6.7 14z"/>
  </svg>
);

const LuvlangPreview = () => {
  const mockMatch = {
    name: "Sarah Chen",
    title: "VP of Marketing", 
    company: "Microsoft",
    score: 94,
    image: "/api/placeholder/120/120",
    badges: ["Industry Leader", "Mentor"],
    verifications: ["LinkedIn", "Company"]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Luvlang</h1>
                <p className="text-purple-300 text-sm">Executive Dating Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-xl px-4 py-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Executive Verified</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-xl px-4 py-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">C-Suite Premium</span>
              </div>
              
              <button className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all">
                <Bell className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              <button className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Executive</span>
          </h2>
          <p className="text-xl text-gray-300">Your AI-powered executive connections await</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-300 text-sm font-medium">Premium Matches</p>
                <p className="text-3xl font-bold text-white">24</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-300 text-sm font-medium">AI Compatibility</p>
                <p className="text-3xl font-bold text-white">94%</p>
              </div>
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-300 text-sm font-medium">Executive Meetings</p>
                <p className="text-3xl font-bold text-white">8</p>
              </div>
              <Coffee className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-orange-300 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-white">89%</p>
              </div>
              <Award className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Sample Executive Match Card */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Executive Match Preview</h3>
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-8 max-w-2xl">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <img 
                  src={mockMatch.image} 
                  alt={mockMatch.name}
                  className="w-28 h-28 rounded-2xl object-cover border-3 border-purple-500/50 shadow-lg"
                />
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-2 shadow-lg">
                  <Verified className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1 shadow-lg">
                  <span className="text-white font-bold text-sm">{mockMatch.score}%</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-white mb-3">{mockMatch.name}</h4>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 font-medium">{mockMatch.title}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">{mockMatch.company}</span>
                  </div>
                </div>
                
                {/* Verification Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {mockMatch.verifications.map((verification, idx) => (
                    <span key={idx} className="bg-green-600/30 border border-green-500/50 text-green-300 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>{verification}</span>
                    </span>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Message</span>
                  </button>
                  <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Schedule</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Matching CTA */}
        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Advanced AI Executive Matching</h3>
          <p className="text-gray-300 text-lg mb-6 max-w-3xl mx-auto">
            Our quantum-powered algorithm analyzes 500+ professional compatibility factors to find your perfect executive match.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-16 py-5 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl">
            Discover Executive Matches
          </button>
        </div>
      </div>
    </div>
  );
};

export default LuvlangPreview;