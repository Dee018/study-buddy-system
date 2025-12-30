-- Run this in Supabase SQL Editor. Idempotent: safe to re-run.
-- Sets numeric `level` on user_progress based on completed module tracks.
-- Level rules:
--  - Level 3: user has completed modules numbered 4-6 (learner track)
--  - Level 2: user has completed modules numbered 1-3 (beginner track)
--  - Otherwise level remains as-is (defaults to 1)

BEGIN;

UPDATE user_progress up
SET level = CASE
  WHEN (
    SELECT COUNT(*) FROM module_progress mp
    WHERE mp.user_id = up.user_id
      AND mp.is_completed = TRUE
      AND (substring(mp.module_id from '([0-9]+)$') ~ '^[0-9]+$')
      AND (substring(mp.module_id from '([0-9]+)$')::int BETWEEN 4 AND 6)
  ) >= 3 THEN 3
  WHEN (
    SELECT COUNT(*) FROM module_progress mp
    WHERE mp.user_id = up.user_id
      AND mp.is_completed = TRUE
      AND (substring(mp.module_id from '([0-9]+)$') ~ '^[0-9]+$')
      AND (substring(mp.module_id from '([0-9]+)$')::int BETWEEN 1 AND 3)
  ) >= 3 THEN 2
  ELSE COALESCE(up.level, 1)
END,
updated_at = NOW();

COMMIT;

-- Optional: Check users affected (run after above to inspect results)
-- SELECT user_id, level FROM user_progress ORDER BY updated_at DESC LIMIT 50;
