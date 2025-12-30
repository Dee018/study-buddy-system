-- Targeted backfill for a single user to award missing achievements
-- Replace the USER_UUID value below and run in Supabase SQL editor.

DO $$
DECLARE
  v_user uuid := 'e8d92623-31f8-4186-960b-fbed49c1342b'::uuid; -- replace if needed
  v_lesson_count INTEGER;
  v_ex_count INTEGER;
  v_total_lessons INTEGER;
  v_total_xp INTEGER;
  v_up_lessons INTEGER := 0;
  v_up_ex INTEGER := 0;
  v_up_xp INTEGER := 0;
BEGIN
  -- Diagnostics (will show in result)
  SELECT COUNT(*) INTO v_lesson_count FROM lesson_completions WHERE user_id = v_user;
  SELECT COUNT(*) INTO v_ex_count FROM exercise_completions WHERE user_id = v_user;
  SELECT lessons_completed, exercises_completed, total_xp
    INTO v_up_lessons, v_up_ex, v_up_xp
    FROM user_progress WHERE user_id = v_user LIMIT 1;
  RAISE NOTICE 'User lesson completions: %', v_lesson_count;
  RAISE NOTICE 'User exercises completed: %', v_ex_count;
  RAISE NOTICE 'user_progress summary (lessons, exercises, total_xp): %,%,%', v_up_lessons, v_up_ex, v_up_xp;
  SELECT COUNT(*) INTO v_total_lessons FROM lessons WHERE is_published = TRUE OR is_published IS NULL;
  RAISE NOTICE 'Total published lessons in lessons table: %', v_total_lessons;

  SELECT COUNT(*) INTO v_lesson_count FROM lesson_completions WHERE user_id = v_user;
  SELECT COUNT(*) INTO v_ex_count FROM exercise_completions WHERE user_id = v_user;
  SELECT COALESCE((SELECT total_xp FROM user_progress WHERE user_id = v_user), (SELECT COALESCE(SUM(amount),0) FROM xp_transactions WHERE user_id = v_user), 0) INTO v_total_xp;

  -- Award first lesson (idempotent)
  IF v_lesson_count >= 1 THEN
    PERFORM public.award_achievement(v_user, 'first-lesson');
    RAISE NOTICE 'Awarded first-lesson if missing.';
  END IF;

  -- Award 20-lessons
  IF v_lesson_count >= 20 THEN
    PERFORM public.award_achievement(v_user, '20-lessons');
    RAISE NOTICE 'Awarded 20-lessons if missing.';
  END IF;

  -- Award completed-all-lessons (compare to lessons table total)
  IF v_total_lessons > 0 AND v_lesson_count >= v_total_lessons THEN
    PERFORM public.award_achievement(v_user, 'completed-all-lessons');
    RAISE NOTICE 'Awarded completed-all-lessons if missing.';
  ELSE
    RAISE NOTICE 'Not awarding completed-all-lessons: v_total_lessons=%, v_lesson_count=%', v_total_lessons, v_lesson_count;
  END IF;

  -- Award exercise milestone
  IF v_ex_count >= 10 THEN
    PERFORM public.award_achievement(v_user, '10-exercises');
    RAISE NOTICE 'Awarded 10-exercises if missing.';
  END IF;

  -- Award assessment badges
  IF EXISTS (SELECT 1 FROM assessment_attempts aa WHERE aa.user_id = v_user) THEN
    PERFORM public.award_achievement(v_user, 'first-assessment');
    RAISE NOTICE 'Awarded first-assessment if missing.';
  END IF;
  IF EXISTS (SELECT 1 FROM assessment_attempts aa WHERE aa.user_id = v_user AND aa.score >= 100) THEN
    PERFORM public.award_achievement(v_user, 'perfect-score');
    RAISE NOTICE 'Awarded perfect-score if missing.';
  END IF;

  -- Award XP milestones
  IF v_total_xp >= 500 THEN
    PERFORM public.award_achievement(v_user, '500-xp');
    RAISE NOTICE 'Awarded 500-xp if missing.';
  END IF;
  IF v_total_xp >= 1000 THEN
    PERFORM public.award_achievement(v_user, '1000-xp');
    RAISE NOTICE 'Awarded 1000-xp if missing.';
  END IF;

END;
$$;

-- After running: verify
-- SELECT * FROM user_achievements WHERE user_id = 'e8d92623-31f8-4186-960b-fbed49c1342b'::uuid ORDER BY earned_at DESC;