-- Seed Recruitment Processes
INSERT INTO recruitment_processes (id, company_id, department_id, role_name, status, description, kravprofil) VALUES
-- TechCorp
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-d1d1-d1d1-d1d1-111111111111', 'Senior Fullstack Developer', 'active', 'Building the core platform using React and Node.js.', '{"skills": ["React", "Node.js", "PostgreSQL"], "experience": "5+ years"}'),
-- RetailGigant
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-d1d1-d1d1-d1d1-222222222222', 'Store Manager', 'active', 'Responsible for daily operations of the flagship store.', '{"skills": ["Leadership", "Retail Management"], "experience": "3+ years"}'),
-- HealthPlus
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '33333333-d1d1-d1d1-d1d1-333333333333', 'Registered Nurse', 'active', 'Providing high-quality care in our emergency department.', '{"skills": ["Patient Care", "Emergency Medicine"], "license": "Required"}'),
-- FinanceFlow
('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '44444444-d1d1-d1d1-d1d1-444444444444', 'Compliance Officer', 'active', 'Ensuring our fintech operations meet regulatory standards.', '{"skills": ["Legal", "Finance Regulations"], "experience": "4+ years"}'),
-- CreativeWave
('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '55555555-d1d1-d1d1-d1d1-555555555555', 'Senior Art Director', 'active', 'Leading our creative vision for international brands.', '{"skills": ["Creative Direction", "Adobe Suite"], "portfolio": "Required"}')
ON CONFLICT (id) DO NOTHING;
