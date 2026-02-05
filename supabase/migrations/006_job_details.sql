-- Add location and salary range to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_min INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_max INTEGER;

-- Create job_templates table
CREATE TABLE IF NOT EXISTS job_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for job_templates
ALTER TABLE job_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_templates
DROP POLICY IF EXISTS "Admins can view all templates" ON job_templates;
CREATE POLICY "Admins can view all templates"
  ON job_templates FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Customers can view their company's templates" ON job_templates;
CREATE POLICY "Customers can view their company's templates"
  ON job_templates FOR SELECT
  USING (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Customers can insert templates for their company" ON job_templates;
CREATE POLICY "Customers can insert templates for their company"
  ON job_templates FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Customers can update their company's templates" ON job_templates;
CREATE POLICY "Customers can update their company's templates"
  ON job_templates FOR UPDATE
  USING (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Customers can delete their company's templates" ON job_templates;
CREATE POLICY "Customers can delete their company's templates"
  ON job_templates FOR DELETE
  USING (company_id = public.user_company_id());

-- Allow authenticated users (during signup etc) to create templates if they own the company
DROP POLICY IF EXISTS "Users can create their own templates" ON job_templates;
CREATE POLICY "Users can create their own templates"
ON job_templates FOR INSERT
TO authenticated
WITH CHECK (
  company_id IN (SELECT id FROM companies WHERE created_by = auth.uid())
);
