-- 🔧 ADD TRIGGER: Also handle exercise completions XP
-- Problem: Exercise XP is recorded in exercise_completions but never added to user_progress.total_xp

-- Step 1: Create trigger function for exercises
CREATE OR REPLACE FUNCTION public.add_exercise_xp_to_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user_progress.total_xp with the exercise's xp_earned
  UPDATE public.user_progress
  SET 
    total_xp = COALESCE(total_xp, 0) + COALESCE(NEW.xp_earned, 0),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Step 2: Create trigger on exercise_completions INSERT
DROP TRIGGER IF EXISTS trg_add_exercise_xp ON exercise_completions;
CREATE TRIGGER trg_add_exercise_xp
  AFTER INSERT ON exercise_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.add_exercise_xp_to_progress();

-- Step 3: Verify both triggers exist
SELECT tgname FROM pg_trigger WHERE tgname IN ('trg_add_lesson_xp', 'trg_add_exercise_xp');

-- Step 4: Clear cache and verify final XP
SELECT 
  p.username,
  up.total_xp as current_xp,
  COUNT(DISTINCT lc.id) as lessons_completed,
  COUNT(DISTINCT ec.id) as exercises_completed,
  COALESCE(SUM(lc.xp_earned), 0) as total_lesson_xp,
  COALESCE(SUM(ec.xp_earned), 0) as total_exercise_xp
FROM public.user_profiles p
LEFT JOIN public.user_progress up ON p.id = up.user_id
LEFT JOIN public.lesson_completions lc ON p.id = lc.user_id
LEFT JOIN public.exercise_completions ec ON p.id = ec.user_id
GROUP BY p.id, p.username, up.total_xp
ORDER BY up.total_xp DESC;
