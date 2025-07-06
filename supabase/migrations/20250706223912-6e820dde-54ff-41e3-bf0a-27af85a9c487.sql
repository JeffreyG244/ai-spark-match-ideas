-- Create compatibility answers for the real user to enable matching
INSERT INTO compatibility_answers (user_id, answers, completed_at, updated_at)
VALUES (
  '768aa1a7-ee6a-40b4-b704-0eaf4c8443e1',
  jsonb_build_object(
    '7', 'Male',  -- User's gender
    '12', 'Women', -- Seeking women
    'social_energy', 'balanced',
    'decision_making', 'logical', 
    'lifestyle_pace', 'balanced',
    'conflict_style', 'direct',
    'future_planning', 'planner',
    'love_language', 'time'
  ),
  now(),
  now()
);