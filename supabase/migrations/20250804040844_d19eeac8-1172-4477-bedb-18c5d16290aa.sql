-- ============================================
-- SECURITY FIXES FOR LUVLANG PLATFORM
-- ============================================

-- Add missing RLS policies for tables that need them

-- Enable RLS on remaining tables
ALTER TABLE ai_icebreakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies

-- AI Icebreakers policies
CREATE POLICY "Users can view icebreakers for their matches" ON ai_icebreakers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM executive_matches 
      WHERE id = match_id 
      AND (user_id = auth.uid() OR matched_user_id = auth.uid())
    )
  );

CREATE POLICY "System can create icebreakers" ON ai_icebreakers
  FOR INSERT WITH CHECK (true);

-- Meeting Requests policies
CREATE POLICY "Users can view meeting requests they're involved in" ON meeting_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create meeting requests" ON meeting_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update meeting requests they're involved in" ON meeting_requests
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- User Verifications policies
CREATE POLICY "Users can manage their own verifications" ON user_verifications
  FOR ALL USING (auth.uid() = user_id);

-- Profile Badges policies
CREATE POLICY "Users can view their own badges" ON profile_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage badges" ON profile_badges
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view badges of other users" ON profile_badges
  FOR SELECT USING (true);

-- Networking Events policies
CREATE POLICY "Users can view public events" ON networking_events
  FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON networking_events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events" ON networking_events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Event Attendees policies
CREATE POLICY "Users can view event attendees" ON event_attendees
  FOR SELECT USING (true);

CREATE POLICY "Users can register for events" ON event_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their attendance" ON event_attendees
  FOR UPDATE USING (auth.uid() = user_id);

-- Add missing policies for tables that exist but need more policies

-- Users table - Add insert policy for registration
CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Professional profiles - Add insert policy
CREATE POLICY "Users can create their professional profile" ON professional_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversations - Add insert policy
CREATE POLICY "Users can create conversations they participate in" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Executive matches - Add delete policy for user actions
CREATE POLICY "Users can delete their match actions" ON executive_matches
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- User analytics - Add comprehensive policies
CREATE POLICY "Users can view their own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create analytics" ON user_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update analytics" ON user_analytics
  FOR UPDATE USING (true);

-- User subscriptions - Add comprehensive policies
CREATE POLICY "Users can create their subscription" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Add function to update message timestamps
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at,
      message_count = message_count + 1
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- Create trigger for message timestamp updates
DROP TRIGGER IF EXISTS update_conversation_on_message ON conversation_messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();

-- Create function to automatically calculate age
CREATE OR REPLACE FUNCTION public.calculate_user_age()
RETURNS TRIGGER AS $$
BEGIN
  NEW.age := EXTRACT(YEAR FROM AGE(NEW.date_of_birth));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public';

-- Create trigger for age calculation
DROP TRIGGER IF EXISTS calculate_age_on_user_update ON users;
CREATE TRIGGER calculate_age_on_user_update
  BEFORE INSERT OR UPDATE OF date_of_birth ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_user_age();