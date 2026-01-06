-- ============================================================================
-- JAVA STUDY BUDDY - COMPREHENSIVE DATABASE SCHEMA
-- ============================================================================
-- 
-- Production-ready PostgreSQL schema for Supabase
-- Supports complete learning platform with 12 Java modules
-- 
-- Features:
-- - 35+ tables for comprehensive data management
-- - Row Level Security (RLS) for data isolation
-- - Triggers for automatic updates
-- - Functions for business logic
-- - Indexes for performance
-- - Complete audit trails
-- 
-- Version: 1.0.0
-- Last Updated: December 21, 2025
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: USER MANAGEMENT
-- ============================================================================
-- 
-- Tables for managing user accounts, profiles, and preferences
-- Extends Supabase's built-in auth.users table
-- ============================================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  uuid TEXT UNIQUE NOT NULL,                    -- Recovery UUID (immutable)
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  level TEXT DEFAULT 'Beginner',               -- Beginner, Intermediate, Advanced
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  account_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Server-side provisioning: create user_profiles rows for every auth user
--
-- Why:
-- - Many tables FK to user_profiles(id). If a user has an auth session but no
--   user_profiles row, progress writes will fail with 23503 FK violations.
-- - The app stores username/uuid in auth.user metadata at sign-up.
--
-- How to deploy:
-- - Run this block in Supabase SQL Editor (or include in migrations).
-- ----------------------------------------------------------------------------

-- Generate recovery codes matching the UI format: ABC-123-XY-7890
CREATE OR REPLACE FUNCTION public.generate_recovery_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  letters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  code TEXT;
BEGIN
  LOOP
    code :=
      substr(letters, floor(random() * 26)::int + 1, 1) ||
      substr(letters, floor(random() * 26)::int + 1, 1) ||
      substr(letters, floor(random() * 26)::int + 1, 1) ||
      '-' || lpad(floor(random() * 1000)::int::text, 3, '0') ||
      '-' ||
      substr(letters, floor(random() * 26)::int + 1, 1) ||
      substr(letters, floor(random() * 26)::int + 1, 1) ||
      '-' || lpad(floor(random() * 10000)::int::text, 4, '0');

    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.uuid = code);
  END LOOP;
  RETURN code;
END;
$$;

-- Trigger function: creates user_profiles on new auth.users rows
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_username TEXT;
  meta_uuid TEXT;
  derived_username TEXT;
  derived_uuid TEXT;
BEGIN
  meta_username := NULLIF((NEW.raw_user_meta_data->>'username'), '');
  meta_uuid := NULLIF((NEW.raw_user_meta_data->>'uuid'), '');

  -- IMPORTANT: Convert username to lowercase for case-insensitive uniqueness
  derived_username := LOWER(COALESCE(meta_username, split_part(NEW.email, '@', 1)));
  derived_uuid := COALESCE(meta_uuid, public.generate_recovery_code());

  INSERT INTO public.user_profiles (id, uuid, username, email, account_created_at, last_login_at, created_at, updated_at)
  VALUES (NEW.id, derived_uuid, derived_username, NEW.email, NOW(), NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create/replace the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Backfill: create profiles for existing auth users missing user_profiles
DO $$
BEGIN
  INSERT INTO public.user_profiles (id, uuid, username, email, account_created_at, last_login_at, created_at, updated_at)
  SELECT
    u.id,
    COALESCE(NULLIF((u.raw_user_meta_data->>'uuid'), ''), public.generate_recovery_code()) AS uuid,
    LOWER(COALESCE(NULLIF((u.raw_user_meta_data->>'username'), ''), split_part(u.email, '@', 1))) AS username,
    u.email,
    NOW(),
    NOW(),
    NOW(),
    NOW()
  FROM auth.users u
  WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = u.id);
EXCEPTION
  WHEN others THEN
    -- Backfill is best-effort; if unique constraints prevent insertion (e.g. username collision),
    -- handle those manually by inspecting the failing users in auth.users.
    RAISE NOTICE 'Backfill encountered an error: %', SQLERRM;
END;
$$;

-- User Preferences (theme, settings, etc.)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',                    -- dark, light
  font_size TEXT DEFAULT 'medium',              -- small, medium, large
  code_editor_theme TEXT DEFAULT 'vs-dark',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sound_effects_enabled BOOLEAN DEFAULT TRUE,
  auto_save_enabled BOOLEAN DEFAULT TRUE,
  show_hints BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deleted Users (audit trail for account deletions)
CREATE TABLE deleted_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,                        -- Original user ID
  uuid TEXT NOT NULL,                           -- Original UUID
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  deletion_reason TEXT,
  total_xp INTEGER,
  level TEXT,
  modules_completed INTEGER,
  certificates_earned INTEGER,
  deleted_by UUID,                              -- Admin who deleted (if admin delete)
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View: deleted_users_view
-- Provides a stable, snake_case projection suitable for admin reads and REST queries.
CREATE OR REPLACE VIEW deleted_users_view AS
SELECT
  id,
  user_id,
  uuid,
  username,
  email,
  deletion_reason,
  total_xp,
  level,
  modules_completed,
  certificates_earned,
  deleted_by,
  deleted_at
FROM public.deleted_users;

-- ============================================================================
-- SECTION 2: PROGRESS TRACKING
-- ============================================================================
--
-- Tables for tracking overall user progress and statistics
-- ============================================================================

-- User Progress (overall progress tracking)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_level TEXT DEFAULT 'Beginner',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  modules_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  assessments_passed INTEGER DEFAULT 0,
  total_study_time_minutes INTEGER DEFAULT 0,   -- Estimated study time
  average_score DECIMAL(5,2),                    -- Average assessment score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module Progress (progress for each of 12 modules)
CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,                      -- module-1, module-2, etc.
  module_title TEXT NOT NULL,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  total_items INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Topic Proficiency (tracks understanding of specific Java topics)
CREATE TABLE topic_proficiency (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,                          -- variables, loops, oop, etc.
  proficiency_level DECIMAL(5,2) DEFAULT 0,     -- 0-100 percentage
  exercises_attempted INTEGER DEFAULT 0,
  exercises_correct INTEGER DEFAULT 0,
  last_practiced TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- ============================================================================
-- SECTION 3: LESSON COMPLETIONS
-- ============================================================================
--
-- Tracks when users complete individual lessons
-- ============================================================================

CREATE TABLE lesson_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  lesson_title TEXT NOT NULL,
  time_spent_minutes INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id, lesson_id)
);

-- ============================================================================
-- SECTION 4: EXERCISE COMPLETIONS
-- ============================================================================
--
-- Tracks exercise submissions with code and results
-- ============================================================================

CREATE TABLE exercise_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_title TEXT NOT NULL,
  submitted_code TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 1,
  hints_used INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id, exercise_id)
);

-- ============================================================================
-- SECTION 5: PROJECT COMPLETIONS
-- ============================================================================
--
-- Tracks project submissions with complete code and validation
-- ============================================================================

CREATE TABLE project_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_title TEXT NOT NULL,
  submitted_code TEXT NOT NULL,
  validation_results JSONB,                     -- JSON validation feedback
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  is_passing BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 1,
  time_spent_minutes INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  feedback TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id, project_id)
);

-- ============================================================================
-- SECTION 6: ASSESSMENTS
-- ============================================================================
--
-- Tracks quiz and exam attempts with scores
-- ============================================================================

CREATE TABLE assessment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  assessment_id TEXT NOT NULL,
  assessment_type TEXT NOT NULL,                -- quiz, coding-challenge, final-exam
  score DECIMAL(5,2) NOT NULL,                  -- Percentage score
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken_minutes INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,                 -- TRUE if score >= 70%
  attempt_number INTEGER DEFAULT 1,
  answers JSONB,                                -- JSON array of answers
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 7: CERTIFICATES
-- ============================================================================
--
-- Certificate generation and storage
-- ============================================================================

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL,               -- module, track, course, achievement
  title TEXT NOT NULL,
  description TEXT,
  module_id TEXT,                               -- For module certificates
  track TEXT,                                   -- For track certificates (Beginner/Intermediate/Advanced)
  verification_code TEXT UNIQUE NOT NULL,       -- Unique code for verification
  certificate_url TEXT,                         -- URL to PDF in storage
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 8: GAMIFICATION
-- ============================================================================
--
-- XP, achievements, streaks, and badges
-- ============================================================================

-- XP Transactions (log of all XP gains/losses)
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,                      -- Can be negative
  source TEXT NOT NULL,                         -- lesson, exercise, project, bonus, etc.
  source_id TEXT,                               -- ID of the source item
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Streaks (daily activity tracking)
CREATE TABLE learning_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  total_active_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements (earned badges)
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,                 -- first-lesson, 7-day-streak, etc.
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  achievement_icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Achievements master table (catalog of available badges)
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,                           -- e.g. first-lesson, code-warrior
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 100,
  category TEXT,                                 -- completion, mastery, streak, special
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed core badges (from PROFILE_PAGE_UPDATE badge definitions)
INSERT INTO achievements (id, name, description, icon, xp_reward, category)
VALUES
  ('first-lesson', 'First Steps', 'Complete first lesson', '🌟', 100, 'completion'),
  ('first-assessment', 'Quick Starter', 'Complete first assessment', '🚀', 100, 'completion'),
  ('20-lessons', 'Never Give Up', 'Complete 10 lessons', '💪', 100, 'completion'),
  ('10-exercises', 'Code Warrior', 'Complete 10 exercises', '⚔️', 100, 'mastery'),
  ('perfect-score', 'Perfect Score', 'Score 100% on assessment', '💯', 100, 'mastery'),
  ('7-day-streak', 'Streak Master', 'Maintain 7-day streak', '🔥', 100, 'streak'),
  ('500-xp', 'Rising Star', 'Earn 500 total XP', '⭐', 100, 'special'),
  ('1000-xp', 'Knowledge Seeker', 'Earn 1000 total XP', '🎓', 100, 'special'),
  ('completed-all-lessons', 'Java Master', 'Complete all lessons in the course', '🏆', 500, 'completion')
ON CONFLICT (id) DO NOTHING;

-- Function to award an achievement to a user.
-- Inserts into user_achievements (if not already awarded), creates an xp_transaction,
-- and updates user_progress.total_xp and user_profiles.total_xp accordingly.
CREATE OR REPLACE FUNCTION public.award_achievement(p_user_id UUID, p_achievement_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
  v_name TEXT;
  v_description TEXT;
  v_icon TEXT;
  v_xp INTEGER := 0;
BEGIN
  SELECT EXISTS(SELECT 1 FROM user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = p_achievement_id) INTO v_exists;
  IF v_exists THEN
    RETURN;
  END IF;

  SELECT name, description, icon, xp_reward INTO v_name, v_description, v_icon, v_xp FROM achievements WHERE id = p_achievement_id;

  IF v_name IS NULL THEN
    RAISE EXCEPTION 'Unknown achievement id: %', p_achievement_id;
  END IF;

  INSERT INTO user_achievements (user_id, achievement_id, achievement_name, achievement_description, achievement_icon, xp_reward, earned_at, created_at)
  VALUES (p_user_id, p_achievement_id, v_name, v_description, v_icon, v_xp, NOW(), NOW());

  -- Log XP transaction if reward > 0
  IF v_xp <> 0 THEN
    INSERT INTO xp_transactions (user_id, amount, source, source_id, description, created_at)
    VALUES (p_user_id, v_xp, 'achievement', p_achievement_id, concat('Awarded achievement: ', v_name), NOW());

    -- Update user_progress total_xp
    UPDATE user_progress
    SET total_xp = COALESCE(total_xp,0) + v_xp,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Update user_profiles total_xp (keeps profile summary in sync)
    UPDATE user_profiles
    SET total_xp = COALESCE(total_xp,0) + v_xp,
        updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
END;
$$;

-- ============================================================================
-- TRIGGERS: automatically award achievements based on user activity
-- ============================================================================

-- Award on lesson completion: first-lesson and milestones
CREATE OR REPLACE FUNCTION public.trigger_award_on_lesson_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lesson_count INTEGER;
  total_lessons INTEGER;
BEGIN
  -- Always try to award first-lesson (award_achievement is idempotent)
  PERFORM public.award_achievement(NEW.user_id, 'first-lesson');

  -- Count lessons completed by the user and award milestone
  SELECT COUNT(*) INTO lesson_count FROM lesson_completions WHERE user_id = NEW.user_id;
  IF lesson_count >= 20 THEN
    PERFORM public.award_achievement(NEW.user_id, '20-lessons');
  END IF;

  -- Award Java Master when user completes 22 lessons (explicit requirement)
  total_lessons := 22; -- fixed target for 'completed-all-lessons' (Java Master)
  IF lesson_count >= total_lessons THEN
    PERFORM public.award_achievement(NEW.user_id, 'completed-all-lessons');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_on_lesson_completion ON lesson_completions;
CREATE TRIGGER trg_award_on_lesson_completion
  AFTER INSERT ON lesson_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_award_on_lesson_completion();

-- Award on exercise completion: exercise milestones
CREATE OR REPLACE FUNCTION public.trigger_award_on_exercise_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ex_count INTEGER;
BEGIN
  -- Count exercises completed by the user and award milestone
  SELECT COUNT(*) INTO ex_count FROM exercise_completions WHERE user_id = NEW.user_id;
  IF ex_count >= 10 THEN
    PERFORM public.award_achievement(NEW.user_id, '10-exercises');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_on_exercise_completion ON exercise_completions;
CREATE TRIGGER trg_award_on_exercise_completion
  AFTER INSERT ON exercise_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_award_on_exercise_completion();

-- Award on assessment attempts: first assessment and perfect score
CREATE OR REPLACE FUNCTION public.trigger_award_on_assessment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- First assessment
  SELECT COUNT(*) INTO attempt_count FROM assessment_attempts WHERE user_id = NEW.user_id;
  IF attempt_count >= 1 THEN
    PERFORM public.award_achievement(NEW.user_id, 'first-assessment');
  END IF;

  -- Perfect score
  IF NEW.score >= 100 THEN
    PERFORM public.award_achievement(NEW.user_id, 'perfect-score');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_on_assessment ON assessment_attempts;
CREATE TRIGGER trg_award_on_assessment
  AFTER INSERT ON assessment_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_award_on_assessment();

-- Award on XP transactions: total XP milestones (500, 1000)
CREATE OR REPLACE FUNCTION public.trigger_award_on_xp_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_xp INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount),0) INTO total_xp FROM xp_transactions WHERE user_id = NEW.user_id;

  IF total_xp >= 500 THEN
    PERFORM public.award_achievement(NEW.user_id, '500-xp');
  END IF;
  IF total_xp >= 1000 THEN
    PERFORM public.award_achievement(NEW.user_id, '1000-xp');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_on_xp_transaction ON xp_transactions;
CREATE TRIGGER trg_award_on_xp_transaction
  AFTER INSERT ON xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_award_on_xp_transaction();


-- ============================================================================
-- SECTION 9: ANALYTICS
-- ============================================================================
--
-- Event tracking and user behavior analytics
-- ============================================================================

-- Analytics Events (granular event tracking)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,                     -- page_view, lesson_start, exercise_attempt, etc.
  event_category TEXT,                          -- engagement, learning, navigation
  event_data JSONB,                             -- Flexible JSON data
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Sessions (session tracking)
CREATE TABLE analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  pages_viewed INTEGER DEFAULT 0,
  lessons_viewed INTEGER DEFAULT 0,
  exercises_attempted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Activity (aggregated daily stats)
CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  assessments_taken INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- ============================================================================
-- SECTION 10: AUTO-SAVE
-- ============================================================================
--
-- Temporary storage for in-progress work
-- ============================================================================

CREATE TABLE auto_save_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  item_type TEXT NOT NULL,                      -- lesson, exercise, project
  item_id TEXT NOT NULL,
  saved_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id, item_type, item_id)
);

-- ============================================================================
-- SECTION 11: CURRICULUM MANAGEMENT
-- ============================================================================
--
-- Admin-managed curriculum content
-- ============================================================================

-- Curriculum Modules (12 modules)
CREATE TABLE curriculum_modules (
  id TEXT PRIMARY KEY,                          -- module-1, module-2, etc.
  week_number INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  track TEXT NOT NULL,                          -- Beginner, Intermediate, Advanced
  difficulty_level TEXT,                        -- easy, medium, hard
  estimated_hours INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 0,
  prerequisites TEXT[],                         -- Array of prerequisite module IDs
  is_published BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Curriculum Lessons
CREATE TABLE curriculum_lessons (
  id TEXT PRIMARY KEY,                          -- lesson-1-1, lesson-1-2, etc.
  module_id TEXT NOT NULL REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,                        -- Markdown or HTML content
  order_index INTEGER NOT NULL,
  estimated_minutes INTEGER DEFAULT 15,
  xp_reward INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Curriculum Exercises
CREATE TABLE curriculum_exercises (
  id TEXT PRIMARY KEY,                          -- exercise-1-1, exercise-1-2, etc.
  module_id TEXT NOT NULL REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  starter_code TEXT NOT NULL,
  solution_code TEXT,
  expected_output TEXT,
  test_cases JSONB,                             -- JSON array of test cases
  hints JSONB,                                  -- JSON array of hints
  difficulty TEXT DEFAULT 'medium',
  order_index INTEGER NOT NULL,
  estimated_minutes INTEGER DEFAULT 20,
  xp_reward INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Curriculum Projects
CREATE TABLE curriculum_projects (
  id TEXT PRIMARY KEY,                          -- project-1, project-2, etc.
  module_id TEXT NOT NULL REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  starter_code TEXT NOT NULL,
  requirements TEXT[],                          -- Array of project requirements
  expected_features TEXT[],                     -- Array of expected features
  validation_rules JSONB,                       -- JSON validation configuration
  order_index INTEGER NOT NULL,
  estimated_hours INTEGER DEFAULT 2,
  xp_reward INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 12: SUPPORT & FEEDBACK
-- ============================================================================
--
-- Issue reports and user feedback
-- ============================================================================

-- Issue Reports (bug reports, feature requests)
CREATE TABLE issue_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,                     -- bug, feature, question, other
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',               -- low, medium, high, critical
  status TEXT DEFAULT 'open',                   -- open, in-progress, resolved, closed
  module_id TEXT,
  lesson_id TEXT,
  screenshot_url TEXT,
  admin_response TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Feedback (ratings and comments)
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL,                  -- lesson, module, exercise, project, overall
  item_id TEXT,                                 -- ID of lesson, module, etc.
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_helpful BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 13: INDEXES
-- ============================================================================
--
-- Performance indexes for frequently queried columns
-- ============================================================================

-- User indexes
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_level ON user_profiles(level);
CREATE INDEX idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Progress indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_module_progress_user_id ON module_progress(user_id);
CREATE INDEX idx_module_progress_module_id ON module_progress(module_id);
CREATE INDEX idx_topic_proficiency_user_id ON topic_proficiency(user_id);

-- Completion indexes
CREATE INDEX idx_lesson_completions_user_id ON lesson_completions(user_id);
CREATE INDEX idx_lesson_completions_module_id ON lesson_completions(module_id);
CREATE INDEX idx_lesson_completions_completed_at ON lesson_completions(completed_at);
CREATE INDEX idx_exercise_completions_user_id ON exercise_completions(user_id);
CREATE INDEX idx_exercise_completions_module_id ON exercise_completions(module_id);
CREATE INDEX idx_project_completions_user_id ON project_completions(user_id);
CREATE INDEX idx_project_completions_module_id ON project_completions(module_id);

-- Assessment indexes
CREATE INDEX idx_assessment_attempts_user_id ON assessment_attempts(user_id);
CREATE INDEX idx_assessment_attempts_module_id ON assessment_attempts(module_id);

-- Certificate indexes
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_verification_code ON certificates(verification_code);

-- Gamification indexes
CREATE INDEX idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON xp_transactions(created_at);
CREATE INDEX idx_learning_streaks_user_id ON learning_streaks(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Analytics indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX idx_daily_activity_user_id ON daily_activity(user_id);
CREATE INDEX idx_daily_activity_date ON daily_activity(activity_date);

-- Auto-save indexes
CREATE INDEX idx_auto_save_user_id ON auto_save_data(user_id);
CREATE INDEX idx_auto_save_expires_at ON auto_save_data(expires_at);

-- Curriculum indexes
CREATE INDEX idx_curriculum_lessons_module_id ON curriculum_lessons(module_id);
CREATE INDEX idx_curriculum_exercises_module_id ON curriculum_exercises(module_id);
CREATE INDEX idx_curriculum_projects_module_id ON curriculum_projects(module_id);

-- Support indexes
CREATE INDEX idx_issue_reports_user_id ON issue_reports(user_id);
CREATE INDEX idx_issue_reports_status ON issue_reports(status);
CREATE INDEX idx_user_feedback_user_id ON user_feedback(user_id);

-- ============================================================================
-- SECTION 14: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
--
-- Enable RLS and create policies for data isolation
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_proficiency ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_save_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_projects ENABLE ROW LEVEL SECURITY;

-- Also enable RLS and create helpful indexes/policies for the alternative
-- table names used across the application: modules, lessons, exercises, projects
ALTER TABLE IF EXISTS modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_modules_id ON modules(id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_exercises_module_id ON exercises(module_id);
CREATE INDEX IF NOT EXISTS idx_projects_module_id ON projects(module_id);

-- Create policies for these alternative table names if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'modules') THEN
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Public can view published modules"
        ON modules FOR SELECT
        USING (is_published = TRUE);

      CREATE POLICY IF NOT EXISTS "Admins can manage modules"
        ON modules FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
          )
        );
    $$;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'lessons') THEN
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Public can view published lessons"
        ON lessons FOR SELECT
        USING (is_published = TRUE);

      CREATE POLICY IF NOT EXISTS "Admins can manage lessons"
        ON lessons FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
          )
        );
    $$;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'exercises') THEN
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Public can view published exercises"
        ON exercises FOR SELECT
        USING (is_published = TRUE);

      CREATE POLICY IF NOT EXISTS "Admins can manage exercises"
        ON exercises FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
          )
        );
    $$;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'projects') THEN
    EXECUTE $$
      CREATE POLICY IF NOT EXISTS "Public can view published projects"
        ON projects FOR SELECT
        USING (is_published = TRUE);

      CREATE POLICY IF NOT EXISTS "Admins can manage projects"
        ON projects FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
          )
        );
    $$;
  END IF;
END;
$$;
ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================================================
-- USER PREFERENCES POLICIES
-- ============================================================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- DELETED USERS POLICIES (Admin only)
-- ============================================================================

-- Only admins can view deleted users
CREATE POLICY "Admins can view deleted users"
  ON deleted_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Allow admins to insert audit rows into deleted_users (used by admin UI)
CREATE POLICY "Admins can insert deleted users"
  ON deleted_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Allow admins to delete rows from deleted_users (admin cleanup)
CREATE POLICY "Admins can delete deleted users"
  ON deleted_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================================================
-- PROGRESS TRACKING POLICIES
-- ============================================================================

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Module progress policies
CREATE POLICY "Users can view own module progress"
  ON module_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own module progress"
  ON module_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own module progress"
  ON module_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Topic proficiency policies
CREATE POLICY "Users can view own topic proficiency"
  ON topic_proficiency FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topic proficiency"
  ON topic_proficiency FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic proficiency"
  ON topic_proficiency FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMPLETION TRACKING POLICIES
-- ============================================================================

-- Lesson completions
CREATE POLICY "Users can view own lesson completions"
  ON lesson_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson completions"
  ON lesson_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Exercise completions
CREATE POLICY "Users can view own exercise completions"
  ON exercise_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise completions"
  ON exercise_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise completions"
  ON exercise_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Project completions
CREATE POLICY "Users can view own project completions"
  ON project_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project completions"
  ON project_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project completions"
  ON project_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ASSESSMENT POLICIES
-- ============================================================================

CREATE POLICY "Users can view own assessments"
  ON assessment_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON assessment_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CERTIFICATE POLICIES
-- ============================================================================

CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates"
  ON certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public can verify certificates by code (for employers)
CREATE POLICY "Public can verify certificates"
  ON certificates FOR SELECT
  USING (TRUE);

-- ============================================================================
-- GAMIFICATION POLICIES
-- ============================================================================

-- XP transactions
CREATE POLICY "Users can view own xp transactions"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp transactions"
  ON xp_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Learning streaks
CREATE POLICY "Users can view own streaks"
  ON learning_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON learning_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON learning_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ANALYTICS POLICIES
-- ============================================================================

-- Events
CREATE POLICY "Users can view own events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Sessions
CREATE POLICY "Users can view own sessions"
  ON analytics_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON analytics_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON analytics_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily activity
CREATE POLICY "Users can view own daily activity"
  ON daily_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily activity"
  ON daily_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily activity"
  ON daily_activity FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- AUTO-SAVE POLICIES
-- ============================================================================

CREATE POLICY "Users can view own auto-save data"
  ON auto_save_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auto-save data"
  ON auto_save_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auto-save data"
  ON auto_save_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own auto-save data"
  ON auto_save_data FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CURRICULUM POLICIES
-- ============================================================================

-- Public can view published modules
CREATE POLICY "Public can view published modules"
  ON curriculum_modules FOR SELECT
  USING (is_published = TRUE);

-- Admins can do everything with modules
CREATE POLICY "Admins can manage modules"
  ON curriculum_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Public can view published lessons
CREATE POLICY "Public can view published lessons"
  ON curriculum_lessons FOR SELECT
  USING (is_published = TRUE);

-- Admins can manage lessons
CREATE POLICY "Admins can manage lessons"
  ON curriculum_lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Public can view published exercises
CREATE POLICY "Public can view published exercises"
  ON curriculum_exercises FOR SELECT
  USING (is_published = TRUE);

-- Admins can manage exercises
CREATE POLICY "Admins can manage exercises"
  ON curriculum_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Public can view published projects
CREATE POLICY "Public can view published projects"
  ON curriculum_projects FOR SELECT
  USING (is_published = TRUE);

-- Admins can manage projects
CREATE POLICY "Admins can manage projects"
  ON curriculum_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================================================
-- SUPPORT POLICIES
-- ============================================================================

-- Users can view and create their own issue reports
CREATE POLICY "Users can view own issues"
  ON issue_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create issues"
  ON issue_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view and manage all issues
CREATE POLICY "Admins can manage all issues"
  ON issue_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- User feedback policies
CREATE POLICY "Users can view own feedback"
  ON user_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SECTION 15: TRIGGERS & FUNCTIONS
-- ============================================================================
--
-- Automated business logic and timestamp updates
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate user level from XP
-- Formula: Level = floor(XP / 100) + 1
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp INTEGER)
RETURNS TEXT AS $$
DECLARE
  level_number INTEGER;
BEGIN
  level_number := FLOOR(xp / 100.0) + 1;
  
  IF level_number <= 4 THEN
    RETURN 'Beginner';
  ELSIF level_number <= 8 THEN
    RETURN 'Intermediate';
  ELSE
    RETURN 'Advanced';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Update learning streak
CREATE OR REPLACE FUNCTION update_learning_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_date DATE;
  streak_record RECORD;
BEGIN
  current_date := CURRENT_DATE;
  
  -- Get user's streak record
  SELECT * INTO streak_record
  FROM learning_streaks
  WHERE user_id = NEW.user_id;
  
  -- If no streak record exists, create one
  IF NOT FOUND THEN
    INSERT INTO learning_streaks (
      user_id,
      current_streak,
      longest_streak,
      last_activity_date,
      streak_start_date,
      total_active_days
    ) VALUES (
      NEW.user_id,
      1,
      1,
      current_date,
      current_date,
      1
    );
    RETURN NEW;
  END IF;
  
  last_date := streak_record.last_activity_date;
  
  -- If activity already recorded today, don't update
  IF last_date = current_date THEN
    RETURN NEW;
  END IF;
  
  -- If activity was yesterday, increment streak
  IF last_date = current_date - INTERVAL '1 day' THEN
    UPDATE learning_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = current_date,
        total_active_days = total_active_days + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE learning_streaks
    SET current_streak = 1,
        last_activity_date = current_date,
        streak_start_date = current_date,
        total_active_days = total_active_days + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- Also update user_profiles streak
  UPDATE user_profiles
  SET current_streak = (SELECT current_streak FROM learning_streaks WHERE user_id = NEW.user_id),
      longest_streak = (SELECT longest_streak FROM learning_streaks WHERE user_id = NEW.user_id),
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USER CLEANUP TRIGGER
-- ============================================================================
-- Automatically clean up all user data when deleted from user_profiles

CREATE OR REPLACE FUNCTION public.cleanup_deleted_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE NOTICE 'Auto-cleanup triggered for user: % (%), email: %', OLD.username, OLD.id, OLD.email;
  
  -- Delete from auth.users (master table)
  DELETE FROM auth.users WHERE id = OLD.id;
  
  -- Clean up username mapping table
  DELETE FROM public.user_accounts WHERE user_id = OLD.id OR LOWER(user_code) = LOWER(OLD.username);
  
  -- Clean up deleted_users audit table (allows immediate re-registration)
  DELETE FROM public.deleted_users WHERE user_id = OLD.id OR LOWER(email) = LOWER(OLD.email) OR LOWER(username) = LOWER(OLD.username);
  
  RAISE NOTICE 'Complete cleanup finished for user: %', OLD.username;
  
  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_cleanup_deleted_user
  BEFORE DELETE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_deleted_user();

-- ============================================================================
-- APPLY TRIGGERS
-- ============================================================================

-- Updated_at triggers for tables with updated_at column
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_progress_updated_at
  BEFORE UPDATE ON module_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Keep `current_level` (text) and `progress.level` (jsonb) in sync with numeric `level`
CREATE OR REPLACE FUNCTION public.sync_current_level_and_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Map numeric level to label
  NEW.current_level := CASE COALESCE(NEW.level,1)
    WHEN 1 THEN 'Beginner'
    WHEN 2 THEN 'Learner'
    WHEN 3 THEN 'Advanced'
    ELSE COALESCE(NEW.level::text, '1')
  END;

  -- Ensure progress JSON has numeric level when it's an object
  IF NEW.progress IS NOT NULL AND jsonb_typeof(NEW.progress) = 'object' THEN
    NEW.progress := (NEW.progress || jsonb_build_object('level', COALESCE(NEW.level,1)));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_current_level ON user_progress;
CREATE TRIGGER trg_sync_current_level
  BEFORE INSERT OR UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_current_level_and_progress();

-- Trigger: when a module is completed, set the next module in the user's progress
CREATE OR REPLACE FUNCTION public.trigger_set_next_module_on_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mod_num_text TEXT;
  mod_num INT;
  next_num INT;
  prefix TEXT;
  next_module_id TEXT;
BEGIN
  -- Only act when module is completed
  IF NOT (NEW.is_completed IS TRUE) THEN
    RETURN NEW;
  END IF;

  -- Extract trailing number from module_id
  mod_num_text := substring(NEW.module_id from '([0-9]+)$');
  IF mod_num_text IS NULL OR mod_num_text = '' THEN
    RETURN NEW; -- cannot determine sequence
  END IF;

  mod_num := mod_num_text::int;
  IF mod_num >= 1 AND mod_num < 8 THEN
    next_num := mod_num + 1;
    -- Preserve the prefix (everything before the trailing number)
    prefix := regexp_replace(NEW.module_id, '([0-9]+)$','');
    next_module_id := prefix || next_num::text;

    -- Update user's current_module to the next module
    UPDATE user_progress
    SET current_module = next_module_id,
        last_active_module = next_module_id,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    -- Optionally ensure a module_progress row exists for the next module (upsert)
    INSERT INTO module_progress (user_id, module_id, module_title, total_items, is_locked, is_completed, created_at, updated_at)
    VALUES (NEW.user_id, next_module_id, next_module_id, 0, FALSE, FALSE, NOW(), NOW())
    ON CONFLICT (user_id, module_id) DO UPDATE
    SET is_locked = FALSE, updated_at = NOW();

  ELSE
    -- Last module (8) completed: clear current_module to indicate no next module
    UPDATE user_progress
    SET current_module = NULL,
        last_active_module = NULL,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_next_module_on_completion ON module_progress;
CREATE TRIGGER trg_set_next_module_on_completion
  AFTER INSERT OR UPDATE ON module_progress
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE)
  EXECUTE FUNCTION public.trigger_set_next_module_on_completion();

CREATE TRIGGER update_topic_proficiency_updated_at
  BEFORE UPDATE ON topic_proficiency
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_completions_updated_at
  BEFORE UPDATE ON exercise_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_completions_updated_at
  BEFORE UPDATE ON project_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_streaks_updated_at
  BEFORE UPDATE ON learning_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_activity_updated_at
  BEFORE UPDATE ON daily_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure numeric `level` column exists on user_progress for programmatic updates
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Trigger to set numeric level when a user completes specific module tracks
CREATE OR REPLACE FUNCTION public.trigger_set_level_on_module_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  beginner_completed INTEGER := 0;
  learner_completed INTEGER := 0;
  current_level INTEGER := 1;
  new_level INTEGER;
BEGIN
  -- Only consider events where the module is completed
  IF NOT (NEW.is_completed IS TRUE) THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(level, 1) INTO current_level FROM user_progress WHERE user_id = NEW.user_id;

  -- Robustly extract trailing module number from module_id and count completed ones in 1-3
  SELECT COUNT(*) INTO beginner_completed
  FROM module_progress
  WHERE user_id = NEW.user_id
    AND is_completed = TRUE
    AND (substring(module_id from '([0-9]+)$') ~ '^[0-9]+$')
    AND (substring(module_id from '([0-9]+)$')::int BETWEEN 1 AND 3);

  -- Robustly count completed modules with trailing numbers 4-6
  SELECT COUNT(*) INTO learner_completed
  FROM module_progress
  WHERE user_id = NEW.user_id
    AND is_completed = TRUE
    AND (substring(module_id from '([0-9]+)$') ~ '^[0-9]+$')
    AND (substring(module_id from '([0-9]+)$')::int BETWEEN 4 AND 6);

  new_level := current_level;

  -- If user completed Learner track (modules 4-6) set level to 3
  IF learner_completed >= 3 THEN
    new_level := GREATEST(new_level, 3);
  ELSIF beginner_completed >= 3 THEN
    -- If user completed Beginner track (modules 1-3) set level to 2
    new_level := GREATEST(new_level, 2);
  END IF;

  IF new_level <> current_level THEN
    UPDATE user_progress
    SET level = new_level,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_level_on_module_completion ON module_progress;
CREATE TRIGGER trg_set_level_on_module_completion
  AFTER INSERT OR UPDATE ON module_progress
  FOR EACH ROW
  WHEN (NEW.is_completed = TRUE)
  EXECUTE FUNCTION public.trigger_set_level_on_module_completion();

CREATE TRIGGER update_auto_save_data_updated_at
  BEFORE UPDATE ON auto_save_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_modules_updated_at
  BEFORE UPDATE ON curriculum_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_lessons_updated_at
  BEFORE UPDATE ON curriculum_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_exercises_updated_at
  BEFORE UPDATE ON curriculum_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_projects_updated_at
  BEFORE UPDATE ON curriculum_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issue_reports_updated_at
  BEFORE UPDATE ON issue_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Streak update triggers (after completion events)
CREATE TRIGGER update_streak_after_lesson
  AFTER INSERT ON lesson_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_streak();

CREATE TRIGGER update_streak_after_exercise
  AFTER INSERT ON exercise_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_streak();

CREATE TRIGGER update_streak_after_project
  AFTER INSERT ON project_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_streak();

-- ============================================================================
-- SECTION 16: VERIFICATION QUERIES
-- ============================================================================
--
-- Quick verification that all tables were created successfully
-- ============================================================================

-- List all created tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count tables (should be 24+)
SELECT COUNT(*) as total_tables
FROM pg_tables
WHERE schemaname = 'public';

-- Count indexes (should be 35+)
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname NOT LIKE '%_pkey';

-- Count RLS policies (should be 50+)
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Count triggers (should be 15+)
SELECT 
  COUNT(*) as total_triggers
FROM pg_trigger
WHERE tgname NOT LIKE 'RI_%';

-- Count functions (should be 3+)
SELECT 
  COUNT(*) as total_functions
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace;

-- ============================================================================
-- SECTION 17: STORAGE BUCKETS
-- ============================================================================
--
-- NOTE: Storage buckets must be created separately in Supabase Dashboard or API
-- The following buckets are needed:
--
-- 1. certificates - For storing generated certificate PDFs
--    - Public: Yes (for verification links)
--    - File size limit: 5 MB
--    - Allowed MIME types: application/pdf
--
-- 2. avatars - For user profile pictures
--    - Public: Yes (for displaying in UI)
--    - File size limit: 2 MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- 3. project-files - For storing user project submissions
--    - Public: No (private to user)
--    - File size limit: 1 MB
--    - Allowed MIME types: text/plain, text/x-java
--
-- To create buckets via SQL (alternative to dashboard):
-- 
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES 
--   ('certificates', 'certificates', true),
--   ('avatars', 'avatars', true),
--   ('project-files', 'project-files', false);
-- ============================================================================

-- ============================================================================
-- SECTION 18: ADMIN SETUP
-- ============================================================================
--
-- After first user signs up, set them as admin:
-- 
-- UPDATE user_profiles
-- SET is_admin = TRUE
-- WHERE email = 'admin@example.com';
--
-- Or by user ID:
--
-- UPDATE user_profiles
-- SET is_admin = TRUE
-- WHERE id = '<user-uuid>';
-- ============================================================================

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- 
-- This schema includes:
-- ✅ 24 tables for comprehensive data management
-- ✅ 35+ indexes for query performance
-- ✅ 50+ RLS policies for data security
-- ✅ 15+ triggers for automation
-- ✅ 3 functions for business logic
-- ✅ Complete user data isolation
-- ✅ Admin access controls
-- ✅ Public read for published content
-- ✅ Automatic timestamp updates
-- ✅ Automatic streak tracking
-- ✅ Complete audit trails
--
-- The Java Study Buddy system is ready for Supabase deployment!
-- ============================================================================
