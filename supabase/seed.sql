-- Seed Companies
INSERT INTO companies (id, name) VALUES
('11111111-1111-1111-1111-111111111111', 'TechCorp Solutions'),
('22222222-2222-2222-2222-222222222222', 'RetailGigant AB'),
('33333333-3333-3333-3333-333333333333', 'HealthPlus Services'),
('44444444-4444-4444-4444-444444444444', 'FinanceFlow Fintech'),
('55555555-5555-5555-5555-555555555555', 'CreativeWave Marketing')
ON CONFLICT (id) DO NOTHING;
-- Seed Departments
INSERT INTO departments (id, company_id, name) VALUES
-- TechCorp
('11111111-d1d1-d1d1-d1d1-111111111111', '11111111-1111-1111-1111-111111111111', 'Engineering'),
('11111111-d2d2-d2d2-d2d2-111111111111', '11111111-1111-1111-1111-111111111111', 'Product'),
-- RetailGigant
('22222222-d1d1-d1d1-d1d1-222222222222', '22222222-2222-2222-2222-222222222222', 'Sales'),
('22222222-d2d2-d2d2-d2d2-222222222222', '22222222-2222-2222-2222-222222222222', 'Logistics'),
-- HealthPlus
('33333333-d1d1-d1d1-d1d1-333333333333', '33333333-3333-3333-3333-333333333333', 'Medical Staff'),
('33333333-d2d2-d2d2-d2d2-333333333333', '33333333-3333-3333-3333-333333333333', 'Administration'),
-- FinanceFlow
('44444444-d1d1-d1d1-d1d1-444444444444', '44444444-4444-4444-4444-444444444444', 'Compliance'),
('44444444-d2d2-d2d2-d2d2-444444444444', '44444444-4444-4444-4444-444444444444', 'Development'),
-- CreativeWave
('55555555-d1d1-d1d1-d1d1-555555555555', '55555555-5555-5555-5555-555555555555', 'Design'),
('55555555-d2d2-d2d2-d2d2-555555555555', '55555555-5555-5555-5555-555555555555', 'Social Media')
ON CONFLICT (id) DO NOTHING;
-- Seed Recruitment Processes
INSERT INTO recruitment_processes (id, company_id, department_id, role_name, status, description, kravprofil) VALUES
-- TechCorp
('11111111-p1p1-p1p1-p1p1-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-d1d1-d1d1-d1d1-111111111111', 'Senior Fullstack Developer', 'active', 'Building the core platform using React and Node.js.', '{"skills": ["React", "Node.js", "PostgreSQL"], "experience": "5+ years"}'),
-- RetailGigant
('22222222-p1p1-p1p1-p1p1-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-d1d1-d1d1-d1d1-222222222222', 'Store Manager', 'active', 'Responsible for daily operations of the flagship store.', '{"skills": ["Leadership", "Retail Management"], "experience": "3+ years"}'),
-- HealthPlus
('33333333-p1p1-p1p1-p1p1-333333333333', '33333333-3333-3333-3333-333333333333', '33333333-d1d1-d1d1-d1d1-333333333333', 'Registered Nurse', 'active', 'Providing high-quality care in our emergency department.', '{"skills": ["Patient Care", "Emergency Medicine"], "license": "Required"}'),
-- FinanceFlow
('44444444-p1p1-p1p1-p1p1-444444444444', '44444444-4444-4444-4444-444444444444', '44444444-d1d1-d1d1-d1d1-444444444444', 'Compliance Officer', 'active', 'Ensuring our fintech operations meet regulatory standards.', '{"skills": ["Legal", "Finance Regulations"], "experience": "4+ years"}'),
-- CreativeWave
('55555555-p1p1-p1p1-p1p1-555555555555', '55555555-5555-5555-5555-555555555555', '55555555-d1d1-d1d1-d1d1-555555555555', 'Senior Art Director', 'active', 'Leading our creative vision for international brands.', '{"skills": ["Creative Direction", "Adobe Suite"], "portfolio": "Required"}')
ON CONFLICT (id) DO NOTHING;
-- Seed Jobs
INSERT INTO jobs (id, company_id, title, description) VALUES
-- TechCorp
('11111111-j1j1-j1j1-j1j1-111111111111', '11111111-1111-1111-1111-111111111111', 'Senior Fullstack Developer', 'We are looking for a senior developer to join our core team. You will work with React, Next.js and Supabase.'),
('11111111-j2j2-j2j2-j2j2-111111111111', '11111111-1111-1111-1111-111111111111', 'DevOps Engineer', 'Help us scale our infrastructure and optimize our CI/CD pipelines.'),
-- RetailGigant
('22222222-j1j1-j1j1-j1j1-222222222222', '22222222-2222-2222-2222-222222222222', 'Store Manager - Stockholm', 'Join our flagship store in Stockholm and lead a team of 50+ employees.'),
-- HealthPlus
('33333333-j1j1-j1j1-j1j1-333333333333', '33333333-3333-3333-3333-333333333333', 'Registered Nurse - ER', 'Dynamic and challenging environment in our emergency room.'),
-- FinanceFlow
('44444444-j1j1-j1j1-j1j1-444444444444', '44444444-4444-4444-4444-444444444444', 'Compliance Officer', 'Join our fast-growing fintech company and ensure we stay compliant.'),
-- CreativeWave
('55555555-j1j1-j1j1-j1j1-555555555555', '55555555-5555-5555-5555-555555555555', 'Senior Art Director', 'Lead creative projects for global brands.')
ON CONFLICT (id) DO NOTHING;
-- Seed Candidates
INSERT INTO candidates (id, company_id, name, email, phone, linkedin_url) VALUES
-- TechCorp Candidates
('11111111-c1c1-c1c1-c1c1-111111111111', '11111111-1111-1111-1111-111111111111', 'Alice Andersson', 'alice@example.com', '070-111 11 11', 'https://linkedin.com/in/alice'),
('11111111-c2c2-c2c2-c2c2-111111111111', '11111111-1111-1111-1111-111111111111', 'Bob Berggren', 'bob@example.com', '070-222 22 22', 'https://linkedin.com/in/bob'),
-- RetailGigant Candidates
('22222222-c1c1-c1c1-c1c1-222222222222', '22222222-2222-2222-2222-222222222222', 'Cecilia Carlsson', 'cecilia@example.com', '070-333 33 33', 'https://linkedin.com/in/cecilia'),
-- HealthPlus Candidates
('33333333-c1c1-c1c1-c1c1-333333333333', '33333333-3333-3333-3333-333333333333', 'David Dahl', 'david@example.com', '070-444 44 44', 'https://linkedin.com/in/david'),
-- FinanceFlow Candidates
('44444444-c1c1-c1c1-c1c1-444444444444', '44444444-4444-4444-4444-444444444444', 'Erik Eriksson', 'erik@example.com', '070-555 55 55', 'https://linkedin.com/in/erik'),
-- CreativeWave Candidates
('55555555-c1c1-c1c1-c1c1-555555555555', '55555555-5555-5555-5555-555555555555', 'Frida Fransson', 'frida@example.com', '070-666 66 66', 'https://linkedin.com/in/frida')
ON CONFLICT (id) DO NOTHING;
-- Seed Applications
INSERT INTO applications (job_id, candidate_id, status) VALUES
-- TechCorp Applications
('11111111-j1j1-j1j1-j1j1-111111111111', '11111111-c1c1-c1c1-c1c1-111111111111', 'interview'),
('11111111-j1j1-j1j1-j1j1-111111111111', '11111111-c2c2-c2c2-c2c2-111111111111', 'new'),
('11111111-j2j2-j2j2-j2j2-111111111111', '11111111-c2c2-c2c2-c2c2-111111111111', 'screening'),
-- RetailGigant Applications
('22222222-j1j1-j1j1-j1j1-222222222222', '22222222-c1c1-c1c1-c1c1-222222222222', 'offer'),
-- HealthPlus Applications
('33333333-j1j1-j1j1-j1j1-333333333333', '33333333-c1c1-c1c1-c1c1-333333333333', 'interview'),
-- FinanceFlow Applications
('44444444-j1j1-j1j1-j1j1-444444444444', '44444444-c1c1-c1c1-c1c1-444444444444', 'new'),
-- CreativeWave Applications
('55555555-j1j1-j1j1-j1j1-555555555555', '55555555-c1c1-c1c1-c1c1-555555555555', 'screening')
ON CONFLICT (job_id, candidate_id) DO NOTHING;
