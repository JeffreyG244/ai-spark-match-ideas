
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, RefreshCw, Heart, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDailyMatches } from '@/hooks/useDailyMatches';
import { AnimatePresence } from 'framer-motion';
import SwipeableDailyMatch from '@/components/discover/SwipeableDailyMatch';
import NavigationTabs from '@/components/navigation/NavigationTabs';

const DailyMatches = () => {
  const { user, signOut } = useAuth();
  const { 
    dailyMatches, 
    isLoading, 
    loadDailyMatches, 
    generateDailyMatches, 
    markAsViewed 
  } = useDailyMatches();
  
  const hasGeneratedMatches = useRef(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [swipedMatches, setSwipedMatches] = useState<string[]>([]);

  useEffect(() => {
    if (user && !hasGeneratedMatches.current && dailyMatches.length === 0 && !isLoading) {
      console.log('Generating daily matches for user:', user.id);
      hasGeneratedMatches.current = true;
      generateDailyMatches();
    }
  }, [user, dailyMatches.length, isLoading, generateDailyMatches]);

  const handleSwipe = (direction: 'like' | 'pass') => {
    const currentMatch = dailyMatches[currentMatchIndex];
    if (currentMatch) {
      markAsViewed(currentMatch.id);
      setSwipedMatches(prev => [...prev, currentMatch.id]);
      setCurrentMatchIndex(prev => prev + 1);
    }
  };

  const handleRefreshMatches = () => {
    hasGeneratedMatches.current = false;
    setCurrentMatchIndex(0);
    setSwipedMatches([]);
    generateDailyMatches();
  };

  const availableMatches = dailyMatches.filter(match => !swipedMatches.includes(match.id));
  const currentMatch = availableMatches[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your daily matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <button className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              </Link>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Daily Picks</h1>
                <p className="text-purple-300 text-sm">Curated executive matches</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-xl px-4 py-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Executive Verified</span>
              </div>
              
              <button 
                onClick={signOut}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Daily Picks</h1>
              <p className="text-gray-600">Curated matches based on your compatibility score</p>
            </div>
            <Button 
              onClick={handleRefreshMatches}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Matches
            </Button>
          </div>
        </div>

        {availableMatches.length === 0 ? (
          <Card className="border-purple-200 text-center py-12">
            <CardContent>
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Daily Matches Yet</h3>
              <p className="text-gray-600 mb-6">
                Complete your profile to get personalized daily match suggestions
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/dashboard">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Complete Profile
                  </Button>
                </Link>
                <Button 
                  onClick={handleRefreshMatches}
                  variant="outline"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Generate Matches
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Card */}
            <Card className="border-purple-200 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Today's Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {dailyMatches.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {availableMatches.length}
                    </div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {swipedMatches.length}
                    </div>
                    <div className="text-sm text-gray-600">Viewed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Swipeable Match Card */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                {currentMatch ? (
                  <div className="relative">
                    <p className="text-center text-sm text-gray-600 mb-4">
                      Swipe left to pass, right to like!
                    </p>
                    <AnimatePresence mode="wait">
                      <SwipeableDailyMatch
                        key={currentMatch.id}
                        match={currentMatch}
                        onSwipe={handleSwipe}
                      />
                    </AnimatePresence>
                  </div>
                ) : (
                  <Card className="border-purple-200 text-center py-16">
                    <CardContent className="space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                        <Heart className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">All caught up!</h3>
                        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                          You've viewed all your daily matches. Come back tomorrow for new suggestions!
                        </p>
                      </div>
                      <Button 
                        onClick={handleRefreshMatches}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Get More Matches
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
        </div>
      </main>
    </div>
  );
};

export default DailyMatches;
