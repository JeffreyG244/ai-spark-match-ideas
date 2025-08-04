import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Users, Zap, Calendar, Target } from 'lucide-react';

interface AIEnhancedMatch {
  id: string;
  user_id: string;
  matched_user_id: string;
  base_score: number;
  personality_score?: number | null;
  behavior_score?: number | null;
  total_score?: number | null;
  embedding_similarity?: number | null;
  match_date?: string | null;
  created_at?: string | null;
  generated_at?: string | null;
}

interface MatchedUserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  interests?: string[];
  job_title?: string;
  company?: string;
  profile_image_url?: string;
}

interface MatchWithProfile extends AIEnhancedMatch {
  matched_profile?: MatchedUserProfile;
}

const ProfessionalMatchingDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = async (showRefreshing = false) => {
    if (!user) return;
    
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch matches for current user
      const { data: matchesData, error: matchesError } = await supabase
        .from('executive_matches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      if (matchesData && matchesData.length > 0) {
        // Fetch profiles for matched users
        const matchedUserIds = matchesData.map(match => match.matched_user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('users')
          .select('id, first_name, last_name, bio, interests, photos')
          .in('id', matchedUserIds);

        if (profilesError) throw profilesError;

        // Combine matches with profiles
        const matchesWithProfiles = matchesData.map(match => ({
          ...match,
          base_score: match.compatibility_score || 85,
          matched_profile: profilesData?.find(profile => profile.id === match.matched_user_id)
        }));

        setMatches(matchesWithProfiles);
      } else {
        setMatches([]);
      }
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch matches. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const triggerNewMatches = async () => {
    if (!user) return;
    
    setTriggering(true);
    try {
      // Call the N8N webhook to trigger professional matching
      const response = await fetch('http://localhost:5678/webhook/professional-match-trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          trigger_type: 'manual_professional_match'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: 'Success!',
        description: 'New match analysis has been triggered. Check back in a few minutes for results.',
      });

      // Refresh matches after a short delay
      setTimeout(() => {
        fetchMatches(true);
      }, 2000);

    } catch (error: any) {
      console.error('Error triggering matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger new matches. Please check your connection and try again.',
        variant: 'destructive'
      });
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const getMatchReasons = (match: AIEnhancedMatch): string[] => {
    const reasons: string[] = [];
    
    if (match.personality_score && match.personality_score > 0.7) {
      reasons.push('Strong personality compatibility');
    }
    if (match.behavior_score && match.behavior_score > 0.7) {
      reasons.push('Compatible behavior patterns');
    }
    if (match.embedding_similarity && match.embedding_similarity > 0.8) {
      reasons.push('Similar interests and values');
    }
    if (match.base_score > 80) {
      reasons.push('High overall compatibility');
    }
    
    if (reasons.length === 0) {
      reasons.push('Potential compatibility');
    }
    
    return reasons;
  };

  const formatMatchDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading your matches...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professional Matches</h1>
          <p className="text-gray-600 mt-1">AI-powered compatibility matching for busy professionals</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={() => fetchMatches(true)}
            disabled={refreshing}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          
          <Button
            onClick={triggerNewMatches}
            disabled={triggering}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            {triggering ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Find New Matches
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">High Compatibility</p>
                <p className="text-2xl font-bold text-gray-900">
                  {matches.filter(m => m.base_score > 80).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-love-accent/20 bg-love-surface">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-love-accent" />
              <div className="ml-3">
                <p className="text-sm text-love-text-light">This Week</p>
                <p className="text-2xl font-bold text-love-text">
                  {matches.filter(m => {
                    if (!m.created_at) return false;
                    const matchDate = new Date(m.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return matchDate >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matches Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Matches</h2>
        
        {matches.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
              <p className="text-gray-600 mb-4">
                Trigger a new match analysis to find compatible professionals in your area.
              </p>
              <Button
                onClick={triggerNewMatches}
                disabled={triggering}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {triggering ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Find Your First Matches
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card 
                key={match.id} 
                className="border-gray-200 hover:border-blue-300 transition-colors shadow-sm hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-love-primary to-love-secondary rounded-full flex items-center justify-center text-white font-medium">
                        {match.matched_profile?.first_name?.[0] || 'M'}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {match.matched_profile?.first_name && match.matched_profile?.last_name 
                            ? `${match.matched_profile.first_name} ${match.matched_profile.last_name}`
                            : 'Professional Match'
                          }
                        </CardTitle>
                        <CardDescription>
                          {match.created_at ? formatMatchDate(match.created_at) : 'Recent match'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {match.base_score}%
                      </div>
                      <div className="text-xs text-gray-500">compatibility</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {match.matched_profile?.bio && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {match.matched_profile.bio}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Match Reasons</h4>
                      <div className="flex flex-wrap gap-1">
                        {getMatchReasons(match).map((reason, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {match.matched_profile?.interests && Array.isArray(match.matched_profile.interests) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Interests</h4>
                        <div className="flex flex-wrap gap-1">
                          {match.matched_profile.interests.slice(0, 3).map((interest, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                            >
                              {interest}
                            </span>
                          ))}
                          {match.matched_profile.interests.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{match.matched_profile.interests.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      View Full Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalMatchingDashboard;