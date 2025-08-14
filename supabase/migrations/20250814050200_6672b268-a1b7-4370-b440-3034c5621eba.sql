-- Fix security warnings by setting search_path for custom functions
-- This prevents potential security issues with function search path being mutable

-- Fix analyze_and_match function
ALTER FUNCTION public.analyze_and_match(jsonb, uuid) SET search_path = public;

-- Fix calculate_compatibility_score function  
ALTER FUNCTION public.calculate_compatibility_score(uuid, uuid) SET search_path = public;

-- Fix calculate_user_age function
ALTER FUNCTION public.calculate_user_age(date) SET search_path = public;

-- Fix call_n8n_webhook functions
ALTER FUNCTION public.call_n8n_webhook(text, jsonb) SET search_path = public;

-- Fix can_send_message function
ALTER FUNCTION public.can_send_message(uuid, uuid) SET search_path = public;

-- Fix check_https function
ALTER FUNCTION public.check_https() SET search_path = public;

-- Fix check_password_policy function
ALTER FUNCTION public.check_password_policy(text) SET search_path = public;

-- Fix clean_orphaned_photos function
ALTER FUNCTION public.clean_orphaned_photos() SET search_path = public;

-- Fix cleanup_old_data function
ALTER FUNCTION public.cleanup_old_data() SET search_path = public;

-- Fix cleanup_old_rate_limits function
ALTER FUNCTION public.cleanup_old_rate_limits() SET search_path = public;

-- Fix cleanup_old_security_data function
ALTER FUNCTION public.cleanup_old_security_data() SET search_path = public;

-- Fix create_paypal_payment function
ALTER FUNCTION public.create_paypal_payment(text, text, numeric, text) SET search_path = public;

-- Fix create_user_profile_manually function
ALTER FUNCTION public.create_user_profile_manually(uuid, text, text, text, integer, text, text[], text, text, text, text, text, text) SET search_path = public;

-- Fix delete_profile_photo functions
ALTER FUNCTION public.delete_profile_photo(uuid, text) SET search_path = public;

-- Fix find_compatible_matches function
ALTER FUNCTION public.find_compatible_matches(uuid, integer) SET search_path = public;

-- Fix find_similar_users function
ALTER FUNCTION public.find_similar_users(uuid, integer) SET search_path = public;

-- Fix force_https function
ALTER FUNCTION public.force_https() SET search_path = public;

-- Fix generate_compatible_matches function
ALTER FUNCTION public.generate_compatible_matches(uuid) SET search_path = public;

-- Fix generate_daily_matches function
ALTER FUNCTION public.generate_daily_matches() SET search_path = public;

-- Fix generate_daily_matches_for_user function
ALTER FUNCTION public.generate_daily_matches_for_user(uuid) SET search_path = public;

-- Fix get_nearby_profiles functions
ALTER FUNCTION public.get_nearby_profiles(double precision, double precision, integer, integer) SET search_path = public;

-- Fix get_profile_by_user_id functions
ALTER FUNCTION public.get_profile_by_user_id(uuid) SET search_path = public;

-- Fix get_profile_user_id_as_uuid function
ALTER FUNCTION public.get_profile_user_id_as_uuid(text) SET search_path = public;

-- Fix get_secure_photo_url functions
ALTER FUNCTION public.get_secure_photo_url(text) SET search_path = public;

-- Fix get_top_matches function
ALTER FUNCTION public.get_top_matches(uuid, integer) SET search_path = public;

-- Fix get_user_gender_preference function
ALTER FUNCTION public.get_user_gender_preference(uuid) SET search_path = public;

-- Fix get_user_membership_level function
ALTER FUNCTION public.get_user_membership_level(text) SET search_path = public;

-- Fix handle_new_user function
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Fix handle_paypal_webhook function
ALTER FUNCTION public.handle_paypal_webhook(jsonb) SET search_path = public;

-- Fix handle_swipe_action function
ALTER FUNCTION public.handle_swipe_action(uuid, uuid, text) SET search_path = public;

-- Fix has_role function
ALTER FUNCTION public.has_role(text) SET search_path = public;

-- Fix is_admin_or_higher function
ALTER FUNCTION public.is_admin_or_higher() SET search_path = public;

-- Fix is_gender_compatible functions
ALTER FUNCTION public.is_gender_compatible(uuid, uuid) SET search_path = public;

-- Fix log_admin_action function
ALTER FUNCTION public.log_admin_action(text, jsonb) SET search_path = public;

-- Fix log_security_event function
ALTER FUNCTION public.log_security_event(text, jsonb, text) SET search_path = public;

-- Fix rate_limit_check function
ALTER FUNCTION public.rate_limit_check(text, text, integer, interval) SET search_path = public;

-- Fix reset_daily_limits function
ALTER FUNCTION public.reset_daily_limits() SET search_path = public;

-- Fix schedule_profile_cleanup function
ALTER FUNCTION public.schedule_profile_cleanup() SET search_path = public;

-- Fix trigger_ai_analysis function
ALTER FUNCTION public.trigger_ai_analysis(uuid) SET search_path = public;

-- Fix update_match_status function
ALTER FUNCTION public.update_match_status(uuid, text) SET search_path = public;

-- Fix update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Fix upload_profile_photo function
ALTER FUNCTION public.upload_profile_photo(uuid, text, text, text) SET search_path = public;