
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Brain, ArrowLeft, Star, MessageCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompatibilityAnswers } from '@/hooks/useCompatibilityAnswers';
import { useProfileData } from '@/hooks/useProfileData';
import { useMatches } from '@/hooks/useMatches';
import CompatibilityScore from '@/components/discover/CompatibilityScore';

const Matches = () => {
  const { user, signOut } = useAuth();
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  const avgCompatibility = matches.length > 0 
    ? Math.round(matches.reduce((acc, match) => acc + match.compatibility, 0) / matches.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Luvlang</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link to="/daily-matches">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Daily Matches
                </Button>
              </Link>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Matches</h1>
          <p className="text-gray-600">People who liked you back - start a conversation!</p>
        </div>

        {/* Match Summary */}
        <Card className="border-purple-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Match Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(questionAnswers).length}
                </div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {matches.length}
                </div>
                <div className="text-sm text-gray-600">Total Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {avgCompatibility}%
                </div>
                <div className="text-sm text-gray-600">Avg Compatibility</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {matches.length === 0 ? (
          <Card className="border-purple-200 text-center py-12">
            <CardContent>
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Matches Yet</h3>
              <p className="text-gray-600 mb-6">
                Keep swiping to find people who like you back!
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/discover">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Start Swiping
                  </Button>
                </Link>
                <Link to="/daily-matches">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Daily Matches
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => {
              const profile = match.match_profile;
              if (!profile) return null;

              const firstName = profile.email.split('@')[0] || 'User';
              const photo = profile.photo_urls && profile.photo_urls.length > 0 
                ? profile.photo_urls[0] 
                : 'https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60';

              return (
                <Card key={match.id} className="border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={photo}
                        alt={firstName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60";
                        }}
                      />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-xl">{firstName}</span>
                      <Badge className="bg-green-100 text-green-800">
                        <Heart className="h-3 w-3 mr-1 fill-current" />
                        Match!
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CompatibilityScore score={match.compatibility} />
                    
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                      {profile.bio || 'No bio available'}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">
                        Matched {new Date(match.created_at).toLocaleDateString()}
                      </span>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
