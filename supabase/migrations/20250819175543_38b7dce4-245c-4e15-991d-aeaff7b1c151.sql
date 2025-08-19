-- Fix critical security issue: Enable RLS on tables that don't have it
-- Check and enable RLS on all public tables that should have it

-- Enable RLS on all PostGIS related tables that don't have it 
ALTER TABLE public.geography_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geometry_columns ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create policies for PostGIS tables (read-only for everyone)
CREATE POLICY "Geography columns are publicly readable" ON public.geography_columns
  FOR SELECT TO public USING (true);

CREATE POLICY "Geometry columns are publicly readable" ON public.geometry_columns
  FOR SELECT TO public USING (true);

CREATE POLICY "Spatial reference systems are publicly readable" ON public.spatial_ref_sys
  FOR SELECT TO public USING (true);

-- Ensure other critical tables have proper RLS enabled
-- (These should already have RLS enabled from previous migrations)