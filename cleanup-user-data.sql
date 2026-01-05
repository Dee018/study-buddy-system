-- ============================================================================
-- CLEANUP SCRIPT FOR DELETED USER DATA
-- ============================================================================
-- Use this script to completely remove all traces of a deleted user
-- so they can re-register with the same email/username
--
-- INSTRUCTIONS:
-- 1. Open your Supabase project dashboard
-- 2. Go to SQL Editor
-- 3. Replace the email/username values below with your actual values
-- 4. Run this entire script
-- ============================================================================

-- Set the email and username to clean up
DO $$
DECLARE
  target_email TEXT := 'ignacojanessama@gmail.com';  -- CHANGE THIS
  target_username TEXT := 'janessa';                  -- CHANGE THIS (lowercase)
  auth_user_id UUID;
BEGIN
  -- Find the user ID from auth.users if it exists
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER(target_email)
  LIMIT 1;

  -- If found in auth.users, log it
  IF auth_user_id IS NOT NULL THEN
    RAISE NOTICE 'Found user in auth.users with ID: %', auth_user_id;
    
    -- Delete from auth.users (this will cascade to user_profiles due to ON DELETE CASCADE)
    DELETE FROM auth.users WHERE id = auth_user_id;
    RAISE NOTICE 'Deleted user from auth.users';
  ELSE
    RAISE NOTICE 'No user found in auth.users with email: %', target_email;
  END IF;

  -- Clean up user_profiles (in case cascade didn't work or user was manually deleted)
  DELETE FROM public.user_profiles
  WHERE LOWER(email) = LOWER(target_email)
     OR LOWER(username) = LOWER(target_username);
  
  RAISE NOTICE 'Cleaned up user_profiles for email: % and username: %', target_email, target_username;

  -- Clean up user_accounts mapping table
  DELETE FROM public.user_accounts
  WHERE LOWER(user_code) = LOWER(target_username);
  
  RAISE NOTICE 'Cleaned up user_accounts for username: %', target_username;

  -- Clean up deleted_users table (soft delete records)
  DELETE FROM public.deleted_users
  WHERE LOWER(email) = LOWER(target_email)
     OR LOWER(username) = LOWER(target_username);
  
  RAISE NOTICE 'Cleaned up deleted_users table';

  -- Clean up any orphaned data in related tables
  -- (These will be cleaned up automatically if FK constraints have ON DELETE CASCADE)
  
  RAISE NOTICE 'Cleanup complete! User can now re-register with email: % and username: %', target_email, target_username;
END $$;

-- Verify cleanup - should return no rows
SELECT 'auth.users' as table_name, id, email FROM auth.users WHERE LOWER(email) = 'ignacojanessama@gmail.com'
UNION ALL
SELECT 'user_profiles', id::text, email FROM public.user_profiles WHERE LOWER(email) = 'ignacojanessama@gmail.com' OR LOWER(username) = 'janessa'
UNION ALL
SELECT 'deleted_users', id::text, email FROM public.deleted_users WHERE LOWER(email) = 'ignacojanessama@gmail.com' OR LOWER(username) = 'janessa';
