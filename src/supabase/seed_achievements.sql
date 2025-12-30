-- Seed script to award achievements to existing users based on current progress
-- Run this in Supabase SQL Editor after deploying `achievements` table and `award_achievement` function.

-- Award 'first-lesson' to any user with lessons_completed >= 1
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM user_progress WHERE COALESCE(lessons_completed,0) >= 1 LOOP
    PERFORM public.award_achievement(r.user_id, 'first-lesson');
  END LOOP;
END
$$;

-- Award 'first-assessment' to users with assessments_passed >= 1
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM user_progress WHERE COALESCE(assessments_passed,0) >= 1 LOOP
    PERFORM public.award_achievement(r.user_id, 'first-assessment');
  END LOOP;
END
$$;

-- Award '20-lessons' to users with lessons_completed >= 20
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM user_progress WHERE COALESCE(lessons_completed,0) >= 20 LOOP
    PERFORM public.award_achievement(r.user_id, '20-lessons');
  END LOOP;
END
$$;

-- Award '10-exercises' to users with exercises_completed >= 10
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM user_progress WHERE COALESCE(exercises_completed,0) >= 10 LOOP
    PERFORM public.award_achievement(r.user_id, '10-exercises');
  END LOOP;
END
$$;

-- Award '7-day-streak' to users with current_streak >= 7 (from learning_streaks)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM learning_streaks WHERE COALESCE(current_streak,0) >= 7 LOOP
    PERFORM public.award_achievement(r.user_id, '7-day-streak');
  END LOOP;
END
$$;

-- Award '500-xp' and '1000-xp' based on total_xp in user_progress
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM user_progress WHERE COALESCE(total_xp,0) >= 500 LOOP
    PERFORM public.award_achievement(r.user_id, '500-xp');
  END LOOP;

  FOR r IN SELECT user_id FROM user_progress WHERE COALESCE(total_xp,0) >= 1000 LOOP
    PERFORM public.award_achievement(r.user_id, '1000-xp');
  END LOOP;
END
$$;

-- Note: 'perfect-score' (100% on assessment) is best awarded when the assessment is recorded.
-- Use application logic (on assessment submit) to call: PERFORM public.award_achievement(user_id, 'perfect-score');
