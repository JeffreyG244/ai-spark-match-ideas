-- Fix security warnings by setting search_path for verified custom functions
-- Only fixing functions that we know exist with correct signatures

-- Functions that exist and need search_path fixed
ALTER FUNCTION public.calculate_compatibility_score(user1_id uuid, user2_id uuid) SET search_path = public;

ALTER FUNCTION public.can_send_message(sender_id uuid, recipient_id uuid) SET search_path = public;

ALTER FUNCTION public.get_user_membership_level(user_id uuid) SET search_path = public;

ALTER FUNCTION public.handle_new_user() SET search_path = public;

ALTER FUNCTION public.has_role(check_user_id uuid, check_role text) SET search_path = public;

ALTER FUNCTION public.trigger_ai_analysis() SET search_path = public;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;