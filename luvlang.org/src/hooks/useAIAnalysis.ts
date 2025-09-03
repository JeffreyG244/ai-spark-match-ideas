import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AIAnalysisResult {
  id: string;
  user_id: string;
  processing_status: string;
  compatibility_score?: number;
  personality_analysis?: any;
  match_recommendations?: any;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useAIAnalysis = () => {
  const { user } = useAuth();
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAnalysisResult = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_match_results')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }

        setAnalysisResult(data);
      } catch (err: any) {
        console.error('Error fetching AI analysis:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisResult();

    // Set up real-time subscription for analysis updates
    const subscription = supabase
      .channel('ai_analysis_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ai_match_results',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('AI analysis updated:', payload);
          setAnalysisResult(payload.new as AIAnalysisResult);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const triggerAnalysis = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Initialize analysis record
      const { error: insertError } = await supabase
        .from('ai_match_results')
        .upsert({
          user_id: user.id,
          processing_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }

      // Trigger N8N workflow
      const { error: webhookError } = await supabase.functions.invoke('profile-webhook', {
        body: { 
          user_id: user.id,
          event_type: 'analysis_requested'
        }
      });

      if (webhookError) {
        throw webhookError;
      }

      console.log('AI analysis triggered successfully');
    } catch (err: any) {
      console.error('Error triggering AI analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    analysisResult,
    loading,
    error,
    triggerAnalysis,
    isAnalysisComplete: analysisResult?.processing_status === 'completed',
    hasAnalysis: !!analysisResult
  };
};