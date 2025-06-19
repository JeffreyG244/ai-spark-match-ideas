
-- Create swipe actions table to track user swipes
CREATE TABLE public.swipe_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swiper_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('like', 'pass')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, swiped_user_id)
);

-- Create matches table for mutual likes
CREATE TABLE public.user_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score integer NOT NULL DEFAULT 0,
  matched_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

-- Create daily match suggestions table
CREATE TABLE public.daily_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score integer NOT NULL DEFAULT 0,
  suggested_date date NOT NULL DEFAULT CURRENT_DATE,
  viewed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, suggested_user_id, suggested_date)
);

-- Enable RLS on all tables
ALTER TABLE public.swipe_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_matches ENABLE ROW LEVEL SECURITY;

-- RLS policies for swipe_actions
CREATE POLICY "Users can view their own swipe actions" ON public.swipe_actions
  FOR SELECT USING (swiper_id = auth.uid());

CREATE POLICY "Users can create their own swipe actions" ON public.swipe_actions
  FOR INSERT WITH CHECK (swiper_id = auth.uid());

-- RLS policies for user_matches
CREATE POLICY "Users can view their matches" ON public.user_matches
  FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- RLS policies for daily_matches
CREATE POLICY "Users can view their daily matches" ON public.daily_matches
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their daily matches" ON public.daily_matches
  FOR UPDATE USING (user_id = auth.uid());

-- Function to calculate compatibility score based on profile data
CREATE OR REPLACE FUNCTION public.calculate_compatibility_score(user1_id uuid, user2_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user1_profile record;
  user2_profile record;
  score integer := 0;
  common_interests integer := 0;
  personality_match integer := 0;
BEGIN
  -- Get both user profiles
  SELECT * INTO user1_profile FROM user_profiles WHERE user_id = user1_id;
  SELECT * INTO user2_profile FROM user_profiles WHERE user_id = user2_id;
  
  IF user1_profile IS NULL OR user2_profile IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate common interests (up to 40 points)
  IF user1_profile.interests IS NOT NULL AND user2_profile.interests IS NOT NULL THEN
    SELECT COUNT(*) INTO common_interests
    FROM unnest(user1_profile.interests) AS interest
    WHERE interest = ANY(user2_profile.interests);
    
    score := score + LEAST(common_interests * 8, 40);
  END IF;
  
  -- Basic profile completeness bonus (up to 30 points)
  IF user1_profile.bio IS NOT NULL AND user2_profile.bio IS NOT NULL THEN
    score := score + 15;
  END IF;
  
  IF user1_profile.values IS NOT NULL AND user2_profile.values IS NOT NULL THEN
    score := score + 15;
  END IF;
  
  -- Personality answers compatibility (up to 30 points)
  IF user1_profile.personality_answers IS NOT NULL AND user2_profile.personality_answers IS NOT NULL THEN
    -- Simple compatibility based on similar answers
    SELECT COUNT(*) INTO personality_match
    FROM jsonb_each_text(user1_profile.personality_answers) u1
    JOIN jsonb_each_text(user2_profile.personality_answers) u2 ON u1.key = u2.key
    WHERE u1.value = u2.value;
    
    score := score + LEAST(personality_match * 5, 30);
  END IF;
  
  RETURN LEAST(score, 100); -- Cap at 100
END;
$$;

-- Function to create a match when both users like each other
CREATE OR REPLACE FUNCTION public.handle_swipe_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mutual_like boolean := false;
  compatibility integer := 0;
BEGIN
  -- Only process likes
  IF NEW.action = 'like' THEN
    -- Check if the other user has also liked this user
    SELECT EXISTS(
      SELECT 1 FROM swipe_actions 
      WHERE swiper_id = NEW.swiped_user_id 
      AND swiped_user_id = NEW.swiper_id 
      AND action = 'like'
    ) INTO mutual_like;
    
    -- If mutual like, create a match
    IF mutual_like THEN
      -- Calculate compatibility score
      SELECT calculate_compatibility_score(NEW.swiper_id, NEW.swiped_user_id) INTO compatibility;
      
      -- Create match (ensure consistent ordering)
      INSERT INTO user_matches (user1_id, user2_id, compatibility_score)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_user_id),
        GREATEST(NEW.swiper_id, NEW.swiped_user_id),
        compatibility
      )
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic match creation
CREATE TRIGGER handle_swipe_action_trigger
  AFTER INSERT ON public.swipe_actions
  FOR EACH ROW EXECUTE FUNCTION public.handle_swipe_action();

-- Function to generate daily match suggestions
CREATE OR REPLACE FUNCTION public.generate_daily_matches(target_user_id uuid, match_count integer DEFAULT 5)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert daily matches for users not already swiped on today
  INSERT INTO daily_matches (user_id, suggested_user_id, compatibility_score)
  SELECT 
    target_user_id,
    up.user_id,
    calculate_compatibility_score(target_user_id, up.user_id)
  FROM user_profiles up
  WHERE up.user_id != target_user_id
    AND up.user_id NOT IN (
      -- Exclude users already swiped on
      SELECT swiped_user_id FROM swipe_actions 
      WHERE swiper_id = target_user_id
    )
    AND up.user_id NOT IN (
      -- Exclude users already suggested today
      SELECT suggested_user_id FROM daily_matches 
      WHERE user_id = target_user_id 
      AND suggested_date = CURRENT_DATE
    )
  ORDER BY calculate_compatibility_score(target_user_id, up.user_id) DESC
  LIMIT match_count
  ON CONFLICT (user_id, suggested_user_id, suggested_date) DO NOTHING;
END;
$$;
