-- 🔧 ADD TRIGGER: Update user_progress.total_xp when lesson_completions is inserted
-- Problem: Lesson XP is recorded in lesson_completions but never added to user_progress.total_xp
-- Solution: Create trigger to automatically add xp_earned to user_progress.total_xp

-- Step 1: Create trigger function
CREATE OR REPLACE FUNCTION public.add_lesson_xp_to_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user_progress.total_xp with the lesson's xp_earned
  UPDATE public.user_progress
  SET 
    total_xp = COALESCE(total_xp, 0) + COALESCE(NEW.xp_earned, 0),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Step 2: Create trigger on lesson_completions INSERT
DROP TRIGGER IF EXISTS trg_add_lesson_xp ON lesson_completions;
CREATE TRIGGER trg_add_lesson_xp
  AFTER INSERT ON lesson_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.add_lesson_xp_to_progress();

-- Step 3: Verify the trigger was created
SELECT * FROM pg_trigger WHERE tgname = 'trg_add_lesson_xp';

-- Step 4: For existing users, calculate and fix their XP
-- This will add back the lesson XP that was never credited
SELECT 
  up.user_id,
  up.total_xp as current_xp,
  COALESCE(SUM(lc.xp_earned), 0) as lessons_xp,
  COALESCE(SUM(ec.xp_earned), 0) as exercises_xp,
  up.total_xp + COALESCE(SUM(lc.xp_earned), 0) + COALESCE(SUM(ec.xp_earned), 0) as expected_total_xp
FROM public.user_progress up
LEFT JOIN public.lesson_completions lc ON up.user_id = lc.user_id
LEFT JOIN public.exercise_completions ec ON up.user_id = ec.user_id
GROUP BY up.user_id, up.total_xp
HAVING COALESCE(SUM(lc.xp_earned), 0) + COALESCE(SUM(ec.xp_earned), 0) > 0
ORDER BY up.user_id;

-- Step 5: (OPTIONAL) To retroactively fix all users, run this:
/*
UPDATE public.user_progress up
SET 
  total_xp = (
    SELECT 
      COALESCE(up2.total_xp, 0) + 
      COALESCE(SUM(lc.xp_earned), 0) + 
      COALESCE(SUM(ec.xp_earned), 0)
    FROM public.user_progress up2
    LEFT JOIN public.lesson_completions lc ON up2.user_id = lc.user_id
    LEFT JOIN public.exercise_completions ec ON up2.user_id = ec.user_id
    WHERE up2.user_id = up.user_id
    GROUP BY up2.user_id, up2.total_xp
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM (
    SELECT 
      up2.user_id,
      COALESCE(SUM(lc.xp_earned), 0) + COALESCE(SUM(ec.xp_earned), 0) as missing_xp
    FROM public.user_progress up2
    LEFT JOIN public.lesson_completions lc ON up2.user_id = lc.user_id
    LEFT JOIN public.exercise_completions ec ON up2.user_id = ec.user_id
    GROUP BY up2.user_id
    HAVING COALESCE(SUM(lc.xp_earned), 0) + COALESCE(SUM(ec.xp_earned), 0) > 0
  ) missing_xp_calc
  WHERE missing_xp_calc.user_id = up.user_id AND missing_xp_calc.missing_xp > 0
);

-- Verify the fix
SELECT 
  p.username,
  up.total_xp,
  COUNT(DISTINCT lc.id) as lessons_completed,
  COUNT(DISTINCT ec.id) as exercises_completed
FROM public.user_profiles p
LEFT JOIN public.user_progress up ON p.id = up.user_id
LEFT JOIN public.lesson_completions lc ON p.id = lc.user_id
LEFT JOIN public.exercise_completions ec ON p.id = ec.user_id
GROUP BY p.id, p.username, up.total_xp
ORDER BY up.total_xp DESC;
*/
