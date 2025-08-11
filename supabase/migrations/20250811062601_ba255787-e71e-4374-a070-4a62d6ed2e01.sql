-- Drop triggers first, then functions, then recreate with proper security settings
DROP TRIGGER IF EXISTS phone_verification_trigger ON public.phone_verifications;
DROP TRIGGER IF EXISTS photo_verification_trigger ON public.verification_documents;

-- Now drop the functions
DROP FUNCTION IF EXISTS update_user_phone_verification();
DROP FUNCTION IF EXISTS update_user_photo_verification();

-- Enable RLS on interests table (if not already enabled)
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on interest_categories table (if not already enabled)  
ALTER TABLE public.interest_categories ENABLE ROW LEVEL SECURITY;

-- Recreate functions with proper security settings
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
CREATE TRIGGER phone_verification_trigger
  AFTER UPDATE ON public.phone_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_user_phone_verification();

CREATE TRIGGER photo_verification_trigger
  AFTER UPDATE ON public.verification_documents
  FOR EACH ROW
  WHEN (NEW.document_type = 'selfie')
  EXECUTE FUNCTION update_user_photo_verification();