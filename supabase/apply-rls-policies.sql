-- =====================================================
-- Apply RLS Policies for Adkar Champ
-- =====================================================
-- Run this in Supabase SQL Editor to add DELETE policies
-- =====================================================

-- Add DELETE policy for adkar_streaks (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'adkar_streaks' 
        AND policyname = 'Users can delete their own streaks'
    ) THEN
        CREATE POLICY "Users can delete their own streaks"
          ON public.adkar_streaks
          FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);
        RAISE NOTICE 'Created DELETE policy for adkar_streaks';
    ELSE
        RAISE NOTICE 'DELETE policy for adkar_streaks already exists';
    END IF;
END $$;

-- Add DELETE policy for user_preferences (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_preferences' 
        AND policyname = 'Users can delete their own preferences'
    ) THEN
        CREATE POLICY "Users can delete their own preferences"
          ON public.user_preferences
          FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);
        RAISE NOTICE 'Created DELETE policy for user_preferences';
    ELSE
        RAISE NOTICE 'DELETE policy for user_preferences already exists';
    END IF;
END $$;

-- Verify RLS is enabled
DO $$ 
BEGIN
    -- Check adkar_streaks
    IF EXISTS (
        SELECT 1 FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE t.schemaname = 'public' 
        AND t.tablename = 'adkar_streaks'
        AND c.relrowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS is ENABLED for adkar_streaks ✓';
    ELSE
        RAISE NOTICE 'RLS is DISABLED for adkar_streaks ✗';
    END IF;

    -- Check user_preferences
    IF EXISTS (
        SELECT 1 FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE t.schemaname = 'public' 
        AND t.tablename = 'user_preferences'
        AND c.relrowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS is ENABLED for user_preferences ✓';
    ELSE
        RAISE NOTICE 'RLS is DISABLED for user_preferences ✗';
    END IF;
END $$;

-- List all policies for verification
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    roles,
    qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('adkar_streaks', 'user_preferences')
ORDER BY tablename, cmd;

