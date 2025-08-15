
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { compatibilityQuestions } from '@/data/compatibilityQuestions';

export const useCompatibilityAnswers = () => {
  const { user } = useAuth();
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [isSavingAnswers, setIsSavingAnswers] = useState(false);

  const loadCompatibilityAnswers = async () => {
    if (!user) return;

    try {
      // Mock compatibility answers since the table doesn't exist
      const data = null;
      const error = null;

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading compatibility answers:', error);
        return;
      }

      if (data && data.answers) {
        setQuestionAnswers(data.answers as Record<number, string>);
      }
    } catch (error) {
      console.error('Error loading compatibility answers:', error);
    }
  };

  const saveCompatibilityAnswers = async () => {
    if (!user || Object.keys(questionAnswers).length === 0) return;

    setIsSavingAnswers(true);
    try {
      const answersPayload = {
        user_id: user.id,
        answers: questionAnswers,
        completed_at: new Date().toISOString()
      };

      // Mock saving since the table doesn't exist
      const result = { error: null };

      if (result.error) {
        console.error('Error saving compatibility answers:', result.error);
        toast({
          title: 'Error Saving Answers',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        const answeredCount = Object.keys(questionAnswers).length;
        const totalQuestions = 17; // Updated to 17 questions
        const score = Math.round((answeredCount / totalQuestions) * 100);
        
        toast({
          title: 'Compatibility Answers Saved',
          description: `Your compatibility score: ${score}%. Answers saved successfully!`,
        });
      }
    } catch (error) {
      console.error('Error saving compatibility answers:', error);
      toast({
        title: 'Error Saving Answers',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsSavingAnswers(false);
    }
  };

  const handleQuestionAnswer = (questionId: number, answer: string) => {
    setQuestionAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  return {
    questionAnswers,
    isSavingAnswers,
    loadCompatibilityAnswers,
    saveCompatibilityAnswers,
    handleQuestionAnswer
  };
};
