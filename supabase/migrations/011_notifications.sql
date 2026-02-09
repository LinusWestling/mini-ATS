-- Add notification preferences to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "new_candidate": true,
  "status_change": true,
  "email_notifications": true
}'::jsonb;
