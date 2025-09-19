
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, Brain, ArrowLeft, Star, MessageCircle, Calendar, Shield, Crown, 
  Verified, Trophy, Briefcase, Bell, Settings, Search, Filter, Trash2, 
  AlertTriangle, X, Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompatibilityAnswers } from '@/hooks/useCompatibilityAnswers';
import { useProfileData } from '@/hooks/useProfileData';
import { useMatches } from '@/hooks/useMatches';
import CompatibilityScore from '@/components/discover/CompatibilityScore';
import Logo from '@/components/ui/logo';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Matches = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { questionAnswers, loadCompatibilityAnswers } = useCompatibilityAnswers();
  const { profileData, loadProfile } = useProfileData();
  const { matches, isLoading: matchesLoading, loadMatches, deleteMatch } = useMatches();
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deletingMatch, setDeletingMatch] = useState<string | null>(null);

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

  // Gender normalization and name correction function
  const normalizeProfile = (profile: any) => {
    const firstName = profile.first_name || profile.email?.split('@')[0] || 'User';
    const gender = profile.gender?.toLowerCase() || '';
    
    // Common male names
    const maleNames = ['marcus', 'david', 'alex', 'jordan', 'sam', 'carlos', 'james', 'john', 'michael', 'robert', 'william', 'richard', 'charles', 'joseph', 'thomas', 'christopher', 'daniel', 'paul', 'mark', 'donald', 'steven', 'matthew', 'anthony', 'joshua', 'kenneth', 'kevin', 'brian', 'george', 'timothy', 'ronald', 'jason', 'edward', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'gregory', 'alexander', 'patrick', 'frank', 'raymond', 'jack', 'dennis', 'jerry', 'tyler', 'aaron'];
    
    // Common female names
    const femaleNames = ['riley', 'taylor', 'maya', 'aisha', 'sarah', 'jennifer', 'lisa', 'nancy', 'karen', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth', 'sharon', 'michelle', 'laura', 'sarah', 'kimberly', 'deborah', 'dorothy', 'amy', 'angela', 'ashley', 'brenda', 'emma', 'olivia', 'cynthia', 'marie', 'janet', 'catherine', 'frances', 'christine', 'samantha', 'debra', 'rachel', 'carolyn', 'janet', 'virginia', 'maria', 'heather', 'diane', 'julie', 'joyce', 'victoria', 'kelly', 'christina', 'joan', 'evelyn', 'lauren', 'judith', 'megan', 'cheryl', 'andrea', 'anna', 'jean', 'alice'];
    
    // Determine correct gender based on name if gender is incorrect or missing
    let correctedGender = gender;
    const lowerFirstName = firstName.toLowerCase();
    
    if (maleNames.includes(lowerFirstName) && (!gender || gender.includes('female') || gender.includes('woman'))) {
      correctedGender = 'male';
    } else if (femaleNames.includes(lowerFirstName) && (!gender || gender.includes('male') || gender.includes('man'))) {
      correctedGender = 'female';
    }
    
    return {
      ...profile,
      first_name: firstName,
      gender: correctedGender
    };
  };

  // Secure delete function with confirmation
  const handleDeleteMatch = async (matchId: string, matchedUserName: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to delete matches',
        variant: 'destructive'
      });
      return;
    }

    setDeletingMatch(matchId);
    
    try {
      const success = await deleteMatch(matchId);
      
      if (success) {
        toast({
          title: 'Match Deleted',
          description: `Successfully removed match with ${matchedUserName}`,
          variant: 'default'
        });
        setShowDeleteConfirm(null);
      } else {
        toast({
          title: 'Delete Failed',
          description: 'Unable to delete match. Please try again.',
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the match',
        variant: 'destructive'
      });
    } finally {
      setDeletingMatch(null);
    }
  };

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
              <Logo size="lg" showText={false} />
              <div>
                <h1 className="text-3xl font-bold text-white">Your Matches</h1>
                <p className="text-purple-300 text-sm">Executive professionals who liked you back</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-xl px-4 py-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Basic</span>
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
            <div className="w-96 h-96 mx-auto mb-8 flex items-center justify-center">
              <Logo size="lg" showText={true} />
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
              const rawProfile = match.match_profile;
              if (!rawProfile) return null;

              // Apply gender normalization and name correction
              const profile = normalizeProfile(rawProfile);
              const firstName = profile.first_name;
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
                    <button
                      onClick={() => setShowDeleteConfirm(match.id)}
                      className="absolute top-3 right-12 bg-red-500/90 backdrop-blur-sm rounded-full p-2 hover:bg-red-600/90 transition-all"
                      title="Delete Match"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800/95 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 w-96 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-500/20 rounded-full p-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Delete Match</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this match? This action cannot be undone and will permanently remove the connection.
            </p>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Security Notice</span>
              </div>
              <p className="text-red-300 text-xs mt-1">
                This will remove all conversation history and cannot be recovered.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingMatch === showDeleteConfirm}
                className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={() => {
                  const match = matches.find(m => m.id === showDeleteConfirm);
                  if (match) {
                    const name = match.match_profile?.first_name || 'User';
                    handleDeleteMatch(showDeleteConfirm, name);
                  }
                }}
                disabled={deletingMatch === showDeleteConfirm}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {deletingMatch === showDeleteConfirm ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
