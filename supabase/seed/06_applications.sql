-- Seed Applications
INSERT INTO applications (job_id, candidate_id, status) VALUES
-- TechCorp Applications
('11111111-f1f1-f1f1-f1f1-111111111111', '11111111-c1c1-c1c1-c1c1-111111111111', 'interview'),
('11111111-f1f1-f1f1-f1f1-111111111111', '11111111-c2c2-c2c2-c2c2-111111111111', 'new'),
('11111111-f2f2-f2f2-f2f2-111111111111', '11111111-c2c2-c2c2-c2c2-111111111111', 'screening'),
-- RetailGigant Applications
('22222222-f1f1-f1f1-f1f1-222222222222', '22222222-c1c1-c1c1-c1c1-222222222222', 'offer'),
-- HealthPlus Applications
('33333333-f1f1-f1f1-f1f1-333333333333', '33333333-c1c1-c1c1-c1c1-333333333333', 'interview'),
-- FinanceFlow Applications
('44444444-f1f1-f1f1-f1f1-444444444444', '44444444-c1c1-c1c1-c1c1-444444444444', 'new'),
-- CreativeWave Applications
('55555555-f1f1-f1f1-f1f1-555555555555', '55555555-c1c1-c1c1-c1c1-555555555555', 'screening')
ON CONFLICT (job_id, candidate_id) DO NOTHING;
