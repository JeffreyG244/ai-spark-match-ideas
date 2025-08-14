-- Fix security warnings by setting search_path for existing custom functions
-- This prevents potential security issues with function search path being mutable

-- Fix functions that actually exist (verified ones)
ALTER FUNCTION public.calculate_compatibility_score(user1_id uuid, user2_id uuid) SET search_path = public;

ALTER FUNCTION public.calculate_user_age(birth_date date) SET search_path = public;

ALTER FUNCTION public.call_n8n_webhook(webhook_url text, payload jsonb) SET search_path = public;

ALTER FUNCTION public.can_send_message(sender_id uuid, recipient_id uuid) SET search_path = public;

ALTER FUNCTION public.handle_new_user() SET search_path = public;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

ALTER FUNCTION public.trigger_ai_analysis(user_id uuid) SET search_path = public;

ALTER FUNCTION public.get_user_membership_level(user_id text) SET search_path = public;

ALTER FUNCTION public.has_role(role_name text) SET search_path = public;