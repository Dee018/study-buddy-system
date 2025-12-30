-- Backfill (global): derive completed modules from module_progress for all users
-- Writes `progress.completedModules` (JSON), `modules_completed` (count), and syncs `progress.level` and `current_level`.
-- Idempotent: safe to run multiple times.

-- Recommended: run on a staging DB first and backup production before running.

WITH comp AS (
  SELECT user_id, array_agg(module_id ORDER BY module_id) AS mods
  FROM module_progress
  WHERE (
    COALESCE(completion_percentage, 0) >= 100
    OR is_completed = TRUE
    OR completed_at IS NOT NULL
  )
  GROUP BY user_id
)
UPDATE user_progress up
SET
  progress = COALESCE(up.progress, '{}'::jsonb) || jsonb_build_object(
    'completedModules', COALESCE((SELECT to_jsonb(c.mods) FROM comp c WHERE c.user_id = up.user_id), '[]'::jsonb),
    'level', up.level
  ),
  modules_completed = COALESCE((SELECT array_length(c.mods,1) FROM comp c WHERE c.user_id = up.user_id), 0),
  current_level = CASE up.level WHEN 1 THEN 'Beginner' WHEN 2 THEN 'Learner' WHEN 3 THEN 'Advanced' ELSE up.current_level END,
  updated_at = NOW();

-- Optional verification query (uncomment to run manually):
-- SELECT user_id, modules_completed, progress->>'level' AS progress_level, progress->'completedModules' AS completed_modules
-- FROM user_progress ORDER BY updated_at DESC LIMIT 50;
