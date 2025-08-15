import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
export const useSwipeActions = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const recordSwipe = async (swipedUserId, action) => {
        if (!user)
            return null;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('swipe_actions')
                .insert({
                swiper_id: user.id,
                swiped_user_id: swipedUserId,
                action: action
            })
                .select()
                .single();
            if (error) {
                console.error('Error recording swipe:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to record your swipe. Please try again.',
                    variant: 'destructive'
                });
                return null;
            }
            return data;
        }
        catch (error) {
            console.error('Error recording swipe:', error);
            return null;
        }
        finally {
            setIsLoading(false);
        }
    };
    const getSwipeHistory = async () => {
        if (!user)
            return [];
        try {
            const { data, error } = await supabase
                .from('swipe_actions')
                .select('*')
                .eq('swiper_id', user.id)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching swipe history:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('Error fetching swipe history:', error);
            return [];
        }
    };
    return {
        recordSwipe,
        getSwipeHistory,
        isLoading
    };
};
