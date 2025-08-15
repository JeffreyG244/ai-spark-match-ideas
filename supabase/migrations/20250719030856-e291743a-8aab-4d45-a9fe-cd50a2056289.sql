-- Fix the missing gen_salt function and authentication issues
-- Enable the pgcrypto extension which provides gen_salt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add unique constraint to dating_profiles user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'dating_profiles' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name = 'dating_profiles_user_id_key'
    ) THEN
        ALTER TABLE public.dating_profiles ADD CONSTRAINT dating_profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Create user profile for the existing user if missing
INSERT INTO public.dating_profiles (
  user_id, 
  email, 
  first_name, 
  last_name, 
  visible,
  created_at,
  updated_at
) VALUES (
  '768aa1a7-ee6a-40b4-b704-0eaf4c8443e1',
  'jeffreytgravescas@gmail.com',
  'Jeffrey',
  'Graves',
  true,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = now();

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