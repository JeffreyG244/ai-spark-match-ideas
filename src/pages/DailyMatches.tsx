
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, RefreshCw, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDailyMatches } from '@/hooks/useDailyMatches';
import DailyMatchCard from '@/components/discover/DailyMatchCard';

const DailyMatches = () => {
  const { user, signOut } = useAuth();
  const { 
    dailyMatches, 
    isLoading, 
    loadDailyMatches, 
    generateDailyMatches, 
    markAsViewed 
  } = useDailyMatches();

  useEffect(() => {
    if (user && dailyMatches.length === 0 && !isLoading) {
      // Generate daily matches if none exist
      generateDailyMatches();
    }
  }, [user, dailyMatches.length, isLoading]);

  const handleViewMatch = (matchId: string) => {
    markAsViewed(matchId);
    // You could navigate to a detailed view here
  };

  const handleRefreshMatches = () => {
    generateDailyMatches();
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Daily Matches</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/discover">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Discover
                </Button>
              </Link>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

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

        {dailyMatches.length === 0 ? (
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
                    <div className="text-sm text-gray-600">Daily Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(dailyMatches.reduce((acc, match) => acc + match.compatibility_score, 0) / dailyMatches.length) || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Compatibility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {dailyMatches.filter(match => match.compatibility_score >= 80).length}
                    </div>
                    <div className="text-sm text-gray-600">Excellent Matches</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dailyMatches.map((match) => (
                <DailyMatchCard
                  key={match.id}
                  match={match}
                  onView={handleViewMatch}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DailyMatches;
