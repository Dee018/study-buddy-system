-- Fix: Update user_achievements xp_reward to match the new achievement value
-- Problem: user_achievements still shows 100 XP for "first-lesson" but we reduced it to 50 XP

UPDATE public.user_achievements
SET xp_reward = 50
WHERE achievement_id = 'first-lesson';

-- Verify the fix
SELECT 
  achievement_id,
  achievement_name,
  xp_reward,
  COUNT(*) as user_count
FROM public.user_achievements
WHERE achievement_id = 'first-lesson'
GROUP BY achievement_id, achievement_name, xp_reward;
