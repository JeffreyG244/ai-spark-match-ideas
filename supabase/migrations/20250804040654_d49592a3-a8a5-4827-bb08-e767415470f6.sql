-- ============================================
-- LUVLANG EXECUTIVE DATING PLATFORM - CLEAN SCHEMA
-- ============================================

-- STEP 1: DROP ALL EXISTING TABLES SAFELY
-- ============================================

DROP TABLE IF EXISTS public.event_attendees CASCADE;
DROP TABLE IF EXISTS public.meeting_requests CASCADE;
DROP TABLE IF EXISTS public.professional_compatibility CASCADE;
DROP TABLE IF EXISTS public.professional_preferences CASCADE;
DROP TABLE IF EXISTS public.quick_actions CASCADE;
DROP TABLE IF EXISTS public.ai_icebreakers CASCADE;
DROP TABLE IF EXISTS public.ai_enhanced_matches CASCADE;
DROP TABLE IF EXISTS public.ai_date_suggestions CASCADE;
DROP TABLE IF EXISTS public.ai_match_feedback CASCADE;
DROP TABLE IF EXISTS public.ai_match_results CASCADE;
DROP TABLE IF EXISTS public.ai_moderation_log CASCADE;
DROP TABLE IF EXISTS public.content_moderation_queue CASCADE;
DROP TABLE IF EXISTS public.conversation_messages CASCADE;
DROP TABLE IF EXISTS public.conversation_ai_assist CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.daily_matches CASCADE;
DROP TABLE IF EXISTS public.message_media CASCADE;
DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.swipes CASCADE;
DROP TABLE IF EXISTS public.swipe_actions CASCADE;
DROP TABLE IF EXISTS public.user_matches CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.user_reports CASCADE;
DROP TABLE IF EXISTS public.user_blocks CASCADE;
DROP TABLE IF EXISTS public.user_verifications CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.user_analytics CASCADE;
DROP TABLE IF EXISTS public.user_behavior CASCADE;
DROP TABLE IF EXISTS public.user_embeddings CASCADE;
DROP TABLE IF EXISTS public.user_presence CASCADE;
DROP TABLE IF EXISTS public.user_devices CASCADE;
DROP TABLE IF EXISTS public.user_locations CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.professional_verifications CASCADE;
DROP TABLE IF EXISTS public.professional_profiles CASCADE;
DROP TABLE IF EXISTS public.networking_events CASCADE;
DROP TABLE IF EXISTS public.emergency_contacts CASCADE;
DROP TABLE IF EXISTS public.profile_badges CASCADE;
DROP TABLE IF EXISTS public.success_stories CASCADE;
DROP TABLE IF EXISTS public.paypal_payments CASCADE;
DROP TABLE IF EXISTS public.payment_records CASCADE;
DROP TABLE IF EXISTS public.membership_plans CASCADE;
DROP TABLE IF EXISTS public.admin_actions CASCADE;
DROP TABLE IF EXISTS public.security_logs CASCADE;
DROP TABLE IF EXISTS public.security_events CASCADE;
DROP TABLE IF EXISTS public.security_configs CASCADE;
DROP TABLE IF EXISTS public.rate_limits CASCADE;
DROP TABLE IF EXISTS public.rate_limit_blocks CASCADE;
DROP TABLE IF EXISTS public.rate_limit_rules CASCADE;
DROP TABLE IF EXISTS public.message_rate_limits CASCADE;
DROP TABLE IF EXISTS public.n8n_webhook_logs CASCADE;
DROP TABLE IF EXISTS public.errors CASCADE;
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.compatibility_answers CASCADE;
DROP TABLE IF EXISTS public.cities_states CASCADE;
DROP TABLE IF EXISTS public.ai_models CASCADE;
DROP TABLE IF EXISTS public.match_preferences CASCADE;
DROP TABLE IF EXISTS public.match_suggestions CASCADE;
DROP TABLE IF EXISTS public.dating_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.old_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.active_users CASCADE;
DROP TABLE IF EXISTS public.enhanced_active_users CASCADE;
DROP TABLE IF EXISTS public.mutual_matches CASCADE;
DROP TABLE IF EXISTS public.my_new_table CASCADE;
DROP TABLE IF EXISTS public.password_rules CASCADE;

-- Drop any remaining tables
DROP TABLE IF EXISTS public.profiles_backup CASCADE;
DROP TABLE IF EXISTS public.pre_migration_profiles_backup CASCADE;
DROP TABLE IF EXISTS public.pre_migration_view_backups CASCADE;
DROP TABLE IF EXISTS public.view_backups CASCADE;
DROP TABLE IF EXISTS public.temp_users CASCADE;
DROP TABLE IF EXISTS public.welcome_emails CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS public.match_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- STEP 2: CREATE CORE EXECUTIVE DATING SCHEMA
-- ============================================

-- Executive Users Table (Core Profile)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Profile Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'non-binary', 'other')),
  looking_for VARCHAR(20) CHECK (looking_for IN ('male', 'female', 'any')),
  
  -- Professional Information  
  job_title VARCHAR(200),
  company VARCHAR(200),
  industry VARCHAR(100),
  work_location VARCHAR(200),
  education_level VARCHAR(50),
  university VARCHAR(200),
  graduation_year INTEGER,
  salary_range VARCHAR(50),
  work_schedule VARCHAR(50),
  
  -- Location & Availability
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  max_distance INTEGER DEFAULT 25,
  
  -- Dating Preferences
  age_min INTEGER DEFAULT 22,
  age_max INTEGER DEFAULT 45,
  preferred_industries TEXT[],
  deal_breakers TEXT[],
  
  -- Profile Content
  bio TEXT,
  photos TEXT[],
  interests TEXT[],
  languages TEXT[] DEFAULT ARRAY['English'],
  
  -- Executive Features
  love_language VARCHAR(50),
  family_goals TEXT,
  lifestyle_preference VARCHAR(100),
  personality_traits TEXT[],
  current_mood VARCHAR(50) DEFAULT 'confident',
  stress_level VARCHAR(20) DEFAULT 'low',
  
  -- Professional Lifestyle
  hobbies TEXT[],
  perfect_date TEXT,
  currently_reading VARCHAR(200),
  music_taste TEXT[],
  dietary_preferences TEXT[],
  fitness_level VARCHAR(50),
  social_causes TEXT[],
  investment_interests TEXT[],
  cultural_interests TEXT[],
  luxury_preferences TEXT[],
  travel_schedule TEXT,
  
  -- Verification & Security
  is_verified BOOLEAN DEFAULT FALSE,
  verification_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  verification_date TIMESTAMP WITH TIME ZONE,
  phone_number VARCHAR(20),
  linkedin_url VARCHAR(300),
  company_email VARCHAR(255),
  
  -- Activity & Status
  is_active BOOLEAN DEFAULT TRUE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Professional Preferences
  lunch_meetings BOOLEAN DEFAULT FALSE,
  after_work_dates BOOLEAN DEFAULT TRUE,
  weekend_availability BOOLEAN DEFAULT TRUE,
  networking_events BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  profile_views INTEGER DEFAULT 0,
  market_rank_percentile INTEGER DEFAULT 50,
  trending_score INTEGER DEFAULT 0,
  demand_level VARCHAR(20) DEFAULT 'moderate',
  response_rate DECIMAL(5,2) DEFAULT 85.0,
  average_response_time_minutes INTEGER DEFAULT 30
);

-- Professional Profiles (Extended Professional Data)
CREATE TABLE public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Career Details
  years_experience INTEGER,
  career_level VARCHAR(50) CHECK (career_level IN ('entry', 'mid', 'senior', 'executive', 'c_level')),
  team_size INTEGER,
  management_role BOOLEAN DEFAULT FALSE,
  remote_work_preference VARCHAR(50),
  
  -- Professional Goals & Values
  career_goals TEXT,
  professional_interests TEXT[],
  networking_goals TEXT[],
  mentorship_interest VARCHAR(50),
  work_life_balance_importance INTEGER CHECK (work_life_balance_importance >= 1 AND work_life_balance_importance <= 10),
  ambition_level INTEGER CHECK (ambition_level >= 1 AND ambition_level <= 10),
  
  -- Schedule & Availability
  typical_work_hours VARCHAR(100),
  travel_frequency VARCHAR(50),
  lunch_break_available BOOLEAN DEFAULT TRUE,
  after_hours_available BOOLEAN DEFAULT TRUE,
  
  -- Professional Achievements
  professional_achievements TEXT[],
  certifications TEXT[],
  awards TEXT[],
  publications TEXT[],
  speaking_engagements TEXT[],
  
  -- Executive Specific
  board_positions TEXT[],
  equity_ownership BOOLEAN DEFAULT FALSE,
  startup_experience BOOLEAN DEFAULT FALSE,
  international_experience BOOLEAN DEFAULT FALSE
);

-- Executive Matches with Advanced Scoring
CREATE TABLE public.executive_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Enhanced Scoring System
  compatibility_score DECIMAL(5,2) NOT NULL, -- 0-100
  relationship_potential DECIMAL(5,2) DEFAULT 0,
  success_probability DECIMAL(5,2) DEFAULT 0,
  
  -- Professional Compatibility
  professional_score DECIMAL(5,2) DEFAULT 0,
  lifestyle_score DECIMAL(5,2) DEFAULT 0,
  personality_score DECIMAL(5,2) DEFAULT 0,
  values_alignment_score DECIMAL(5,2) DEFAULT 0,
  communication_compatibility DECIMAL(5,2) DEFAULT 0,
  
  -- Match Quality Indicators
  mutual_connections INTEGER DEFAULT 0,
  common_interests TEXT[],
  match_reasons TEXT[],
  potential_challenges TEXT[],
  
  -- AI Predictions
  optimal_meeting_type VARCHAR(50),
  best_conversation_starters TEXT[],
  relationship_timeline_prediction TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  user_action VARCHAR(20),
  matched_user_action VARCHAR(20),
  user_action_at TIMESTAMP WITH TIME ZONE,
  matched_user_action_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, matched_user_id)
);

-- AI-Generated Icebreakers & Conversation Starters
CREATE TABLE public.ai_icebreakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES executive_matches(id) ON DELETE CASCADE,
  icebreaker_text TEXT NOT NULL,
  icebreaker_type VARCHAR(50) DEFAULT 'professional',
  confidence_score DECIMAL(5,2) DEFAULT 80.0,
  generated_by VARCHAR(50) DEFAULT 'ai_system',
  used_by_user UUID,
  effectiveness_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Executive Messages System
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES executive_matches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Conversation Analytics
  message_count INTEGER DEFAULT 0,
  avg_response_time INTERVAL,
  conversation_quality_score DECIMAL(5,2) DEFAULT 50.0,
  
  UNIQUE(participant_1, participant_2)
);

CREATE TABLE public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Professional Features
  meeting_proposal JSONB,
  contact_info_shared BOOLEAN DEFAULT FALSE,
  
  -- AI Enhancement
  sentiment_score DECIMAL(5,2),
  ai_suggested BOOLEAN DEFAULT FALSE,
  effectiveness_score DECIMAL(5,2)
);

-- Executive Meeting Requests
CREATE TABLE public.meeting_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES executive_matches(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Meeting Details
  meeting_type VARCHAR(50), -- coffee, lunch, networking_event, dinner, video_call
  proposed_date DATE,
  proposed_time TIME,
  duration_minutes INTEGER DEFAULT 60,
  location_type VARCHAR(50), -- venue_suggestion, virtual, flexible
  venue_suggestion TEXT,
  message TEXT,
  
  -- Status Management
  status VARCHAR(20) DEFAULT 'pending',
  response_message TEXT,
  confirmed_date DATE,
  confirmed_time TIME,
  confirmed_location TEXT,
  
  -- Post-Meeting
  meeting_rating INTEGER,
  follow_up_interest BOOLEAN,
  meeting_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Premium Matches
CREATE TABLE public.daily_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommended_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  
  -- AI Recommendation Details
  recommendation_score DECIMAL(5,2) NOT NULL,
  recommendation_reasons TEXT[],
  ai_confidence DECIMAL(5,2) DEFAULT 80.0,
  
  -- User Actions
  action VARCHAR(20), -- like, pass, super_like, boost, not_viewed
  action_at TIMESTAMP WITH TIME ZONE,
  
  -- Professional Context
  professional_highlight TEXT,
  networking_opportunity BOOLEAN DEFAULT FALSE,
  trending_reason TEXT,
  
  UNIQUE(user_id, recommended_user_id, date)
);

-- User Verification System
CREATE TABLE public.user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Verification Types
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  photo_verified BOOLEAN DEFAULT FALSE,
  video_verified BOOLEAN DEFAULT FALSE,
  linkedin_verified BOOLEAN DEFAULT FALSE,
  company_verified BOOLEAN DEFAULT FALSE,
  education_verified BOOLEAN DEFAULT FALSE,
  income_verified BOOLEAN DEFAULT FALSE,
  background_check_verified BOOLEAN DEFAULT FALSE,
  
  -- Verification Dates
  phone_verified_at TIMESTAMP WITH TIME ZONE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  photo_verified_at TIMESTAMP WITH TIME ZONE,
  video_verified_at TIMESTAMP WITH TIME ZONE,
  linkedin_verified_at TIMESTAMP WITH TIME ZONE,
  company_verified_at TIMESTAMP WITH TIME ZONE,
  education_verified_at TIMESTAMP WITH TIME ZONE,
  income_verified_at TIMESTAMP WITH TIME ZONE,
  background_check_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Verification Data
  verification_documents JSONB DEFAULT '[]'::jsonb,
  verification_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Achievement Badges
CREATE TABLE public.profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  verification_required BOOLEAN DEFAULT FALSE,
  
  -- Badge Categories: professional, lifestyle, platform, achievement
  category VARCHAR(50) DEFAULT 'achievement'
);

-- Networking Events
CREATE TABLE public.networking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(200) NOT NULL,
  event_type VARCHAR(50),
  industry VARCHAR(100),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  description TEXT,
  max_attendees INTEGER,
  cost DECIMAL(10,2),
  dress_code VARCHAR(50),
  exclusivity_level VARCHAR(50), -- open, members_only, invite_only, c_suite_only
  organizer_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES networking_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended_at TIMESTAMP WITH TIME ZONE,
  connections_made INTEGER DEFAULT 0,
  
  UNIQUE(event_id, user_id)
);

-- Analytics & Insights
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  
  -- Engagement Metrics
  profile_views INTEGER DEFAULT 0,
  profile_likes INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  matches_made INTEGER DEFAULT 0,
  meetings_scheduled INTEGER DEFAULT 0,
  meetings_completed INTEGER DEFAULT 0,
  
  -- Quality Metrics
  response_rate DECIMAL(5,2) DEFAULT 0,
  average_response_time INTEGER DEFAULT 0, -- minutes
  conversation_quality_avg DECIMAL(5,2) DEFAULT 0,
  meeting_success_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Market Position
  market_rank_percentile INTEGER DEFAULT 50,
  trending_score INTEGER DEFAULT 0,
  demand_level VARCHAR(20) DEFAULT 'moderate',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Premium Membership System
CREATE TABLE public.membership_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tier_level INTEGER NOT NULL, -- 1=basic, 2=premium, 3=executive, 4=c_suite
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2),
  features JSONB NOT NULL,
  max_daily_matches INTEGER DEFAULT 10,
  max_monthly_meetings INTEGER DEFAULT 5,
  concierge_access BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES membership_plans(id),
  status VARCHAR(20) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Core user indexes
CREATE INDEX idx_users_active ON users(is_active, last_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_location ON users(city, state, latitude, longitude);
CREATE INDEX idx_users_professional ON users(industry, job_title);
CREATE INDEX idx_users_age_gender ON users(age, gender, looking_for);

-- Matching indexes
CREATE INDEX idx_matches_compatibility ON executive_matches(compatibility_score DESC, created_at DESC);
CREATE INDEX idx_matches_users ON executive_matches(user_id, matched_user_id);
CREATE INDEX idx_matches_status ON executive_matches(status, created_at DESC);

-- Daily matches
CREATE INDEX idx_daily_matches_user_date ON daily_matches(user_id, date DESC);
CREATE INDEX idx_daily_matches_score ON daily_matches(recommendation_score DESC);

-- Messages
CREATE INDEX idx_messages_conversation ON conversation_messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversations ON conversations(participant_1, participant_2, last_message_at DESC);

-- Analytics
CREATE INDEX idx_analytics_user_date ON user_analytics(user_id, date DESC);
CREATE INDEX idx_analytics_trends ON user_analytics(trending_score DESC, market_rank_percentile);

-- Professional
CREATE INDEX idx_professional_career ON professional_profiles(career_level, years_experience);
CREATE INDEX idx_professional_interests ON professional_profiles USING GIN(professional_interests);

-- Events
CREATE INDEX idx_events_date ON networking_events(date DESC, industry);
CREATE INDEX idx_event_attendees ON event_attendees(event_id, status);

-- STEP 4: CREATE SAMPLE MEMBERSHIP PLANS
-- ============================================

INSERT INTO membership_plans (name, tier_level, monthly_price, annual_price, features, max_daily_matches, max_monthly_meetings, concierge_access, priority_support) VALUES
('Basic', 1, 29.99, 299.99, '{"features": ["Basic matching", "5 daily matches", "Standard support"]}', 5, 2, FALSE, FALSE),
('Premium', 2, 59.99, 599.99, '{"features": ["Advanced matching", "15 daily matches", "Read receipts", "Boost profile"]}', 15, 5, FALSE, TRUE),
('Executive', 3, 99.99, 999.99, '{"features": ["Executive matching", "25 daily matches", "Priority placement", "Meeting concierge"]}', 25, 10, TRUE, TRUE),
('C-Suite', 4, 199.99, 1999.99, '{"features": ["C-Suite exclusive", "Unlimited matches", "Personal matchmaker", "Luxury concierge", "Private events"]}', -1, -1, TRUE, TRUE);

-- STEP 5: CREATE AUTHENTICATION TRIGGER
-- ============================================

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    date_of_birth,
    age,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, '1990-01-01'::DATE),
    EXTRACT(YEAR FROM AGE(COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, '1990-01-01'::DATE)))::INTEGER,
    NOW(),
    NOW()
  );
  
  -- Also create professional profile
  INSERT INTO public.professional_profiles (
    user_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all user tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_icebreakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles for matching" ON users
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their professional profile" ON professional_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view matches they're part of" ON executive_matches
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "System can create matches" ON executive_matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their match actions" ON executive_matches
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can view conversations they're part of" ON conversations
  FOR ALL USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can view messages in their conversations" ON conversation_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON conversation_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can view their daily matches" ON daily_matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create daily matches" ON daily_matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their daily match actions" ON daily_matches
  FOR UPDATE USING (auth.uid() = user_id);

-- Make membership plans readable by all
CREATE POLICY "Membership plans are publicly readable" ON membership_plans
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);