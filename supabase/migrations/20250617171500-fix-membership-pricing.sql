
-- Update membership plans with correct pricing
UPDATE public.membership_plans 
SET monthly_price = 24.99, annual_price = 19.99 
WHERE name = 'Plus';

UPDATE public.membership_plans 
SET monthly_price = 49.99, annual_price = 39.99 
WHERE name = 'Premium';
