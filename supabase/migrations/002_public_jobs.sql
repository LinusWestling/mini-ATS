-- Allow anyone (even non-authenticated) to view jobs
DROP POLICY IF EXISTS "Public can view jobs" ON jobs;
CREATE POLICY "Public can view jobs"
  ON jobs FOR SELECT
  USING (true);

-- Allow anyone to view company names (needed for landing page if we show company names)
DROP POLICY IF EXISTS "Public can view company names" ON companies;
CREATE POLICY "Public can view company names"
  ON companies FOR SELECT
  USING (true);
