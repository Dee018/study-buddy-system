-- Idempotent progress tables + module views helper
-- Safe to run multiple times in Supabase SQL editor

-- Create minimal progress tables only if they are missing (schema-final.sql contains full definitions)
-- These are minimal definitions required so REST endpoints and triggers referencing them won't fail.

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  total_xp INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  lesson_title TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id, lesson_id)
);

-- Create module_definitions view if missing. Prefer existing tables `modules` or `curriculum_modules`.
DO $$
BEGIN
  IF to_regclass('public.module_definitions') IS NULL THEN
    IF to_regclass('public.modules') IS NOT NULL THEN
      EXECUTE 'CREATE OR REPLACE VIEW public.module_definitions AS SELECT id, title, description, track, xp_reward, order_index FROM public.modules';
    ELSIF to_regclass('public.curriculum_modules') IS NOT NULL THEN
      EXECUTE 'CREATE OR REPLACE VIEW public.module_definitions AS SELECT id, title, description, track, xp_reward, order_index FROM public.curriculum_modules';
    ELSE
      -- Create an empty safe view so references succeed but return no rows
      EXECUTE 'CREATE OR REPLACE VIEW public.module_definitions AS SELECT ''unknown''::text AS id, ''''::text AS title WHERE FALSE';
    END IF;
    EXECUTE 'GRANT SELECT ON public.module_definitions TO anon';
    EXECUTE 'GRANT SELECT ON public.module_definitions TO authenticated';
  END IF;
END$$;

-- Ensure PostgREST exposes the tables to the anon role where appropriate.
-- Grant minimal privileges to anon/authenticated for these tables if they exist.
DO $$
BEGIN
  IF to_regclass('public.lesson_completions') IS NOT NULL THEN
    EXECUTE 'GRANT INSERT, SELECT ON public.lesson_completions TO anon';
    EXECUTE 'GRANT INSERT, SELECT ON public.lesson_completions TO authenticated';
  END IF;
  IF to_regclass('public.module_progress') IS NOT NULL THEN
    EXECUTE 'GRANT INSERT, UPDATE, SELECT ON public.module_progress TO anon';
    EXECUTE 'GRANT INSERT, UPDATE, SELECT ON public.module_progress TO authenticated';
  END IF;
  IF to_regclass('public.user_progress') IS NOT NULL THEN
    EXECUTE 'GRANT SELECT, UPDATE ON public.user_progress TO anon';
    EXECUTE 'GRANT SELECT, UPDATE ON public.user_progress TO authenticated';
  END IF;
END$$;

-- Helpful note: after running this file in Supabase, re-run your POST to /rest/v1/lesson_completions
-- and inspect errors. If you still see permission/404, check Supabase RLS policies and the project's REST URL and API key.
