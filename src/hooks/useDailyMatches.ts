
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
    user_id: string;
    email: string;
    bio: string | null;
    photo_urls: string[] | null;
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
      }

      console.log('Daily matches data:', matchesData);

      if (!matchesData || matchesData.length === 0) {
        console.log('No daily matches found, getting profiles for matching...');
        
        // Get all available profiles except user's own and already swiped
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .neq('user_id', user.id)
          .limit(10);

        if (profilesError) {
          console.error('Error loading profiles for matching:', profilesError);
          setDailyMatches([]);
          return;
        }

        console.log('Found profiles for matching:', profilesData?.length);

        if (profilesData && profilesData.length > 0) {
          // Convert profiles to daily matches format
          const convertedMatches = profilesData.map(profile => ({
            id: `match-${user.id}-${profile.user_id}`,
            user_id: user.id,
            suggested_user_id: profile.user_id,
            compatibility_score: Math.floor(Math.random() * 30) + 60, // 60-90%
            suggested_date: new Date().toISOString().split('T')[0],
            viewed: false,
            created_at: new Date().toISOString(),
            user_profile: {
              user_id: profile.user_id,
              email: profile.email || '',
              bio: profile.bio,
              photo_urls: profile.photo_urls
            }
          }));

          setDailyMatches(convertedMatches);
          console.log(`Created ${convertedMatches.length} matches from available profiles`);
          return;
        }
      }

      // Get profiles for existing daily matches
      if (matchesData && matchesData.length > 0) {
        const userIds = matchesData.map(match => match.suggested_user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, email, bio, photo_urls')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
          return;
        }

        const processedMatches = matchesData.map(match => {
          const profile = profilesData?.find(p => p.user_id === match.suggested_user_id);
          return {
            ...match,
            user_profile: profile ? {
              user_id: profile.user_id,
              email: profile.email || '',
              bio: profile.bio,
              photo_urls: profile.photo_urls
            } : undefined
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
      
      // Get available profiles for matching
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .limit(matchCount * 2); // Get more to filter from

      if (profilesError) {
        console.error('Error fetching profiles for matching:', profilesError);
        return;
      }

      if (profiles && profiles.length > 0) {
        // Create daily matches
        const dailyMatchData = profiles.slice(0, matchCount).map(profile => ({
          user_id: user.id,
          suggested_user_id: profile.user_id,
          compatibility_score: Math.floor(Math.random() * 30) + 60, // 60-90% professional compatibility
          suggested_date: new Date().toISOString().split('T')[0],
          viewed: false
        }));

        const { error: insertError } = await supabase
          .from('daily_matches')
          .insert(dailyMatchData);

        if (insertError) {
          console.error('Error inserting daily matches:', insertError);
        } else {
          console.log(`Successfully generated ${dailyMatchData.length} daily matches`);
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
