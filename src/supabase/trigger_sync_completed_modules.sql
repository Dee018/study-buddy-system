-- Trigger: keep `progress.completedModules` and `modules_completed` in sync
-- Creates a trigger on `module_progress` that updates the corresponding
-- `user_progress` row whenever a module_progress row is inserted/updated/deleted.
-- Idempotent: safe to apply multiple times.

CREATE OR REPLACE FUNCTION public.sync_completed_modules_from_module_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID;
  mods TEXT[];
  mods_json JSONB;
  cnt INTEGER;
BEGIN
  -- Determine affected user id (handle DELETE vs INSERT/UPDATE)
  IF (TG_OP = 'DELETE') THEN
    uid := OLD.user_id;
  ELSE
    uid := NEW.user_id;
  END IF;

  -- Aggregate completed module ids for the user
  SELECT array_agg(module_id ORDER BY module_id) INTO mods
  FROM module_progress
  WHERE user_id = uid
    AND (
      COALESCE(completion_percentage, 0) >= 100
      OR is_completed = TRUE
      OR completed_at IS NOT NULL
    );

  mods_json := COALESCE(to_jsonb(mods), '[]'::jsonb);
  cnt := COALESCE(array_length(mods,1), 0);

  -- Update user's progress row with authoritative values
  UPDATE user_progress
  SET
    progress = COALESCE(progress, '{}'::jsonb) || jsonb_build_object('completedModules', mods_json, 'level', level),
    modules_completed = cnt,
    current_level = CASE level WHEN 1 THEN 'Beginner' WHEN 2 THEN 'Learner' WHEN 3 THEN 'Advanced' ELSE current_level END,
    updated_at = NOW()
  WHERE user_id = uid;

  RETURN NULL; -- AFTER trigger
END;
$$;

-- Install trigger
DROP TRIGGER IF EXISTS trg_sync_completed_modules ON module_progress;
CREATE TRIGGER trg_sync_completed_modules
  AFTER INSERT OR UPDATE OR DELETE ON module_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_completed_modules_from_module_progress();

-- Note: Run this file in Supabase SQL editor to create the trigger.
