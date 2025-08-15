-- Create ai_match_results table for AI Analysis functionality
CREATE TABLE public.ai_match_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  compatibility_score NUMERIC,
  personality_analysis JSONB,
  match_recommendations JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_match_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own AI analysis results" 
ON public.ai_match_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage AI analysis results" 
ON public.ai_match_results 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_match_results_updated_at
BEFORE UPDATE ON public.ai_match_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();