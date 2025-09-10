-- Create payments table for PayPal webhook processing
-- This table is needed for the fixed PayPal webhook handlers

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  payment_provider text NOT NULL DEFAULT 'paypal',
  payment_provider_id text NOT NULL,
  amount decimal(10,2),
  currency text DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  plan_type text,
  billing_cycle text, -- 'monthly' or 'annual'
  payer_email text,
  raw_data jsonb,
  processed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Only system (service role) can insert payments
CREATE POLICY "System can insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON public.payments (payment_provider_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_processed_at ON public.payments (processed_at);

-- Add missing subscription columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone;

-- Update users table index to include subscription info
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires ON public.users (subscription_tier, subscription_expires_at);

-- Grant permissions
GRANT SELECT ON public.payments TO authenticated;
GRANT INSERT, UPDATE ON public.payments TO service_role;

-- Log table creation
INSERT INTO public.security_logs (
  event_type,
  severity,
  details
) VALUES (
  'payments_table_created',
  'medium',
  jsonb_build_object(
    'table_name', 'payments',
    'created_at', now(),
    'reason', 'fix_paypal_webhook_processing'
  )
);