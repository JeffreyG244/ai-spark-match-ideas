
-- Drop the dependent view first
DROP VIEW IF EXISTS public.public_memberships CASCADE;

-- Remove Stripe-specific columns and add PayPal fields to user_subscriptions
ALTER TABLE public.user_subscriptions 
DROP COLUMN IF EXISTS stripe_subscription_id,
ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'USD';

-- Update membership_plans to remove Stripe price_id and add PayPal plan info
ALTER TABLE public.membership_plans 
DROP COLUMN IF EXISTS price_id,
ADD COLUMN IF NOT EXISTS paypal_plan_id TEXT;

-- Create a simple payments table to track PayPal transactions
CREATE TABLE IF NOT EXISTS public.paypal_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  paypal_order_id TEXT NOT NULL,
  paypal_payer_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on paypal_payments
ALTER TABLE public.paypal_payments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own payments
CREATE POLICY "Users can view their own payments" ON public.paypal_payments
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for inserting payments (for edge functions)
CREATE POLICY "Allow payment inserts" ON public.paypal_payments
  FOR INSERT WITH CHECK (true);

-- Update existing membership plans to set PayPal pricing
UPDATE public.membership_plans 
SET monthly_price = 10.00 
WHERE name != 'Free';
