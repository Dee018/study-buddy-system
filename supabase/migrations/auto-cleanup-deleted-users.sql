-- ============================================================================
-- AUTO-CLEANUP TRIGGER FOR DELETED USERS
-- ============================================================================
-- This trigger automatically removes ALL traces of a user when they are
-- deleted from user_profiles, including:
-- - auth.users (Supabase Auth)
-- - user_accounts (username mapping)
-- - deleted_users (audit table - optional, set to keep for compliance)
--
-- This ensures users can re-register with the same email/username immediately
-- ============================================================================

-- Function to clean up all user data
CREATE OR REPLACE FUNCTION public.cleanup_deleted_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the deletion for debugging
  RAISE NOTICE 'Auto-cleanup triggered for user: % (%), email: %', OLD.username, OLD.id, OLD.email;
  
  -- 1. Delete from auth.users (this is the master table)
  -- Note: This will cascade back to user_profiles, but since we're already
  -- in a DELETE trigger, it won't cause infinite recursion
  DELETE FROM auth.users WHERE id = OLD.id;
  RAISE NOTICE 'Deleted from auth.users';
  
  -- 2. Clean up username mapping table
  DELETE FROM public.user_accounts WHERE user_id = OLD.id OR LOWER(user_code) = LOWER(OLD.username);
  RAISE NOTICE 'Cleaned up user_accounts';
  
  -- 3. Clean up deleted_users audit table
  -- OPTION A: Remove from audit table (allows immediate re-registration)
  DELETE FROM public.deleted_users WHERE user_id = OLD.id OR LOWER(email) = LOWER(OLD.email) OR LOWER(username) = LOWER(OLD.username);
  RAISE NOTICE 'Cleaned up deleted_users table';
  
  -- OPTION B: Keep audit records (uncomment if you need compliance/audit trail)
  -- Comment out the DELETE above and leave this commented to keep audit records
  -- RAISE NOTICE 'Keeping audit records in deleted_users';
  
  RAISE NOTICE 'Complete cleanup finished for user: %', OLD.username;
  
  RETURN OLD;
END;
$$;

-- Create trigger that fires BEFORE deletion from user_profiles
-- Using BEFORE ensures we can still access auth.users before cascade
DROP TRIGGER IF EXISTS trigger_cleanup_deleted_user ON public.user_profiles;
CREATE TRIGGER trigger_cleanup_deleted_user
  BEFORE DELETE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_deleted_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.cleanup_deleted_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_deleted_user() TO service_role;

COMMENT ON FUNCTION public.cleanup_deleted_user() IS 
'Automatically cleans up all user data when a user_profiles row is deleted, including auth.users, user_accounts, and deleted_users tables. This allows immediate re-registration with the same credentials.';
