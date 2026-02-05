-- Enable UUID extension (optional as we'll use gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for application status
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('new', 'screening', 'interview', 'offer', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for user role
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  linkedin_url TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table (relation between candidates and jobs)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  status application_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's company_id (moved to public schema)
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin (moved to public schema)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies for companies
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update companies" ON companies;
CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete companies" ON companies;
CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Customers can view their own company" ON companies;
CREATE POLICY "Customers can view their own company"
  ON companies FOR SELECT
  USING (id = public.user_company_id());

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- RLS Policies for jobs
DROP POLICY IF EXISTS "Admins can view all jobs" ON jobs;
CREATE POLICY "Admins can view all jobs"
  ON jobs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert jobs" ON jobs;
CREATE POLICY "Admins can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update jobs" ON jobs;
CREATE POLICY "Admins can update jobs"
  ON jobs FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete jobs" ON jobs;
CREATE POLICY "Admins can delete jobs"
  ON jobs FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Customers can view their company's jobs" ON jobs;
CREATE POLICY "Customers can view their company's jobs"
  ON jobs FOR SELECT
  USING (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Customers can insert jobs for their company" ON jobs;
CREATE POLICY "Customers can insert jobs for their company"
  ON jobs FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Customers can update their company's jobs" ON jobs;
CREATE POLICY "Customers can update their company's jobs"
  ON jobs FOR UPDATE
  USING (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Customers can delete their company's jobs" ON jobs;
CREATE POLICY "Customers can delete their company's jobs"
  ON jobs FOR DELETE
  USING (company_id = public.user_company_id());

-- RLS Policies for candidates
DROP POLICY IF EXISTS "Admins can view all candidates" ON candidates;
CREATE POLICY "Admins can view all candidates"
  ON candidates FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert candidates" ON candidates;
CREATE POLICY "Admins can insert candidates"
  ON candidates FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update candidates" ON candidates;
CREATE POLICY "Admins can update candidates"
  ON candidates FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete candidates" ON candidates;
CREATE POLICY "Admins can delete candidates"
  ON candidates FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Customers can view their company's candidates" ON candidates;
CREATE POLICY "Customers can view their company's candidates"
  ON candidates FOR SELECT
  USING (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Customers can insert candidates for their company" ON candidates;
CREATE POLICY "Customers can insert candidates for their company"
  ON candidates FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Customers can update their company's candidates" ON candidates;
CREATE POLICY "Customers can update their company's candidates"
  ON candidates FOR UPDATE
  USING (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Customers can delete their company's candidates" ON candidates;
CREATE POLICY "Customers can delete their company's candidates"
  ON candidates FOR DELETE
  USING (company_id = public.user_company_id());

-- RLS Policies for applications
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert applications" ON applications;
CREATE POLICY "Admins can insert applications"
  ON applications FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update applications" ON applications;
CREATE POLICY "Admins can update applications"
  ON applications FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete applications" ON applications;
CREATE POLICY "Admins can delete applications"
  ON applications FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Customers can view their company's applications" ON applications;
CREATE POLICY "Customers can view their company's applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.company_id = public.user_company_id()
    )
  );

DROP POLICY IF EXISTS "Customers can insert applications for their company" ON applications;
CREATE POLICY "Customers can insert applications for their company"
  ON applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.company_id = public.user_company_id()
    )
    AND EXISTS (
      SELECT 1 FROM public.candidates
      WHERE candidates.id = applications.candidate_id
      AND candidates.company_id = public.user_company_id()
    )
  );

DROP POLICY IF EXISTS "Customers can update their company's applications" ON applications;
CREATE POLICY "Customers can update their company's applications"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.company_id = public.user_company_id()
    )
  );

DROP POLICY IF EXISTS "Customers can delete their company's applications" ON applications;
CREATE POLICY "Customers can delete their company's applications"
  ON applications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.company_id = public.user_company_id()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_candidates_company_id ON candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);