-- Backfill: sync `progress.level` JSON with numeric `level` and `current_level` text
-- Usage: run in Supabase SQL editor. Idempotent: only updates rows where the
-- JSON `progress->>'level'` does not match the top-level `level` column.

BEGIN;

UPDATE user_progress
SET
  progress = COALESCE(progress, '{}'::jsonb) || jsonb_build_object('level', level),
  current_level = CASE level WHEN 1 THEN 'Beginner' WHEN 2 THEN 'Learner' WHEN 3 THEN 'Advanced' ELSE current_level END,
  updated_at = NOW()
WHERE (
  progress IS NULL OR (progress->>'level') IS DISTINCT FROM (level::text)
);

COMMIT;

-- Verify single user example:
-- SELECT user_id, level, current_level, progress->>'level' AS progress_level
-- FROM user_progress WHERE user_id = '<USER_UUID>';
