-- One-off patch: set sensible default XP for curriculum_lessons entries
-- Rationale: many lesson rows in curriculum inserts have xp_reward = 0.
-- This patch updates only lessons that currently have xp_reward = 0, setting them to 50 (XPService.LESSON_XP).
-- Review this file, then apply in Supabase SQL editor or via migration tooling.

BEGIN;

-- Backup (optional): create a table snapshot of rows we will change
CREATE TABLE IF NOT EXISTS curriculum_lessons_xp_backup AS
SELECT id, module_id, title, estimated_minutes, xp_reward, created_at
FROM curriculum_lessons
WHERE xp_reward = 0;

-- Update lessons with zero XP to default 50
UPDATE curriculum_lessons
SET xp_reward = 50
WHERE xp_reward = 0;

COMMIT;

-- To revert these changes, you can run (after review):
-- BEGIN;
-- UPDATE curriculum_lessons
-- SET xp_reward = b.xp_reward
-- FROM curriculum_lessons_xp_backup b
-- WHERE curriculum_lessons.id = b.id;
-- COMMIT;