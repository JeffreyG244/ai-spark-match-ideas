
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
    user_id: string;
    name: string;
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
      // Get matches first
      const { data: matchesData, error: matchesError } = await supabase
        .from('user_matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_updated', { ascending: false });

      if (matchesError) {
        console.error('Error loading matches:', matchesError);
        return;
      }

      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        return;
      }

      // Get the other user IDs from matches
      const otherUserIds = matchesData.map(match => {
        return match.user1_id === user.id ? match.user2_id : match.user1_id;
      });

      // Get profiles for the other users
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, name, email, bio, photos')
        .in('user_id', otherUserIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      // Process matches to get the other user's profile
      const processedMatches = matchesData.map(match => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const profile = profilesData?.find(p => p.user_id === otherUserId);
        
        return {
          id: `${match.user1_id}-${match.user2_id}`,
          user1_id: match.user1_id,
          user2_id: match.user2_id,
          compatibility_score: match.compatibility_score || 75,
          matched_at: match.last_updated || new Date().toISOString(),
          is_active: true,
          match_profile: profile
        };
      });

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
