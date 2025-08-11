-- Fix the RLS issue by enabling it on the user_interests_view
-- Note: This is a view, so we need to check if it has proper policies
-- Views inherit RLS from their base tables, so let's ensure base tables are secure

-- Enable RLS on interests table (if not already enabled)
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on interest_categories table (if not already enabled)  
ALTER TABLE public.interest_categories ENABLE ROW LEVEL SECURITY;

-- Fix the function search path security warnings for our new functions
DROP FUNCTION IF EXISTS update_user_phone_verification();
CREATE OR REPLACE FUNCTION update_user_phone_verification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL THEN
    UPDATE public.user_verifications 
    SET 
      phone_verified = true,
      phone_verified_at = NEW.verified_at,
      phone_number = NEW.phone_number,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS update_user_photo_verification();
CREATE OR REPLACE FUNCTION update_user_photo_verification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.verification_status = 'approved' AND OLD.verification_status != 'approved' THEN
    UPDATE public.user_verifications 
    SET 
      photo_verified = true,
      photo_verified_at = now(),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the triggers
DROP TRIGGER IF EXISTS phone_verification_trigger ON public.phone_verifications;
CREATE TRIGGER phone_verification_trigger
  AFTER UPDATE ON public.phone_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_user_phone_verification();

DROP TRIGGER IF EXISTS photo_verification_trigger ON public.verification_documents;
CREATE TRIGGER photo_verification_trigger
  AFTER UPDATE ON public.verification_documents
  FOR EACH ROW
  WHEN (NEW.document_type = 'selfie')
  EXECUTE FUNCTION update_user_photo_verification();