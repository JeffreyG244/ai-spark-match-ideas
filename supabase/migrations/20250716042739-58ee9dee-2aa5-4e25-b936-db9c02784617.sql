-- Update membership plans with new pricing and features
-- First, delete existing plans
DELETE FROM membership_plans;

-- Insert new plans with updated pricing and comprehensive dating features
INSERT INTO membership_plans (name, monthly_price, annual_price, features, highlight_color, is_popular, paypal_plan_id) VALUES 
(
  'Free',
  0.00,
  0.00,
  '{
    "swipes": {"daily_limit": 20, "unlimited": false},
    "messaging": "matches_only",
    "super_likes": 1,
    "boosts": 0,
    "rewind": false,
    "advanced_filters": false,
    "see_likes": false,
    "priority": false,
    "incognito": false,
    "travel_mode": false,
    "profile_verification": false,
    "read_receipts": false,
    "video_chat": false,
    "ai_recommendations": false
  }',
  '#10B981',
  false,
  null
),
(
  'Plus',
  29.00,
  290.00,
  '{
    "swipes": {"unlimited": true},
    "messaging": {"credits": 100},
    "super_likes": 5,
    "boosts": 1,
    "rewind": true,
    "advanced_filters": true,
    "see_likes": false,
    "priority": false,
    "incognito": false,
    "travel_mode": false,
    "profile_verification": true,
    "read_receipts": true,
    "video_chat": false,
    "ai_recommendations": true,
    "passport": false
  }',
  '#7C3AED',
  true,
  null
),
(
  'Premium',
  49.00,
  490.00,
  '{
    "swipes": {"unlimited": true},
    "messaging": "unlimited",
    "super_likes": {"unlimited": true},
    "boosts": 3,
    "rewind": true,
    "advanced_filters": true,
    "see_likes": true,
    "priority": true,
    "incognito": true,
    "travel_mode": true,
    "profile_verification": true,
    "read_receipts": true,
    "video_chat": true,
    "ai_recommendations": true,
    "passport": true,
    "priority_likes": true
  }',
  '#F59E0B',
  false,
  null
),
(
  'VIP',
  69.00,
  690.00,
  '{
    "swipes": {"unlimited": true},
    "messaging": "unlimited",
    "super_likes": {"unlimited": true},
    "boosts": {"unlimited": true},
    "rewind": true,
    "advanced_filters": true,
    "see_likes": true,
    "priority": true,
    "incognito": true,
    "travel_mode": true,
    "profile_verification": true,
    "read_receipts": true,
    "video_chat": true,
    "ai_recommendations": true,
    "passport": true,
    "priority_likes": true,
    "personal_matchmaker": true,
    "exclusive_events": true,
    "dating_coach": true,
    "vip_support": true
  }',
  '#8B5CF6',
  false,
  null
);