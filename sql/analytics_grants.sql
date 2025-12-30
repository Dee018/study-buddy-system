-- Grant execute on RPC to allow anonymous client to call it
GRANT EXECUTE ON FUNCTION public.get_or_create_analytics_session(uuid, text, jsonb) TO anon;

-- If you have Row Level Security (RLS) on analytics_sessions, ensure the function owner
-- has rights to insert into the table (SECURITY DEFINER) or create a policy to allow RPC inserts.
-- Example policy to allow inserts only when user_id = auth.uid():
-- ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY anon_insert ON analytics_sessions FOR INSERT TO anon USING (false) WITH CHECK (user_id = auth.uid());

-- Note: prefer using SECURITY DEFINER and granting execute to anon for the RPC rather than weakening table policies.
