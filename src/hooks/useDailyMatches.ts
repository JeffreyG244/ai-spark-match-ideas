
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DailyMatch {
  id: string;
  user_id: string;
  suggested_user_id: string;
  compatibility_score: number;
  suggested_date: string;
  viewed: boolean;
  created_at: string;
  user_profile?: {
    id: number;
    user_id: string;
    email: string;
    bio: string | null;
    values: string | null;
    interests: string[] | null;
    photos: string[] | null;
  };
}

export const useDailyMatches = () => {
  const { user } = useAuth();
  const [dailyMatches, setDailyMatches] = useState<DailyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDailyMatches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Loading daily matches for user:', user.id);
      
      // Try to get daily matches first
      const { data: matchesData, error: matchesError } = await supabase
        .from('daily_matches')
        .select('*')
        .eq('user_id', user.id)
        .eq('suggested_date', new Date().toISOString().split('T')[0])
        .order('compatibility_score', { ascending: false });

      if (matchesError) {
        console.error('Error loading daily matches:', matchesError);
        return;
      }

      console.log('Daily matches data:', matchesData);

      if (!matchesData || matchesData.length === 0) {
        console.log('No daily matches found, checking user_matches table...');
        
        // If no daily matches, try to get from user_matches
        const { data: userMatches, error: userMatchesError } = await supabase
          .from('user_matches')
          .select('*, user_profiles!user_matches_user1_id_fkey(*), user_profiles!user_matches_user2_id_fkey(*)')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('compatibility_score', { ascending: false })
          .limit(5);

        if (userMatchesError) {
          console.error('Error loading user matches:', userMatchesError);
          setDailyMatches([]);
          return;
        }

        console.log('User matches data:', userMatches);

        if (userMatches && userMatches.length > 0) {
          // Convert user_matches to daily_matches format
          const convertedMatches = userMatches.map(match => {
            const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
            const profileData = match.user1_id === user.id 
              ? match.user_profiles?.[1] || match.user_profiles?.[0]
              : match.user_profiles?.[0] || match.user_profiles?.[1];

            return {
              id: match.id,
              user_id: user.id,
              suggested_user_id: otherUserId,
              compatibility_score: match.compatibility_score,
              suggested_date: new Date().toISOString().split('T')[0],
              viewed: false,
              created_at: match.matched_at,
              user_profile: profileData ? {
                id: profileData.id,
                user_id: profileData.user_id,
                email: profileData.email,
                bio: profileData.bio,
                values: profileData.values,
                interests: profileData.interests,
                photos: profileData.photos
              } : undefined
            };
          });

          setDailyMatches(convertedMatches);
          return;
        }
      }

      // Get profiles separately for daily matches
      if (matchesData && matchesData.length > 0) {
        const userIds = matchesData.map(match => match.suggested_user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, user_id, email, bio, values, interests, photos')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
          return;
        }

        const processedMatches = matchesData.map(match => {
          const profile = profilesData?.find(p => p.user_id === match.suggested_user_id);
          return {
            ...match,
            user_profile: profile
          };
        });

        setDailyMatches(processedMatches);
      } else {
        setDailyMatches([]);
      }
    } catch (error) {
      console.error('Error loading daily matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyMatches = async (matchCount = 5) => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Generating daily matches for user:', user.id);
      
      // First try using the RPC function if available
      try {
        const { error } = await supabase.rpc('generate_daily_matches', {
          target_user_id: user.id,
          match_count: matchCount
        });

        if (error) {
          console.error('Error generating daily matches with RPC:', error);
          throw error;
        }
      } catch (rpcError) {
        console.log('RPC function not available, generating manually...');
        
        // Manual generation fallback
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .neq('user_id', user.id)
          .limit(matchCount);

        if (profilesError) {
          console.error('Error fetching profiles for manual generation:', profilesError);
          return;
        }

        if (profiles && profiles.length > 0) {
          const dailyMatchData = profiles.map(profile => ({
            user_id: user.id,
            suggested_user_id: profile.user_id,
            compatibility_score: Math.floor(Math.random() * 40) + 50, // Random score between 50-90
            suggested_date: new Date().toISOString().split('T')[0],
            viewed: false
          }));

          const { error: insertError } = await supabase
            .from('daily_matches')
            .insert(dailyMatchData);

          if (insertError) {
            console.error('Error inserting daily matches:', insertError);
          }
        }
      }

      // Reload matches after generation
      await loadDailyMatches();
    } catch (error) {
      console.error('Error generating daily matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsViewed = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('daily_matches')
        .update({ viewed: true })
        .eq('id', matchId);

      if (error) {
        console.error('Error marking match as viewed:', error);
      }
    } catch (error) {
      console.error('Error marking match as viewed:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadDailyMatches();
    }
  }, [user]);

  return {
    dailyMatches,
    isLoading,
    loadDailyMatches,
    generateDailyMatches,
    markAsViewed
  };
};
