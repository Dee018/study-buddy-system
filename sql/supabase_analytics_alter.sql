-- Safe ALTER statements for analytics_sessions to match frontend expectations
-- 1) Add new columns if they do not exist
ALTER TABLE IF EXISTS analytics_sessions
  ADD COLUMN IF NOT EXISTS session_id text;

ALTER TABLE IF EXISTS analytics_sessions
  ADD COLUMN IF NOT EXISTS started_at timestamptz;

ALTER TABLE IF EXISTS analytics_sessions
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

ALTER TABLE IF EXISTS analytics_sessions
  ADD COLUMN IF NOT EXISTS duration_seconds integer;

ALTER TABLE IF EXISTS analytics_sessions
  ADD COLUMN IF NOT EXISTS page_views integer DEFAULT 0;

ALTER TABLE IF EXISTS analytics_sessions
  ADD COLUMN IF NOT EXISTS events_count integer DEFAULT 0;

ALTER TABLE IF EXISTS analytics_sessions
  ADD COLUMN IF NOT EXISTS session_data jsonb;

-- 2) Backfill new columns from legacy columns if present
-- If old column 'session_start' exists, copy into 'started_at'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_sessions' AND column_name='session_start') THEN
    EXECUTE 'UPDATE analytics_sessions SET started_at = session_start WHERE started_at IS NULL;';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_sessions' AND column_name='session_end') THEN
    EXECUTE 'UPDATE analytics_sessions SET ended_at = session_end WHERE ended_at IS NULL;';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_sessions' AND column_name='duration_minutes') THEN
    EXECUTE 'UPDATE analytics_sessions SET duration_seconds = duration_minutes * 60 WHERE duration_seconds IS NULL AND duration_minutes IS NOT NULL;';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_sessions' AND column_name='pages_viewed') THEN
    EXECUTE 'UPDATE analytics_sessions SET page_views = pages_viewed WHERE page_views IS NULL;';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_sessions' AND column_name='events_count') THEN
    -- events_count already exists; nothing to copy
    NULL;
  END IF;
END$$;

-- 3) Create an index on session_id if not present to speed queries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'analytics_sessions' AND indexname = 'analytics_sessions_session_id_idx'
  ) THEN
    EXECUTE 'CREATE INDEX analytics_sessions_session_id_idx ON analytics_sessions(session_id);';
  END IF;
END$$;
