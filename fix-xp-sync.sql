-- Fix XP sync issues: Reset user progress to match actual completions
-- This ensures the navbar XP display matches the database

-- Step 1: Check current XP
SELECT 
  up.user_id,
  up.total_xp,
  p.username,
  p.email
FROM public.user_progress up
LEFT JOIN public.user_profiles p ON up.user_id = p.id
ORDER BY up.updated_at DESC
LIMIT 10;

-- Step 2: Recalculate actual XP from completion history
-- Each lesson completion = 50 XP
-- Each exercise completion = 25 XP
-- Each project completion = 100 XP
-- Each module completion = 75 XP bonus

-- Step 3: Run this only if you want to force-sync a specific user
-- Replace 'your-user-id-here' with actual UUID
/*
DO $$
DECLARE
  target_user_id UUID := 'your-user-id-here';
  actual_xp INTEGER := 0;
BEGIN
  -- Calculate actual XP from lesson completions
  SELECT COUNT(*) * 50 INTO actual_xp
  FROM public.lesson_completions
  WHERE user_id = target_user_id;
  
  -- Update user_progress
  UPDATE public.user_progress
  SET total_xp = actual_xp,
      updated_at = NOW()
  WHERE user_id = target_user_id;
  
  RAISE NOTICE 'Updated user % to % XP', target_user_id, actual_xp;
END $$;
*/
