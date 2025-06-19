
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
      // Try the direct approach first, but fall back to separate queries
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

      if (!matchesData || matchesData.length === 0) {
        setDailyMatches([]);
        return;
      }

      // Get profiles separately
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
    } catch (error) {
      console.error('Error loading daily matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyMatches = async (matchCount = 5) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('generate_daily_matches', {
        target_user_id: user.id,
        match_count: matchCount
      });

      if (error) {
        console.error('Error generating daily matches:', error);
        return;
      }

      // Reload matches after generation
      await loadDailyMatches();
    } catch (error) {
      console.error('Error generating daily matches:', error);
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
