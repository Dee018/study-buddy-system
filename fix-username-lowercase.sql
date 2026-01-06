-- Migration: Fix username case sensitivity
-- This migration does two things:
-- 1. Updates the trigger to always store usernames as lowercase
-- 2. Converts existing usernames to lowercase

-- Step 1: Update existing usernames to lowercase
UPDATE user_profiles 
SET username = LOWER(username)
WHERE username != LOWER(username);

-- Step 2: Update the trigger function to always store usernames in lowercase
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_username TEXT;
  meta_uuid TEXT;
  derived_username TEXT;
  derived_uuid TEXT;
BEGIN
  meta_username := NULLIF((NEW.raw_user_meta_data->>'username'), '');
  meta_uuid := NULLIF((NEW.raw_user_meta_data->>'uuid'), '');

  -- IMPORTANT: Convert username to lowercase for case-insensitive uniqueness
  derived_username := LOWER(COALESCE(meta_username, split_part(NEW.email, '@', 1)));
  derived_uuid := COALESCE(meta_uuid, public.generate_recovery_code());

  INSERT INTO public.user_profiles (id, uuid, username, email, account_created_at, last_login_at, created_at, updated_at)
  VALUES (NEW.id, derived_uuid, derived_username, NEW.email, NOW(), NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Verify the changes
SELECT id, username, email, created_at 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;
