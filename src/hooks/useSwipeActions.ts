import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SwipeAction = 'like' | 'pass' | 'super_like';

export const useSwipeActions = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const recordSwipeAction = async (swipedUserId: string, action: SwipeAction) => {
    if (!user) return { success: false };

    setIsLoading(true);
    try {
      // Mock swipe action recording since table doesn't exist
      console.log('Recording swipe action:', { swipedUserId, action });
      
      // If it's a like, check if there's a match
      if (action === 'like') {
        await checkForMatch(swipedUserId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error recording swipe action:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const checkForMatch = async (swipedUserId: string) => {
    try {
      // Mock match checking - in real app this would check if the other user also liked
      const isMatch = Math.random() > 0.7; // 30% chance of match
      
      if (isMatch) {
        // Create a match in executive_matches table
        const { error } = await supabase
          .from('executive_matches')
          .insert({
            user_id: user!.id,
            matched_user_id: swipedUserId,
            compatibility_score: Math.floor(Math.random() * 30) + 70,
            status: 'matched'
          });

        if (error) {
          console.error('Error creating match:', error);
        } else {
          console.log('Match created!');
        }
      }
    } catch (error) {
      console.error('Error checking for match:', error);
    }
  };

  const getSwipeHistory = async () => {
    if (!user) return [];

    try {
      // Mock swipe history since table doesn't exist
      return [];
    } catch (error) {
      console.error('Error loading swipe history:', error);
      return [];
    }
  };

  // Alias for backward compatibility
  const recordSwipe = recordSwipeAction;

  return {
    recordSwipeAction,
    recordSwipe,
    getSwipeHistory,
    isLoading
  };
};