-- Create compatibility answers for all existing seed profiles in dating_profiles
INSERT INTO compatibility_answers (user_id, answers, completed_at, updated_at)
SELECT 
  dp.user_id,
  jsonb_build_object(
    -- Map gender to compatibility question format
    '7', CASE 
      WHEN dp.gender = 'Male' THEN 'Male'
      WHEN dp.gender = 'Female' THEN 'Female'  
      WHEN dp.gender = 'Non-binary' THEN 'Non-binary'
      ELSE 'Male'
    END,
    -- Map partner preferences to seeking format  
    '12', CASE 
      WHEN dp.partner_preferences ILIKE '%women%' OR dp.partner_preferences ILIKE '%female%' THEN 'Women'
      WHEN dp.partner_preferences ILIKE '%men%' OR dp.partner_preferences ILIKE '%male%' THEN 'Men'
      WHEN dp.partner_preferences ILIKE '%non-binary%' THEN 'Non-binary'
      WHEN dp.partner_preferences ILIKE '%everyone%' OR dp.partner_preferences ILIKE '%all%' THEN 'Everyone'
      ELSE 'Everyone'
    END,
    -- Add some random personality traits for better matching
    'social_energy', (ARRAY['alone', 'social', 'balanced'])[floor(random() * 3 + 1)],
    'decision_making', (ARRAY['logical', 'emotional', 'collaborative'])[floor(random() * 3 + 1)],
    'lifestyle_pace', (ARRAY['adventurous', 'balanced', 'peaceful'])[floor(random() * 3 + 1)],
    'conflict_style', (ARRAY['direct', 'diplomatic', 'space'])[floor(random() * 3 + 1)],
    'future_planning', (ARRAY['planner', 'flexible', 'spontaneous'])[floor(random() * 3 + 1)],
    'love_language', (ARRAY['words', 'time', 'touch', 'acts', 'gifts'])[floor(random() * 5 + 1)]
  ) as answers,
  now() as completed_at,
  now() as updated_at
FROM dating_profiles dp
WHERE dp.user_id NOT IN (SELECT user_id FROM compatibility_answers);