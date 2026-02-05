-- Create table for custom recruitment steps
CREATE TABLE IF NOT EXISTS recruitment_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL, -- The status key (e.g., 'new', 'custom_1')
  "order" INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT 'bg-gray-500',
  is_system BOOLEAN NOT NULL DEFAULT false, -- If true, cannot be deleted (e.g. 'new', 'rejected')
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recruitment_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Companies can view their own steps" ON recruitment_steps;
CREATE POLICY "Companies can view their own steps"
  ON recruitment_steps FOR SELECT
  USING (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Companies can insert steps" ON recruitment_steps;
CREATE POLICY "Companies can insert steps"
  ON recruitment_steps FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Companies can update steps" ON recruitment_steps;
CREATE POLICY "Companies can update steps"
  ON recruitment_steps FOR UPDATE
  USING (company_id = public.user_company_id());

DROP POLICY IF EXISTS "Companies can delete steps" ON recruitment_steps;
CREATE POLICY "Companies can delete steps"
  ON recruitment_steps FOR DELETE
  USING (company_id = public.user_company_id() AND is_system = false);

-- Function to seed default steps for a new company
CREATE OR REPLACE FUNCTION public.seed_default_recruitment_steps()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.recruitment_steps (company_id, label, value, "order", color, is_system)
  VALUES
    (NEW.id, 'Ny', 'new', 0, 'bg-gray-500', true),
    (NEW.id, 'Screening', 'screening', 1, 'bg-blue-500', false),
    (NEW.id, 'Intervju', 'interview', 2, 'bg-yellow-500', false),
    (NEW.id, 'Erbjudande', 'offer', 3, 'bg-green-500', false),
    (NEW.id, 'Avslagen', 'rejected', 4, 'bg-red-500', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to seed steps when a company is created
DROP TRIGGER IF EXISTS on_company_created_seed_steps ON companies;
CREATE TRIGGER on_company_created_seed_steps
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_default_recruitment_steps();

-- Backfill for existing companies (Run manually if needed, but safe to include)
DO $$
DECLARE
  company RECORD;
BEGIN
  FOR company IN SELECT id FROM companies LOOP
    IF NOT EXISTS (SELECT 1 FROM recruitment_steps WHERE company_id = company.id) THEN
      INSERT INTO recruitment_steps (company_id, label, value, "order", color, is_system)
      VALUES
        (company.id, 'Ny', 'new', 0, 'bg-gray-500', true),
        (company.id, 'Screening', 'screening', 1, 'bg-blue-500', false),
        (company.id, 'Intervju', 'interview', 2, 'bg-yellow-500', false),
        (company.id, 'Erbjudande', 'offer', 3, 'bg-green-500', false),
        (company.id, 'Avslagen', 'rejected', 4, 'bg-red-500', true);
    END IF;
  END LOOP;
END;
$$;
