
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, Brain, ArrowLeft, Star, MessageCircle, Calendar, Shield, Crown, 
  Verified, Trophy, Briefcase, Bell, Settings, Search, Filter 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompatibilityAnswers } from '@/hooks/useCompatibilityAnswers';
import { useProfileData } from '@/hooks/useProfileData';
import { useMatches } from '@/hooks/useMatches';
import CompatibilityScore from '@/components/discover/CompatibilityScore';
import Logo from '@/components/ui/logo';

const Matches = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { questionAnswers, loadCompatibilityAnswers } = useCompatibilityAnswers();
  const { profileData, loadProfile } = useProfileData();
  const { matches, isLoading: matchesLoading, loadMatches } = useMatches();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCompatibilityAnswers();
      loadProfile();
      loadMatches();
    }
  }, [user]);

  useEffect(() => {
    if (!matchesLoading) {
      setIsLoading(false);
    }
  }, [matchesLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <span className="text-purple-300">Loading your matches...</span>
        </div>
      </div>
    );
  }

  const avgCompatibility = matches.length > 0 
    ? Math.round(matches.reduce((acc, match) => acc + match.compatibility, 0) / matches.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <Logo size="md" showText={false} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Your Matches</h1>
                <p className="text-purple-300 text-sm">Executive professionals who liked you back</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-xl px-4 py-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Executive</span>
              </div>
              
              <button className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all">
                <Filter className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Match Summary */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="h-6 w-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Executive Match Statistics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {Object.keys(questionAnswers).length}
              </div>
              <div className="text-sm text-gray-400">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {matches.length}
              </div>
              <div className="text-sm text-gray-400">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {avgCompatibility}%
              </div>
              <div className="text-sm text-gray-400">Avg Compatibility</div>
            </div>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Logo size="lg" showText={false} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Executive Matches Yet</h3>
            <p className="text-gray-400 mb-8">
              Keep discovering to find professionals who appreciate your leadership qualities!
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/discover">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-all">
                  Start Discovering
                </button>
              </Link>
              <Link to="/daily-matches">
                <button className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-700/50 transition-all">
                  <Calendar className="h-4 w-4 mr-2 inline" />
                  View Daily Matches
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const profile = match.match_profile;
              if (!profile) return null;

              const firstName = profile.first_name || profile.email.split('@')[0] || 'User';
              const age = profile.age ? `, ${profile.age}` : '';
              const photo = profile.photos && profile.photos.length > 0 
                ? profile.photos[0] 
                : 'https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60';

              return (
                <div key={match.id} className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-gray-600/30 rounded-2xl overflow-hidden hover:scale-105 transition-all">
                  <div className="relative">
                    <img 
                      src={photo}
                      alt={firstName}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60";
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm rounded-full p-2">
                      <Verified className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1">
                      <span className="text-white font-bold text-sm">{match.compatibility}% Match</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xl font-bold text-white">{firstName}{age}</h4>
                      <div className="flex items-center space-x-1 bg-green-500/20 border border-green-500/30 rounded-full px-2 py-1">
                        <Heart className="h-3 w-3 text-green-400 fill-current" />
                        <span className="text-green-400 text-xs font-medium">Match!</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {profile.bio || 'Executive professional seeking meaningful connections'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>Matched {new Date(match.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400">Executive</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold hover:scale-105 transition-all">
                        <MessageCircle className="w-4 h-4 mr-1 inline" />
                        Message
                      </button>
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg font-semibold hover:scale-105 transition-all">
                        <Briefcase className="w-4 h-4 mr-1 inline" />
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Matches;
