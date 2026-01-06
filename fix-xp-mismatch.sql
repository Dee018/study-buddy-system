-- URGENT FIX: Remove the erroneous 50 XP bonus from all new users
-- This fixes the issue where users get 100 XP after completing 1 lesson (should be 50 XP)

-- First, identify all users who have 50 more XP than expected based on completions
SELECT 
  up.user_id,
  up.total_xp as current_xp,
  COUNT(DISTINCT lc.id) * 50 as expected_xp_from_lessons,
  COALESCE(COUNT(DISTINCT ec.id), 0) * 25 as expected_xp_from_exercises,
  CASE WHEN mp.projects_completed = 1 THEN 100 ELSE 0 END as expected_xp_from_project,
  COUNT(DISTINCT lc.id) * 50 + COALESCE(COUNT(DISTINCT ec.id), 0) * 25 + CASE WHEN mp.projects_completed = 1 THEN 100 ELSE 0 END as total_expected_xp,
  up.total_xp - (COUNT(DISTINCT lc.id) * 50 + COALESCE(COUNT(DISTINCT ec.id), 0) * 25 + CASE WHEN mp.projects_completed = 1 THEN 100 ELSE 0 END) as xp_discrepancy
FROM public.user_progress up
LEFT JOIN public.lesson_completions lc ON up.user_id = lc.user_id
LEFT JOIN public.exercise_completions ec ON up.user_id = ec.user_id
LEFT JOIN public.module_progress mp ON up.user_id = mp.user_id
GROUP BY up.user_id, up.total_xp, mp.projects_completed
HAVING up.total_xp > (COUNT(DISTINCT lc.id) * 50 + COALESCE(COUNT(DISTINCT ec.id), 0) * 25 + CASE WHEN mp.projects_completed = 1 THEN 100 ELSE 0 END)
ORDER BY up.total_xp DESC;

-- Fix: Set total_xp to match actual completions
-- UNCOMMENT AND RUN ONLY AFTER REVIEWING THE ABOVE QUERY!
/*
UPDATE public.user_progress
SET total_xp = (
  SELECT COUNT(DISTINCT lc.id) * 50 + COALESCE(COUNT(DISTINCT ec.id), 0) * 25 + CASE WHEN mp.projects_completed = 1 THEN 100 ELSE 0 END
  FROM public.lesson_completions lc
  LEFT JOIN public.exercise_completions ec ON lc.user_id = ec.user_id
  LEFT JOIN public.module_progress mp ON lc.user_id = mp.user_id
  WHERE lc.user_id = public.user_progress.user_id
),
updated_at = NOW()
WHERE total_xp > 0
  AND user_id IN (
    SELECT up.user_id
    FROM public.user_progress up
    LEFT JOIN public.lesson_completions lc ON up.user_id = lc.user_id
    GROUP BY up.user_id, up.total_xp
    HAVING up.total_xp = 100 AND COUNT(lc.id) = 1
  );
*/

-- Verify the fix
SELECT 
  p.id,
  p.username,
  up.total_xp,
  COUNT(lc.id) as lessons_completed
FROM public.user_profiles p
LEFT JOIN public.user_progress up ON p.id = up.user_id
LEFT JOIN public.lesson_completions lc ON p.id = lc.user_id
GROUP BY p.id, p.username, up.total_xp
ORDER BY up.total_xp DESC
LIMIT 20;
