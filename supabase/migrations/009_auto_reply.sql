-- Add auto-reply settings to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS auto_reply_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_reply_subject TEXT DEFAULT 'Tack för din ansökan!',
ADD COLUMN IF NOT EXISTS auto_reply_body TEXT DEFAULT 'Hej! Tack för att du har sökt tjänsten. Vi återkommer så snart vi har tittat på din ansökan.';
