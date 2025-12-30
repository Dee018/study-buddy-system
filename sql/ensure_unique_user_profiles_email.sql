-- Ensure unique emails in user_profiles
-- 1) Remove duplicate rows keeping the earliest created (or lowest id)
-- 2) Create a unique index on lower(email) to enforce case-insensitive uniqueness

BEGIN;

-- Delete duplicates (keep the first by created_at, then id)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY lower(email) ORDER BY COALESCE(created_at, '1970-01-01') ASC, id ASC) AS rn
  FROM user_profiles
)
DELETE FROM user_profiles
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Create a case-insensitive unique index on email
-- Use CONCURRENTLY if running on a live DB to avoid locking (remove CONCURRENTLY if inside transaction)

-- If running interactively against a live DB, run the following instead of the lines below:
-- CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_lower_unique_idx ON user_profiles ((lower(email)));

-- For use inside this migration (non-concurrent):
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_lower_unique_idx ON user_profiles ((lower(email)));

COMMIT;
