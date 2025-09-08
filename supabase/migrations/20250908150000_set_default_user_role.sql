-- Set the default role for new users in the profiles table
ALTER TABLE public.profiles
ALTER COLUMN role SET DEFAULT 'representative';

-- Note: This migration does not backfill existing users.
-- If there are users with a NULL role, they should be updated manually.
-- For new sign-ups, the application should no longer send the 'role' field.
-- The database will now handle assigning the default role.
