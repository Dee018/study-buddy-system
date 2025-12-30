-- recompute_all_xp.sql
-- Safe one-shot migration for Supabase
-- Recomputes module_progress.xp_earned from completion tables and updates user_progress.progress.total_xp
-- Only updates XP fields when the computed value differs. Run in Supabase SQL editor as an admin.

BEGIN;

-- 1) Compute per-user/per-module XP from completion tables
WITH per_module AS (
  SELECT
    user_id,
    module_id,
    COALESCE(SUM(xp_earned), 0)::int AS module_xp
  FROM (
    SELECT user_id, module_id, xp_earned FROM lesson_completions
    UNION ALL
    SELECT user_id, module_id, xp_earned FROM exercise_completions
    UNION ALL
    SELECT user_id, module_id, xp_earned FROM project_completions
  ) AS t
  GROUP BY user_id, module_id
),
-- 2) Left-join against existing module_progress rows so we only update existing module_progress
to_update AS (
  SELECT mp.user_id, mp.module_id, COALESCE(p.module_xp, 0)::int AS new_xp
  FROM module_progress mp
  LEFT JOIN per_module p ON p.user_id = mp.user_id AND p.module_id = mp.module_id
)

UPDATE module_progress mp
SET xp_earned = u.new_xp
FROM to_update u
WHERE mp.user_id = u.user_id
  AND mp.module_id = u.module_id
  AND (mp.xp_earned IS DISTINCT FROM u.new_xp);

-- 3) Recompute per-user total XP as the sum of module_progress.xp_earned
WITH user_totals AS (
  SELECT user_id, COALESCE(SUM(xp_earned), 0)::int AS total_xp
  FROM module_progress
  GROUP BY user_id
)
UPDATE user_progress up
SET progress = jsonb_set(
  COALESCE(up.progress, '{}'::jsonb),
  '{total_xp}',
  to_jsonb(ut.total_xp),
  true
)
FROM user_totals ut
WHERE up.user_id = ut.user_id
  AND (up.progress->'total_xp') IS DISTINCT FROM to_jsonb(ut.total_xp);

COMMIT;

-- After running this migration, refresh client caches for active users.
-- Example browser console commands for a given user id:
-- await window.ProgressSyncManager.triggerQueueProcessingForUser('<USER_ID>');
-- await window.ProgressSyncManager.loadProgressAsync('<USER_ID>');
