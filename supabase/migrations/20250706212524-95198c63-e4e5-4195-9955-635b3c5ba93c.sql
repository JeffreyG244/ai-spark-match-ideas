
-- Create function to trigger N8N webhook when profile is updated
CREATE OR REPLACE FUNCTION trigger_n8n_profile_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://tzskjzkolyiwhijslqmq.supabase.co/functions/v1/profile-webhook';
BEGIN
  -- Call the edge function asynchronously using pg_net
  PERFORM net.http_post(
    url := webhook_url,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw"}'::jsonb,
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'event_type', CASE 
        WHEN TG_OP = 'INSERT' THEN 'profile_created'
        WHEN TG_OP = 'UPDATE' THEN 'profile_updated'
        ELSE 'profile_changed'
      END
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for dating_profiles table
DROP TRIGGER IF EXISTS on_dating_profile_change ON dating_profiles;
CREATE TRIGGER on_dating_profile_change
  AFTER INSERT OR UPDATE ON dating_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_n8n_profile_webhook();

-- Create trigger for compatibility_answers table  
DROP TRIGGER IF EXISTS on_compatibility_answers_change ON compatibility_answers;
CREATE TRIGGER on_compatibility_answers_change
  AFTER INSERT OR UPDATE ON compatibility_answers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_n8n_profile_webhook();
