-- Enable Row Level Security on spatial_ref_sys table
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to spatial reference systems
-- This table contains reference data that should be readable by all users
CREATE POLICY "Allow public read access to spatial reference systems" 
ON public.spatial_ref_sys 
FOR SELECT 
TO authenticated, anon
USING (true);

-- Create policy to prevent unauthorized modifications
-- Only superusers should be able to modify spatial reference systems
CREATE POLICY "Restrict modifications to spatial reference systems" 
ON public.spatial_ref_sys 
FOR ALL 
TO authenticated
USING (false)
WITH CHECK (false);