
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  matched_at: string;
  is_active: boolean;
  match_profile?: {
    id: number;
    user_id: string;
    email: string;
    bio: string | null;
    photos: string[] | null;
  };
}

export const useMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMatches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_matches')
        .select(`
          *,
          user_profiles!inner(
            id,
            user_id,
            email,
            bio,
            photos
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('matched_at', { ascending: false });

      if (error) {
        console.error('Error loading matches:', error);
        return;
      }

      // Process matches to get the other user's profile
      const processedMatches = data?.map(match => {
        const isUser1 = match.user1_id === user.id;
        const otherUserId = isUser1 ? match.user2_id : match.user1_id;
        
        return {
          ...match,
          match_profile: match.user_profiles
        };
      }) || [];

      setMatches(processedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [user]);

  return {
    matches,
    isLoading,
    loadMatches
  };
};
