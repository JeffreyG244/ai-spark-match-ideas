-- STEP 3: Create user verifications table
-- Run this AFTER step 2 completes successfully

DROP TABLE IF EXISTS public.user_verifications;
CREATE TABLE public.user_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  verification_type text NOT NULL CHECK (verification_type IN ('phone', 'photo', 'identity')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_review', 'verified', 'rejected')),
  submitted_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone,
  reviewed_by text,
  rejection_reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS and create policies
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verifications" ON public.user_verifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own verifications" ON public.user_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update verifications" ON public.user_verifications
  FOR UPDATE USING (true);