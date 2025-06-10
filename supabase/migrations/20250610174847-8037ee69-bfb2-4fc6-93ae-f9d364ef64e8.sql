
-- First, let's update existing plans
UPDATE membership_plans 
SET features = '{
  "swipes": {"daily_limit": 20, "unlimited": false},
  "messaging": "matches_only",
  "super_likes": 1,
  "boosts": 0,
  "advanced_filters": false,
  "see_likes": false,
  "rewind": false,
  "priority": false,
  "incognito": false,
  "travel_mode": false
}'::jsonb,
monthly_price = 0,
highlight_color = '#6B7280',
is_popular = false
WHERE name = 'Free';

UPDATE membership_plans 
SET features = '{
  "swipes": {"unlimited": true},
  "messaging": {"credits": 50},
  "super_likes": 5,
  "boosts": 1,
  "advanced_filters": true,
  "see_likes": false,
  "rewind": true,
  "priority": false,
  "incognito": false,
  "travel_mode": false
}'::jsonb,
monthly_price = 9.99,
highlight_color = '#7C3AED',
is_popular = true
WHERE name = 'Plus';

UPDATE membership_plans 
SET features = '{
  "swipes": {"unlimited": true},
  "messaging": "unlimited",
  "super_likes": {"unlimited": true},
  "boosts": {"unlimited": true},
  "advanced_filters": true,
  "see_likes": true,
  "rewind": true,
  "priority": true,
  "incognito": true,
  "travel_mode": true
}'::jsonb,
monthly_price = 19.99,
highlight_color = '#F59E0B',
is_popular = false
WHERE name = 'Premium';

-- Insert plans that don't exist yet
INSERT INTO membership_plans (name, monthly_price, features, highlight_color, is_popular)
SELECT 'Free', 0, '{
  "swipes": {"daily_limit": 20, "unlimited": false},
  "messaging": "matches_only",
  "super_likes": 1,
  "boosts": 0,
  "advanced_filters": false,
  "see_likes": false,
  "rewind": false,
  "priority": false,
  "incognito": false,
  "travel_mode": false
}'::jsonb, '#6B7280', false
WHERE NOT EXISTS (SELECT 1 FROM membership_plans WHERE name = 'Free');

INSERT INTO membership_plans (name, monthly_price, features, highlight_color, is_popular)
SELECT 'Plus', 9.99, '{
  "swipes": {"unlimited": true},
  "messaging": {"credits": 50},
  "super_likes": 5,
  "boosts": 1,
  "advanced_filters": true,
  "see_likes": false,
  "rewind": true,
  "priority": false,
  "incognito": false,
  "travel_mode": false
}'::jsonb, '#7C3AED', true
WHERE NOT EXISTS (SELECT 1 FROM membership_plans WHERE name = 'Plus');

INSERT INTO membership_plans (name, monthly_price, features, highlight_color, is_popular)
SELECT 'Premium', 19.99, '{
  "swipes": {"unlimited": true},
  "messaging": "unlimited",
  "super_likes": {"unlimited": true},
  "boosts": {"unlimited": true},
  "advanced_filters": true,
  "see_likes": true,
  "rewind": true,
  "priority": true,
  "incognito": true,
  "travel_mode": true
}'::jsonb, '#F59E0B', false
WHERE NOT EXISTS (SELECT 1 FROM membership_plans WHERE name = 'Premium');
