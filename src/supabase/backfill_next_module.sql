-- Run in Supabase SQL Editor. Idempotent: safe to re-run.
-- Ensures `current_module` and `last_active_module` exist, then backfills next module per user's latest completed module.

BEGIN;

-- Add missing columns if not present
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS current_module TEXT;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_active_module TEXT;

-- Compute each user's next module based on their highest-number completed module
WITH last_mod AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    module_id,
    regexp_replace(module_id, '([0-9]+)$','') AS prefix,
    (substring(module_id from '([0-9]+)$')::int) AS modnum
  FROM module_progress mp
  WHERE mp.is_completed = TRUE
    AND substring(module_id from '([0-9]+)$') ~ '^[0-9]+$'
  ORDER BY user_id, (substring(module_id from '([0-9]+)$')::int) DESC
)
UPDATE user_progress up
SET current_module = CASE WHEN lm.modnum >= 8 THEN NULL ELSE lm.prefix || (lm.modnum + 1)::text END,
    last_active_module = CASE WHEN lm.modnum >= 8 THEN NULL ELSE lm.prefix || (lm.modnum + 1)::text END,
    updated_at = NOW()
FROM last_mod lm
WHERE up.user_id = lm.user_id;

COMMIT;

-- Verify one user (replace USER_UUID)
-- SELECT user_id, current_module, last_active_module FROM user_progress WHERE user_id = '<USER_UUID>'::uuid;