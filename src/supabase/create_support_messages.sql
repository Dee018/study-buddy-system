-- Create support_messages table for Contact Us submissions
-- Idempotent: safe to run multiple times

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  handled_by uuid NULL,
  handled_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_support_messages_email ON public.support_messages (lower(email));
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages (created_at);
CREATE INDEX IF NOT EXISTS idx_support_messages_handled ON public.support_messages (handled);

-- Trigger function to keep `updated_at` current
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if present, then create (idempotent behavior)
DROP TRIGGER IF EXISTS trg_support_messages_set_timestamp ON public.support_messages;
CREATE TRIGGER trg_support_messages_set_timestamp
BEFORE UPDATE ON public.support_messages
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Optional: grant select/insert to anon/auth roles if you want client-side inserts
-- GRANT INSERT, SELECT ON public.support_messages TO authenticated;

-- Done
