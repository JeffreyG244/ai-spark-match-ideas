-- Fix the missing gen_salt function and authentication issues
-- Enable the pgcrypto extension which provides gen_salt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fix critical security: Enable RLS on tables that don't have it
ALTER TABLE public.content_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutual_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_leaks ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for content moderation queue
CREATE POLICY "Admins can view moderation queue" ON public.content_moderation_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Add basic RLS policy for mutual matches
CREATE POLICY "Users can view their own mutual matches" ON public.mutual_matches
  FOR SELECT USING (
    profile_id_1 = auth.uid() OR profile_id_2 = auth.uid()
  );

-- Create n8n integration tracking table for workflow monitoring
CREATE TABLE IF NOT EXISTS public.n8n_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  webhook_url text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  created_at timestamp with time zone DEFAULT now(),
  success boolean DEFAULT false
);

-- Enable RLS on n8n logs
ALTER TABLE public.n8n_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Add policy for n8n logs
CREATE POLICY "Users can view their own webhook logs" ON public.n8n_webhook_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert webhook logs" ON public.n8n_webhook_logs
  FOR INSERT WITH CHECK (true);