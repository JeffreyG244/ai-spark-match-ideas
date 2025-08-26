-- Fix Security Definer View by dropping and recreating without SECURITY DEFINER
-- Fix Function Search Path issues by setting secure search paths

-- Set search_path for all functions to prevent security issues
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- Update any existing views that might have SECURITY DEFINER
-- Note: We'll need to identify the specific view causing the error
-- This is a placeholder - the actual view name would come from the linter details