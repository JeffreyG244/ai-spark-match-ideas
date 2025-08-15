-- Fix swipe_actions foreign key constraint issue
-- The swipe_actions table references 'users' table but dating profiles use auth.users IDs
-- We need to remove the foreign key constraint that's causing the error

-- First, remove existing foreign key constraint if it exists
ALTER TABLE swipe_actions DROP CONSTRAINT IF EXISTS swipe_actions_swiped_user_id_fkey;
ALTER TABLE swipe_actions DROP CONSTRAINT IF EXISTS swipe_actions_swiper_id_fkey;

-- Add zipcode support to cities_states table for better location matching
ALTER TABLE cities_states ADD COLUMN IF NOT EXISTS zipcode TEXT;

-- Create unique index for cities_states to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_cities_states_unique 
ON cities_states (city, state, state_code);

-- Add Arnold, MO and other missing cities with zipcode 63010
INSERT INTO cities_states (city, state, state_code, zipcode, country) 
SELECT 'Arnold', 'Missouri', 'MO', '63010', 'United States'
WHERE NOT EXISTS (SELECT 1 FROM cities_states WHERE city = 'Arnold' AND state = 'Missouri');

INSERT INTO cities_states (city, state, state_code, zipcode, country) 
SELECT 'Imperial', 'Missouri', 'MO', '63052', 'United States'
WHERE NOT EXISTS (SELECT 1 FROM cities_states WHERE city = 'Imperial' AND state = 'Missouri');

INSERT INTO cities_states (city, state, state_code, zipcode, country) 
SELECT 'Festus', 'Missouri', 'MO', '63028', 'United States'
WHERE NOT EXISTS (SELECT 1 FROM cities_states WHERE city = 'Festus' AND state = 'Missouri');

INSERT INTO cities_states (city, state, state_code, zipcode, country) 
SELECT 'Crystal City', 'Missouri', 'MO', '63019', 'United States'
WHERE NOT EXISTS (SELECT 1 FROM cities_states WHERE city = 'Crystal City' AND state = 'Missouri');

INSERT INTO cities_states (city, state, state_code, zipcode, country) 
SELECT 'Hillsboro', 'Missouri', 'MO', '63050', 'United States'
WHERE NOT EXISTS (SELECT 1 FROM cities_states WHERE city = 'Hillsboro' AND state = 'Missouri');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cities_states_zipcode ON cities_states(zipcode);
CREATE INDEX IF NOT EXISTS idx_swipe_actions_composite ON swipe_actions(swiper_id, swiped_user_id);