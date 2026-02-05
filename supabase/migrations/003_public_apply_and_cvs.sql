-- 1. Enable Storage for CVs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Update Candidates table to support CV URL
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- 3. RLS Policies for Storage (Public can upload, authenticated can view)
CREATE POLICY "Public can upload CVs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'cvs');

CREATE POLICY "Authenticated users can view CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cvs');

-- 4. Update Applications/Candidates RLS for public apply
-- Allow public to create candidates
DROP POLICY IF EXISTS "Public can create candidates" ON candidates;
CREATE POLICY "Public can create candidates"
  ON candidates FOR INSERT
  WITH CHECK (true);

-- Allow public to create applications
DROP POLICY IF EXISTS "Public can create applications" ON applications;
CREATE POLICY "Public can create applications"
  ON applications FOR INSERT
  WITH CHECK (true);

-- Allow public to view jobs and companies (already done in 002 but good to have)
DROP POLICY IF EXISTS "Public can view jobs" ON jobs;
CREATE POLICY "Public can view jobs" ON jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view companies" ON companies;
CREATE POLICY "Public can view companies" ON companies FOR SELECT USING (true);
