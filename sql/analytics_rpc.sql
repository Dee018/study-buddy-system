-- RPC to return an existing active analytics session for a user, or create one atomically
CREATE OR REPLACE FUNCTION public.get_or_create_analytics_session(
  p_user uuid,
  p_session_id text,
  p_session_data jsonb
)
RETURNS SETOF analytics_sessions AS $$
DECLARE
  rec analytics_sessions%ROWTYPE;
BEGIN
  -- Try to find an active session for the user
  SELECT * INTO rec FROM analytics_sessions WHERE user_id = p_user AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1;

  IF FOUND THEN
    RETURN NEXT rec;
    RETURN;
  END IF;

  -- Otherwise insert a new session and return it
  INSERT INTO analytics_sessions (session_id, user_id, started_at, page_views, events_count, lessons_viewed, exercises_attempted, session_data)
  VALUES (p_session_id, p_user, now(), 0, 0, 0, 0, p_session_data)
  RETURNING * INTO rec;

  RETURN NEXT rec;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
