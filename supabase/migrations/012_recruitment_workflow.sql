-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Enable RLS for departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments
CREATE POLICY "Companies can manage their own departments"
  ON departments FOR ALL
  USING (company_id = public.user_company_id());

-- Recruitment Processes table
CREATE TABLE IF NOT EXISTS recruitment_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  role_name TEXT NOT NULL,
  description TEXT, -- Manual text or document reference
  kravprofil JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for recruitment_processes
ALTER TABLE recruitment_processes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recruitment_processes
CREATE POLICY "Companies can manage their own recruitment processes"
  ON recruitment_processes FOR ALL
  USING (company_id = public.user_company_id());

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_recruitment_processes_company_id ON recruitment_processes(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id);
