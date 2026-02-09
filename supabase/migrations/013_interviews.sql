-- Interview Templates table
CREATE TABLE IF NOT EXISTS interview_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb, -- Array of questions with categories
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for interview_templates
ALTER TABLE interview_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview_templates
CREATE POLICY "Companies can manage their own interview templates"
  ON interview_templates FOR ALL
  USING (company_id = public.user_company_id());

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES recruitment_processes(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES interview_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL, -- e.g. "Teknisk intervju 1"
  description TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned', -- planned, completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for interviews
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interviews
CREATE POLICY "Companies can manage their own interviews"
  ON interviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recruitment_processes
      WHERE recruitment_processes.id = interviews.process_id
      AND recruitment_processes.company_id = public.user_company_id()
    )
  );

-- Interview Feedback (Scores) table
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  score INTEGER CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for interview_feedback
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview_feedback
CREATE POLICY "Companies can manage their own interview feedback"
  ON interview_feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      JOIN recruitment_processes ON recruitment_processes.id = interviews.process_id
      WHERE interviews.id = interview_feedback.interview_id
      AND recruitment_processes.company_id = public.user_company_id()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_interviews_process_id ON interviews(process_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON interview_feedback(interview_id);
