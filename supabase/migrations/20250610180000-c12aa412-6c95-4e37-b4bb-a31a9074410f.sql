
-- Update membership plan pricing
UPDATE membership_plans 
SET monthly_price = 24.99
WHERE name = 'Plus';

UPDATE membership_plans 
SET monthly_price = 49.99
WHERE name = 'Premium';
