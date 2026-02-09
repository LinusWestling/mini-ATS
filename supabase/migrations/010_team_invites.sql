-- Create table for team invites
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  role user_role NOT NULL DEFAULT 'customer',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  
  UNIQUE(company_id, email)
);

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Admins can view all invites" ON invites;
CREATE POLICY "Admins can view all invites"
  ON invites FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all invites" ON invites;
CREATE POLICY "Admins can manage all invites"
  ON invites FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Companies can view their own invites" ON invites;
CREATE POLICY "Companies can view their own invites"
  ON invites FOR SELECT
  USING (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Companies can create invites" ON invites;
CREATE POLICY "Companies can create invites"
  ON invites FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Companies can delete their own invites" ON invites;
CREATE POLICY "Companies can delete their own invites"
  ON invites FOR DELETE
  USING (company_id = public.user_company_id());

-- Allow public access to view an invite by token (for the signup page)
DROP POLICY IF EXISTS "Allow public to view invite by token" ON invites;
CREATE POLICY "Allow public to view invite by token"
  ON invites FOR SELECT
  TO anon
  USING (expires_at > NOW() AND accepted_at IS NULL);

-- Add policy for profiles so team members can see each other
DROP POLICY IF EXISTS "Users can view profiles of their company members" ON profiles;
CREATE POLICY "Users can view profiles of their company members"
  ON profiles FOR SELECT
  USING (company_id = public.user_company_id());
