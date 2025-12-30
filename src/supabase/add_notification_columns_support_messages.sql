-- Add notification_sent and notification_response columns to support_messages
ALTER TABLE IF EXISTS public.support_messages
  ADD COLUMN IF NOT EXISTS notification_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_response jsonb NULL;

-- Optional index on notification_sent for admin queries
CREATE INDEX IF NOT EXISTS idx_support_messages_notification_sent ON public.support_messages (notification_sent);
