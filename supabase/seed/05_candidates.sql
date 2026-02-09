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
