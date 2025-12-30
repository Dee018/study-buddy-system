-- Backfill script: award missing achievements for existing users
-- Run in Supabase SQL editor. The `public.award_achievement` function is idempotent.

-- 1) Diagnostics (run these first for a specific user)
-- Replace <USER_UUID> with the user's UUID
--
-- Total lessons published
-- SELECT COUNT(*) AS total_lessons FROM lessons WHERE is_published = TRUE OR is_published IS NULL;
-- User's completed lessons (from completions table)
-- SELECT COUNT(*) AS user_completed FROM lesson_completions WHERE user_id = '<USER_UUID>'::uuid;
-- User_progress value
-- SELECT lessons_completed, exercises_completed, total_xp FROM user_progress WHERE user_id = '<USER_UUID>'::uuid;
-- Existing earned achievements for user
-- SELECT * FROM user_achievements WHERE user_id = '<USER_UUID>'::uuid ORDER BY earned_at DESC;

-- 2) Backfill all users: award badges based on current data
DO $$
DECLARE
  r RECORD;
  total_lessons INTEGER;
BEGIN
  -- Use fixed total lessons target (22) for the Java Master badge
  total_lessons := 22;

  FOR r IN SELECT id as user_id FROM user_profiles LOOP
    -- First lesson
    PERFORM public.award_achievement(r.user_id, 'first-lesson')
    WHERE EXISTS (SELECT 1 FROM lesson_completions lc WHERE lc.user_id = r.user_id LIMIT 1);

    -- 20 lessons milestone
    PERFORM public.award_achievement(r.user_id, '20-lessons')
    WHERE (SELECT COUNT(*) FROM lesson_completions lc WHERE lc.user_id = r.user_id) >= 20;

    -- Completed all lessons (uses `lessons` table count)
    IF total_lessons > 0 AND (SELECT COUNT(*) FROM lesson_completions lc WHERE lc.user_id = r.user_id) >= total_lessons THEN
      PERFORM public.award_achievement(r.user_id, 'completed-all-lessons');
    END IF;

    -- 10 exercises milestone
    PERFORM public.award_achievement(r.user_id, '10-exercises')
    WHERE (SELECT COUNT(*) FROM exercise_completions ec WHERE ec.user_id = r.user_id) >= 10;

    -- Perfect score: if any assessment_attempts with score >= 100
    IF EXISTS (SELECT 1 FROM assessment_attempts aa WHERE aa.user_id = r.user_id AND aa.score >= 100) THEN
      PERFORM public.award_achievement(r.user_id, 'perfect-score');
    END IF;

    -- First assessment
    PERFORM public.award_achievement(r.user_id, 'first-assessment')
    WHERE EXISTS (SELECT 1 FROM assessment_attempts aa WHERE aa.user_id = r.user_id LIMIT 1);

    -- XP milestones: prefer user_progress.total_xp if present, else sum xp_transactions
    IF COALESCE((SELECT total_xp FROM user_progress WHERE user_id = r.user_id), 0) >= 500 THEN
      PERFORM public.award_achievement(r.user_id, '500-xp');
    ELSIF (SELECT COALESCE(SUM(amount),0) FROM xp_transactions xt WHERE xt.user_id = r.user_id) >= 500 THEN
      PERFORM public.award_achievement(r.user_id, '500-xp');
    END IF;

    IF COALESCE((SELECT total_xp FROM user_progress WHERE user_id = r.user_id), 0) >= 1000 THEN
      PERFORM public.award_achievement(r.user_id, '1000-xp');
    ELSIF (SELECT COALESCE(SUM(amount),0) FROM xp_transactions xt WHERE xt.user_id = r.user_id) >= 1000 THEN
      PERFORM public.award_achievement(r.user_id, '1000-xp');
    END IF;

    -- (Optional) you can add more checks here for project/module completion badges
  END LOOP;
END
$$;

-- After running, re-run diagnostics to confirm:
-- SELECT * FROM user_achievements WHERE user_id = '<USER_UUID>'::uuid ORDER BY earned_at DESC;