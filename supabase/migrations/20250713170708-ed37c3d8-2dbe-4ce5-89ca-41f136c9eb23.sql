-- User Verification System Tables
CREATE TABLE public.user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMP WITH TIME ZONE,
  photo_verified BOOLEAN DEFAULT false,
  photo_verified_at TIMESTAMP WITH TIME ZONE,
  identity_verified BOOLEAN DEFAULT false,
  identity_verified_at TIMESTAMP WITH TIME ZONE,
  social_media_linked JSONB DEFAULT '{}',
  verification_documents JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Reports System
CREATE TABLE public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Enhanced Messages with Media and Reactions
CREATE TABLE public.message_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'voice', 'video')),
  media_url TEXT NOT NULL,
  duration INTEGER, -- for voice/video messages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL, -- emoji or reaction type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id, reaction)
);

-- Profile Badges System
CREATE TABLE public.profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('verified', 'premium', 'early_adopter', 'top_rated', 'active_user')),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, badge_type)
);

-- Success Stories
CREATE TABLE public.success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  photo_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Analytics and Insights
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_matches INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  photos_liked INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content Moderation
CREATE TABLE public.content_moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('profile', 'photo', 'message', 'bio')),
  content_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_text TEXT,
  content_url TEXT,
  ai_score DECIMAL(3,2), -- 0.00 to 1.00
  ai_flags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Emergency Contacts
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- User Verifications
CREATE POLICY "Users can view their own verifications" ON public.user_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own verifications" ON public.user_verifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own verifications" ON public.user_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Reports
CREATE POLICY "Users can view their own reports" ON public.user_reports FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() = reported_user_id);
CREATE POLICY "Users can create reports" ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Message Media
CREATE POLICY "Users can view media in their conversations" ON public.message_media FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_messages cm
    JOIN conversations c ON cm.conversation_id = c.id
    WHERE cm.id = message_media.message_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

-- Message Reactions
CREATE POLICY "Users can view reactions in their conversations" ON public.message_reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_messages cm
    JOIN conversations c ON cm.conversation_id = c.id
    WHERE cm.id = message_reactions.message_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);
CREATE POLICY "Users can add reactions" ON public.message_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their reactions" ON public.message_reactions FOR DELETE USING (auth.uid() = user_id);

-- Profile Badges
CREATE POLICY "Anyone can view badges" ON public.profile_badges FOR SELECT USING (true);

-- Success Stories
CREATE POLICY "Anyone can view approved stories" ON public.success_stories FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can submit their own stories" ON public.success_stories FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- User Analytics
CREATE POLICY "Users can view their own analytics" ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);

-- Emergency Contacts
CREATE POLICY "Users can manage their emergency contacts" ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id);