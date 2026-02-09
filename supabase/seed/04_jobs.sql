-- Seed Jobs
INSERT INTO jobs (id, company_id, title, description) VALUES
-- TechCorp
('11111111-f1f1-f1f1-f1f1-111111111111', '11111111-1111-1111-1111-111111111111', 'Senior Fullstack Developer', 'We are looking for a senior developer to join our core team. You will work with React, Next.js and Supabase.'),
('11111111-f2f2-f2f2-f2f2-111111111111', '11111111-1111-1111-1111-111111111111', 'DevOps Engineer', 'Help us scale our infrastructure and optimize our CI/CD pipelines.'),
-- RetailGigant
('22222222-f1f1-f1f1-f1f1-222222222222', '22222222-2222-2222-2222-222222222222', 'Store Manager - Stockholm', 'Join our flagship store in Stockholm and lead a team of 50+ employees.'),
-- HealthPlus
('33333333-f1f1-f1f1-f1f1-333333333333', '33333333-3333-3333-3333-333333333333', 'Registered Nurse - ER', 'Dynamic and challenging environment in our emergency room.'),
-- FinanceFlow
('44444444-f1f1-f1f1-f1f1-444444444444', '44444444-4444-4444-4444-444444444444', 'Compliance Officer', 'Join our fast-growing fintech company and ensure we stay compliant.'),
-- CreativeWave
('55555555-f1f1-f1f1-f1f1-555555555555', '55555555-5555-5555-5555-555555555555', 'Senior Art Director', 'Lead creative projects for global brands.')
ON CONFLICT (id) DO NOTHING;
