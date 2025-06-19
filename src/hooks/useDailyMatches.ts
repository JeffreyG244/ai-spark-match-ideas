
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
      const { data, error } = await supabase
        .from('daily_matches')
        .select(`
          *,
          user_profiles!inner(
            id,
            user_id,
            email,
            bio,
            values,
            interests,
            photos
          )
        `)
        .eq('user_id', user.id)
        .eq('suggested_date', new Date().toISOString().split('T')[0])
        .order('compatibility_score', { ascending: false });

      if (error) {
        console.error('Error loading daily matches:', error);
        return;
      }

      const processedMatches = data?.map(match => ({
        ...match,
        user_profile: match.user_profiles
      })) || [];

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
