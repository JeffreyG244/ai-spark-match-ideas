
-- Update membership plans with correct monthly pricing only
-- The annual_price is a generated column and will be calculated automatically
UPDATE public.membership_plans 
SET monthly_price = 24.99 
WHERE name = 'Plus';

UPDATE public.membership_plans 
SET monthly_price = 49.99 
WHERE name = 'Premium';
