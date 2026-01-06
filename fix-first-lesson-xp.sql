-- 🔥 FIX: Reduce "first-lesson" achievement from 100 XP to 50 XP
-- Problem: Users get 100 XP total after completing 1 lesson (should be 50 XP)
-- Root cause: The "first-lesson" achievement awards 100 XP, doubling the expected reward
-- Solution: Change achievement to 50 XP so total is just the lesson reward

-- Step 1: Update the achievement definition
UPDATE public.achievements
SET xp_reward = 50
WHERE id = 'first-lesson';

-- Step 2: Verify the update
SELECT id, name, xp_reward FROM public.achievements WHERE id = 'first-lesson';

-- Step 3: For existing users who already earned the achievement, 
-- calculate the overpaid XP (50 XP per user with this achievement)
SELECT 
  COUNT(*) as users_with_achievement,
  COUNT(*) * 50 as total_xp_to_adjust
FROM public.user_achievements 
WHERE achievement_id = 'first-lesson';

-- Step 4: (OPTIONAL) To retroactively fix all users who earned "first-lesson":
-- Subtract 50 XP from their total (since they got 100 when they should have gotten 50)
/*
UPDATE public.user_progress
SET 
  total_xp = GREATEST(0, total_xp - 50),  -- Don't go below 0
  updated_at = NOW()
WHERE user_id IN (
  SELECT user_id FROM public.user_achievements 
  WHERE achievement_id = 'first-lesson'
);

-- Verify the fix
SELECT 
  p.id,
  p.username,
  up.total_xp
FROM public.user_profiles p
LEFT JOIN public.user_progress up ON p.id = up.user_id
WHERE p.id IN (
  SELECT user_id FROM public.user_achievements 
  WHERE achievement_id = 'first-lesson'
)
ORDER BY up.total_xp DESC;
*/
