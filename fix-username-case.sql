-- Fix existing usernames to be lowercase in user_profiles table
-- This ensures consistency with the new signup flow that normalizes usernames

-- First, check if there are any non-lowercase usernames
SELECT id, username, email 
FROM user_profiles 
WHERE username != LOWER(username);

-- Update all usernames to lowercase
UPDATE user_profiles 
SET username = LOWER(username)
WHERE username != LOWER(username);

-- Verify the update
SELECT id, username, email 
FROM user_profiles 
ORDER BY created_at DESC
LIMIT 10;
