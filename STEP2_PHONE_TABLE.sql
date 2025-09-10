-- STEP 2: Create phone verifications table
-- Run this AFTER step 1 completes successfully

DROP TABLE IF EXISTS public.phone_verifications;
CREATE TABLE public.phone_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  verification_code text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

-- Enable RLS and create policies
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own phone verifications" ON public.phone_verifications
  FOR ALL USING (auth.uid() = user_id);