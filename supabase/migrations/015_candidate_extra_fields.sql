-- Add extra_fields JSONB column to candidates
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS extra_fields JSONB DEFAULT '[]'::jsonb;
