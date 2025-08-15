-- Fix security warnings by setting search_path for existing custom functions
-- This prevents potential security issues with function search path being mutable

-- Fix functions that actually exist with correct signatures
ALTER FUNCTION public.calculate_compatibility_score(uuid, uuid) SET search_path = public;

ALTER FUNCTION public.call_n8n_webhook(text, text, jsonb, jsonb) SET search_path = public;

ALTER FUNCTION public.can_send_message(uuid, uuid) SET search_path = public;

ALTER FUNCTION public.get_user_membership_level(uuid) SET search_path = public;

ALTER FUNCTION public.handle_new_user() SET search_path = public;

ALTER FUNCTION public.has_role(uuid, text) SET search_path = public;

ALTER FUNCTION public.trigger_ai_analysis() SET search_path = public;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;