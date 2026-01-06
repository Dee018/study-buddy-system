-- ============================================================================
-- QUICK INSTALL: AUTO-CLEANUP TRIGGER
-- ============================================================================
-- Copy and paste this entire script into Supabase SQL Editor and click RUN
-- After this, any user deleted from user_profiles will be completely removed
-- from ALL tables, allowing immediate re-registration
-- ============================================================================

-- Create the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_deleted_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the deletion
  RAISE NOTICE 'Auto-cleanup: Removing all data for user % (email: %)', OLD.username, OLD.email;
  
  -- 1. Delete from auth.users (Supabase Auth - master table)
  DELETE FROM auth.users WHERE id = OLD.id;
  
  -- 2. Clean up username mapping
  DELETE FROM public.user_accounts 
  WHERE user_id = OLD.id OR LOWER(user_code) = LOWER(OLD.username);
  
  -- 3. Remove from audit table (allows re-registration)
  DELETE FROM public.deleted_users 
  WHERE user_id = OLD.id 
     OR LOWER(email) = LOWER(OLD.email) 
     OR LOWER(username) = LOWER(OLD.username);
  
  RAISE NOTICE '✅ Complete cleanup finished for: %', OLD.username;
  
  RETURN OLD;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_cleanup_deleted_user ON public.user_profiles;
CREATE TRIGGER trigger_cleanup_deleted_user
  BEFORE DELETE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_deleted_user();

-- Verify trigger was created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_cleanup_deleted_user';
