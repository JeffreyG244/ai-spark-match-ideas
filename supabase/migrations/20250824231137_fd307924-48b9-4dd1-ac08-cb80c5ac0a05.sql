-- Enable RLS on tables that don't have it enabled
-- This addresses the RLS Disabled in Public security warning

-- Check if user_interests table exists and enable RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_interests') THEN
        ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Check if user_password_history table exists and enable RLS  
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_password_history') THEN
        ALTER TABLE public.user_password_history ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS policies for user_password_history if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_password_history') THEN
        -- Create policy for users to view their own password history
        CREATE POLICY "Users can view own password history" ON public.user_password_history
        FOR SELECT USING (auth.uid() = user_id);
        
        -- System can insert password history
        CREATE POLICY "System can insert password history" ON public.user_password_history
        FOR INSERT WITH CHECK (true);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Policy already exists, skip
        NULL;
END $$;