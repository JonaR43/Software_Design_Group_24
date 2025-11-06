-- ============================================================
-- JACS ShiftPilot - Diverse Mock Data for Matching Algorithm Testing
-- ============================================================
-- This creates volunteers across different cities with varied skills,
-- availability, and preferences to showcase the matching algorithm
-- ============================================================

SET timezone = 'UTC';

-- Clear existing data
TRUNCATE TABLE volunteer_skills, volunteer_history, availability, profiles, assignments, event_requirements, events, notifications, users, skills CASCADE;

-- ============================================================
-- 1. USERS (15 volunteers + 1 admin across different cities)
-- ============================================================
-- Password: Admin@123 (for admin) and Volunteer@123 (for volunteers)

INSERT INTO users (id, username, email, password, role, verified, "createdAt", "updatedAt") VALUES
-- Admin
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@example.com', '$2b$10$AOzmr9EoPcXuDJBLVYgYhOysCqDaIGgI1q18O43XBq/ttHU0jwZE2', 'ADMIN', true, NOW() - INTERVAL '2 years', NOW()),

-- Houston volunteers (local to most events)
('550e8400-e29b-41d4-a716-446655440002', 'sarah.local', 'sarah.local@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '1 year', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'mike.allskills', 'mike.allskills@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '8 months', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'emma.weekends', 'emma.weekends@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '6 months', NOW()),

-- Austin volunteers (about 165 miles from Houston)
('550e8400-e29b-41d4-a716-446655440005', 'james.austin', 'james.austin@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '3 months', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'lisa.austin', 'lisa.austin@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '4 months', NOW()),

-- Dallas volunteers (about 240 miles from Houston)
('550e8400-e29b-41d4-a716-446655440007', 'david.dallas', 'david.dallas@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '2 months', NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'maria.dallas', 'maria.dallas@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '5 months', NOW()),

-- Los Angeles volunteers (about 1500 miles from Houston)
('550e8400-e29b-41d4-a716-446655440009', 'carlos.la', 'carlos.la@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '1 month', NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'nina.la', 'nina.la@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '7 months', NOW()),

-- New York volunteers (about 1600 miles from Houston)
('550e8400-e29b-41d4-a716-446655440011', 'robert.ny', 'robert.ny@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '9 months', NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'jessica.ny', 'jessica.ny@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '3 months', NOW()),

-- Miami volunteers (about 1000 miles from Houston)
('550e8400-e29b-41d4-a716-446655440013', 'alex.miami', 'alex.miami@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '2 months', NOW()),

-- Chicago volunteers (about 1080 miles from Houston)
('550e8400-e29b-41d4-a716-446655440014', 'sophia.chicago', 'sophia.chicago@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '6 months', NOW()),

-- Houston volunteer with NO skills (to show poor matching)
('550e8400-e29b-41d4-a716-446655440015', 'john.noskills', 'john.noskills@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '1 week', NOW()),

-- Houston volunteer with limited availability
('550e8400-e29b-41d4-a716-446655440016', 'amy.busy', 'amy.busy@example.com', '$2b$10$rxnJbrbTxVJAcBEcxKCna.KnWa6XplIuRaizR16rQsGhHfC3JYZI6', 'VOLUNTEER', true, NOW() - INTERVAL '4 months', NOW());

-- ============================================================
-- 2. SKILLS
-- ============================================================

INSERT INTO skills (id, name, category, description, "createdAt", "updatedAt") VALUES
('650e8400-e29b-41d4-a716-446655440001', 'First Aid', 'Healthcare', 'Basic medical assistance', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'CPR Certified', 'Healthcare', 'CPR certification', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440003', 'Event Planning', 'Administrative', 'Event coordination', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440004', 'Public Speaking', "Communication", "Presentations", NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440005', "Tutoring", "Education", 'Teaching', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440006', "Gardening", "Environmental", 'Plant care', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440007', 'Construction', 'Manual Labor', 'Building skills', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440008', 'Cooking', 'Food Service', 'Food prep', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440009', "Fundraising", "Administrative", 'Raising funds', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440010', 'Social Media', 'Technology', 'Social media management', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440011', "Photography", "Creative", 'Photography', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440012', "Translation", "Communication", 'Spanish translation', NOW(), NOW());

-- ============================================================
-- 3. PROFILES (NOTE: Profiles do NOT have latitude/longitude - those are in Events only)
-- ============================================================

INSERT INTO profiles (id, "userId", "firstName", "lastName", phone, address, city, state, "zipCode", bio,
                      "maxTravelDistance", "preferredCauses", "emailNotifications",
                      "profileCompleteness", "createdAt", "updatedAt") VALUES

-- Admin
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', "Admin", "User", '713-555-0001',
 '123 Admin St', "Houston", "TX", '77001', 'System Administrator',
 50, ARRAY["community", "administrative"], true, 100, NOW(), NOW()),

-- Houston volunteers
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', "Sarah", "Local", '713-555-0002',
 '456 Main St', "Houston", "TX", '77002', 'Healthcare professional, loves helping community',
 10, ARRAY["healthcare", "community"], true, 95, NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', "Mike", "AllSkills", '713-555-0003',
 '789 Oak Ave', "Houston", "TX", '77003', 'Jack of all trades, master of some',
 25, ARRAY["food", "community", "educational", "environmental"], true, 100, NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', "Emma", "Weekends", '713-555-0004',
 '321 Pine Rd', "Houston", "TX", '77004', 'Weekend warrior, only free on Saturdays and Sundays',
 15, ARRAY["environmental", "community"], true, 85, NOW(), NOW()),

-- Austin volunteers
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', "James", "Austin", '512-555-0005',
 '100 Congress Ave', "Austin", "TX", '78701', 'Tech professional willing to travel far',
 200, ARRAY["educational", "technology"], true, 90, NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', "Lisa", "Austin", '512-555-0006',
 '200 Lamar Blvd', "Austin", "TX", '78704', 'Local Austin volunteer, prefers local events',
 5, ARRAY["community", "food"], true, 80, NOW(), NOW()),

-- Dallas volunteers
('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', "David", "Dallas", '214-555-0007',
 '500 Main St', "Dallas", "TX", '75201', 'Construction expert',
 30, ARRAY["community", "disaster"], true, 75, NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', "Maria", "Dallas", '214-555-0008',
 '600 Elm St', "Dallas", "TX", '75202', 'Bilingual educator',
 20, ARRAY["educational", "community"], true, 88, NOW(), NOW()),

-- Los Angeles volunteers
('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', "Carlos", "Rodriguez", '213-555-0009',
 '700 Hollywood Blvd', 'Los Angeles', 'CA', '90028', 'Creative professional',
 15, ARRAY["fundraising", "creative"], true, 92, NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', "Nina", "Lopez", '213-555-0010',
 '800 Sunset Blvd', 'Los Angeles', 'CA', '90046', 'Social media expert',
 10, ARRAY["technology", "fundraising"], true, 94, NOW(), NOW()),

-- New York volunteers
('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', "Robert", "Smith", '212-555-0011',
 '900 Broadway', 'New York', 'NY', '10003', 'Finance professional with fundraising skills',
 8, ARRAY["fundraising", "administrative"], true, 96, NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', "Jessica", "Brown", '212-555-0012',
 '1000 5th Ave', 'New York', 'NY', '10028', 'Teacher and mentor',
 12, ARRAY["educational", "community"], true, 91, NOW(), NOW()),

-- Miami volunteer
('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', "Alex", "Rivera", '305-555-0013',
 '1100 Ocean Dr', "Miami", "FL", '33139', 'Bilingual community organizer',
 20, ARRAY["community", "healthcare"], true, 87, NOW(), NOW()),

-- Chicago volunteer
('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440014', "Sophia", "Chen", '312-555-0014',
 '1200 Michigan Ave', "Chicago", "IL", '60601', 'Event planner and organizer',
 25, ARRAY["community", "fundraising"], true, 89, NOW(), NOW()),

-- Houston volunteer with NO skills
('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440015', "John", "NoSkills", '713-555-0015',
 '1300 Empty St', "Houston", "TX", '77005', 'New volunteer, eager to learn',
 20, ARRAY['community'], true, 60, NOW(), NOW()),

-- Houston volunteer with limited availability
('750e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440016', "Amy", "Busy", '713-555-0016',
 '1400 Workaholic Ln', "Houston", "TX", '77006', 'Very busy, only Monday mornings free',
 30, ARRAY['healthcare", "educational'], true, 78, NOW(), NOW());

-- ============================================================
-- 4. VOLUNTEER SKILLS (Varied proficiency levels)
-- ============================================================

INSERT INTO volunteer_skills (id, "profileId", "skillId", proficiency, "yearsOfExp", certified, "createdAt", "updatedAt") VALUES
-- Sarah Local (Houston) - Healthcare focus, expert level
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'EXPERT', 5, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'EXPERT', 5, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440008', 'INTERMEDIATE', 2, false, NOW(), NOW()),

-- Mike AllSkills (Houston) - Has MANY skills at various levels
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'ADVANCED', 4, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'ADVANCED', 3, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'INTERMEDIATE', 2, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440007', 'INTERMEDIATE', 2, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', 'EXPERT', 6, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440009', 'BEGINNER', 1, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440010', 'INTERMEDIATE', 2, false, NOW(), NOW()),

-- Emma Weekends (Houston) - Environmental focus
('850e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440006', 'EXPERT', 4, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440007', 'BEGINNER', 1, false, NOW(), NOW()),

-- James Austin (Austin) - Tech/Education
('850e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005', 'EXPERT', 5, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440010', 'EXPERT', 4, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440015', '750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440004', 'ADVANCED', 3, false, NOW(), NOW()),

-- Lisa Austin (Austin) - Food service, beginner level
('850e8400-e29b-41d4-a716-446655440016', '750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440008', 'BEGINNER', 1, false, NOW(), NOW()),

-- David Dallas (Dallas) - Construction expert
('850e8400-e29b-41d4-a716-446655440017', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440007', 'EXPERT', 10, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440018', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 'INTERMEDIATE', 2, true, NOW(), NOW()),

-- Maria Dallas (Dallas) - Education/Translation
('850e8400-e29b-41d4-a716-446655440019', '750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440005', 'EXPERT', 7, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440020', '750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440012', 'EXPERT', 7, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440021', '750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440004', 'ADVANCED', 5, false, NOW(), NOW()),

-- Carlos LA (Los Angeles) - Creative/Fundraising
('850e8400-e29b-41d4-a716-446655440022', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440009', 'ADVANCED', 4, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440023', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440011', 'EXPERT', 5, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440024', '750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440003', 'INTERMEDIATE', 2, false, NOW(), NOW()),

-- Nina LA (Los Angeles) - Social Media expert
('850e8400-e29b-41d4-a716-446655440025', '750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440010', 'EXPERT', 6, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440026', '750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440009', 'ADVANCED', 3, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440027', '750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440011', 'INTERMEDIATE', 2, false, NOW(), NOW()),

-- Robert NY (New York) - Fundraising expert
('850e8400-e29b-41d4-a716-446655440028', '750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440009', 'EXPERT', 8, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440029', '750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440003', 'ADVANCED', 5, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440030', '750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440004', 'ADVANCED', 4, false, NOW(), NOW()),

-- Jessica NY (New York) - Teacher
('850e8400-e29b-41d4-a716-446655440031', '750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440005', 'EXPERT', 6, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440032', '750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440004', 'ADVANCED', 5, false, NOW(), NOW()),

-- Alex Miami (Miami) - Healthcare/Translation
('850e8400-e29b-41d4-a716-446655440033', '750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440001', 'INTERMEDIATE', 2, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440034', '750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440012', 'EXPERT', 5, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440035', '750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440003', 'INTERMEDIATE', 2, false, NOW(), NOW()),

-- Sophia Chicago (Chicago) - Event Planning
('850e8400-e29b-41d4-a716-446655440036', '750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440003', 'EXPERT', 7, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440037', '750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440009', 'ADVANCED', 4, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440038', '750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440004', 'INTERMEDIATE', 3, false, NOW(), NOW()),

-- John NoSkills (Houston) - NO SKILLS AT ALL (to show poor matching)

-- Amy Busy (Houston) - Healthcare/Education
('850e8400-e29b-41d4-a716-446655440039', '750e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440001', 'ADVANCED', 3, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440040', '750e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440005', 'INTERMEDIATE', 2, false, NOW(), NOW());

-- ============================================================
-- 5. AVAILABILITY (Varied schedules)
-- ============================================================

INSERT INTO availability (id, "profileId", "dayOfWeek", "specificDate", "isRecurring", "startTime", "endTime", "createdAt", "updatedAt") VALUES
-- Sarah Local - Weekdays, mornings and afternoons
('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', 'Monday', NULL, true, '08:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 'Tuesday', NULL, true, '08:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', 'Wednesday', NULL, true, '08:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', 'Thursday', NULL, true, '08:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440002', 'Friday', NULL, true, '08:00', '17:00', NOW(), NOW()),

-- Mike AllSkills - ALL WEEK, flexible hours
('950e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440003', 'Monday', NULL, true, '06:00', '22:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440003', 'Tuesday', NULL, true, '06:00', '22:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440003', 'Wednesday', NULL, true, '06:00', '22:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440003', 'Thursday', NULL, true, '06:00', '22:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440003', 'Friday', NULL, true, '06:00', '22:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440003', 'Saturday', NULL, true, '08:00', '20:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440003', 'Sunday', NULL, true, '08:00', '20:00', NOW(), NOW()),

-- Emma Weekends - ONLY weekends (to show poor availability match for weekday events)
('950e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440004', 'Saturday', NULL, true, '08:00', '18:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440004', 'Sunday', NULL, true, '10:00', '16:00', NOW(), NOW()),

-- James Austin - Weekday evenings
('950e8400-e29b-41d4-a716-446655440015', '750e8400-e29b-41d4-a716-446655440005', 'Monday', NULL, true, '18:00', '22:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440016', '750e8400-e29b-41d4-a716-446655440005', 'Tuesday', NULL, true, '18:00', '22:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440017', '750e8400-e29b-41d4-a716-446655440005', 'Wednesday', NULL, true, '18:00', '22:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440018', '750e8400-e29b-41d4-a716-446655440005', 'Thursday', NULL, true, '18:00', '22:00', NOW(), NOW()),

-- Lisa Austin - Weekends only, mornings
('950e8400-e29b-41d4-a716-446655440019', '750e8400-e29b-41d4-a716-446655440006', 'Saturday', NULL, true, '08:00', '12:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440020', '750e8400-e29b-41d4-a716-446655440006', 'Sunday', NULL, true, '08:00', '12:00', NOW(), NOW()),

-- David Dallas - Weekdays, full day
('950e8400-e29b-41d4-a716-446655440021', '750e8400-e29b-41d4-a716-446655440007', 'Monday', NULL, true, '07:00', '19:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440022', '750e8400-e29b-41d4-a716-446655440007', 'Tuesday', NULL, true, '07:00', '19:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440023', '750e8400-e29b-41d4-a716-446655440007', 'Wednesday', NULL, true, '07:00', '19:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440024', '750e8400-e29b-41d4-a716-446655440007', 'Thursday', NULL, true, '07:00', '19:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440025', '750e8400-e29b-41d4-a716-446655440007', 'Friday', NULL, true, '07:00', '19:00', NOW(), NOW()),

-- Maria Dallas - After school hours
('950e8400-e29b-41d4-a716-446655440026', '750e8400-e29b-41d4-a716-446655440008', 'Monday', NULL, true, '15:00', '20:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440027', '750e8400-e29b-41d4-a716-446655440008', 'Tuesday', NULL, true, '15:00', '20:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440028', '750e8400-e29b-41d4-a716-446655440008', 'Wednesday', NULL, true, '15:00', '20:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440029', '750e8400-e29b-41d4-a716-446655440008', 'Thursday', NULL, true, '15:00', '20:00', NOW(), NOW()),

-- Carlos LA - Flexible
('950e8400-e29b-41d4-a716-446655440030', '750e8400-e29b-41d4-a716-446655440009', 'Monday', NULL, true, '09:00', '18:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440031', '750e8400-e29b-41d4-a716-446655440009', 'Wednesday', NULL, true, '09:00', '18:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440032', '750e8400-e29b-41d4-a716-446655440009', 'Friday', NULL, true, '09:00', '18:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440033', '750e8400-e29b-41d4-a716-446655440009', 'Saturday', NULL, true, '10:00', '16:00', NOW(), NOW()),

-- Nina LA - Weekdays business hours
('950e8400-e29b-41d4-a716-446655440034', '750e8400-e29b-41d4-a716-446655440010', 'Monday', NULL, true, '09:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440035', '750e8400-e29b-41d4-a716-446655440010', 'Tuesday', NULL, true, '09:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440036', '750e8400-e29b-41d4-a716-446655440010', 'Wednesday', NULL, true, '09:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440037', '750e8400-e29b-41d4-a716-446655440010', 'Thursday', NULL, true, '09:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440038', '750e8400-e29b-41d4-a716-446655440010', 'Friday', NULL, true, '09:00', '17:00', NOW(), NOW()),

-- Robert NY - Weekday evenings only
('950e8400-e29b-41d4-a716-446655440039', '750e8400-e29b-41d4-a716-446655440011', 'Monday', NULL, true, '18:00', '21:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440040', '750e8400-e29b-41d4-a716-446655440011', 'Tuesday', NULL, true, '18:00', '21:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440041', '750e8400-e29b-41d4-a716-446655440011', 'Wednesday', NULL, true, '18:00', '21:00', NOW(), NOW()),

-- Jessica NY - Afternoons and weekends
('950e8400-e29b-41d4-a716-446655440042', '750e8400-e29b-41d4-a716-446655440012', 'Monday', NULL, true, '13:00', '18:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440043', '750e8400-e29b-41d4-a716-446655440012', 'Wednesday', NULL, true, '13:00', '18:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440044', '750e8400-e29b-41d4-a716-446655440012', 'Saturday', NULL, true, '09:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440045', '750e8400-e29b-41d4-a716-446655440012', 'Sunday', NULL, true, '09:00', '17:00', NOW(), NOW()),

-- Alex Miami - Weekend warrior
('950e8400-e29b-41d4-a716-446655440046', '750e8400-e29b-41d4-a716-446655440013', 'Saturday', NULL, true, '08:00', '20:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440047', '750e8400-e29b-41d4-a716-446655440013', 'Sunday', NULL, true, '08:00', '20:00', NOW(), NOW()),

-- Sophia Chicago - Business hours
('950e8400-e29b-41d4-a716-446655440048', '750e8400-e29b-41d4-a716-446655440014', 'Monday', NULL, true, '09:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440049', '750e8400-e29b-41d4-a716-446655440014', 'Tuesday', NULL, true, '09:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440050', '750e8400-e29b-41d4-a716-446655440014', 'Wednesday', NULL, true, '09:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440051', '750e8400-e29b-41d4-a716-446655440014', 'Thursday', NULL, true, '09:00', '17:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440052', '750e8400-e29b-41d4-a716-446655440014', 'Friday', NULL, true, '09:00', '17:00', NOW(), NOW()),

-- John NoSkills - Full availability (to show that just being available isn't enough)
('950e8400-e29b-41d4-a716-446655440053', '750e8400-e29b-41d4-a716-446655440015', 'Monday', NULL, true, '00:00', '23:59', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440054', '750e8400-e29b-41d4-a716-446655440015', 'Tuesday', NULL, true, '00:00', '23:59', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440055', '750e8400-e29b-41d4-a716-446655440015', 'Wednesday', NULL, true, '00:00', '23:59', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440056', '750e8400-e29b-41d4-a716-446655440015', 'Thursday', NULL, true, '00:00', '23:59', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440057', '750e8400-e29b-41d4-a716-446655440015', 'Friday', NULL, true, '00:00', '23:59', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440058', '750e8400-e29b-41d4-a716-446655440015', 'Saturday', NULL, true, '00:00', '23:59', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440059', '750e8400-e29b-41d4-a716-446655440015', 'Sunday', NULL, true, '00:00', '23:59', NOW(), NOW()),

-- Amy Busy - VERY LIMITED availability (only Monday mornings)
('950e8400-e29b-41d4-a716-446655440060', '750e8400-e29b-41d4-a716-446655440016', 'Monday', NULL, true, '08:00', '11:00', NOW(), NOW());

-- ============================================================
-- 6. EVENTS in Houston with varied requirements
-- ============================================================

INSERT INTO events (id, title, description, category, "urgencyLevel", status, "startDate", "endDate",
                   address, city, state, "zipCode", latitude, longitude, "maxVolunteers", "currentVolunteers",
                   "createdBy', 'createdAt", "updatedAt") VALUES

-- Event 1: Community Kitchen - Requires Cooking, in Houston, Tuesday morning
('a50e8400-e29b-41d4-a716-446655440001', 'Community Kitchen',
 'Weekly community meal preparation and service for homeless and food-insecure individuals.',
 "food", "MEDIUM", 'PUBLISHED',
 (NOW() + INTERVAL '7 days')::timestamp AT TIME ZONE 'UTC',
 (NOW() + INTERVAL '7 days' + INTERVAL '4 hours')::timestamp AT TIME ZONE 'UTC',
 '400 Kitchen St', "Houston", "TX", '77004',
 29.7200, -95.3500, 12, 0,
 '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

-- Event 2: Youth Tutoring - Requires Tutoring, in Houston, Wednesday afternoon
('a50e8400-e29b-41d4-a716-446655440002', 'After School Tutoring Program',
 'Help students with homework and provide educational support.',
 "educational", "HIGH", 'PUBLISHED',
 (NOW() + INTERVAL '8 days')::timestamp AT TIME ZONE 'UTC',
 (NOW() + INTERVAL '8 days' + INTERVAL '3 hours')::timestamp AT TIME ZONE 'UTC',
 '500 School Rd', "Houston", "TX", '77005',
 29.7180, -95.4018, 8, 0,
 '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

-- Event 3: Park Cleanup - Requires Gardening, in Houston, Saturday morning
('a50e8400-e29b-41d4-a716-446655440003', 'Community Park Cleanup',
 'Environmental cleanup and beautification of local park.',
 "environmental", "MEDIUM", 'PUBLISHED',
 (NOW() + INTERVAL '10 days')::timestamp AT TIME ZONE 'UTC',
 (NOW() + INTERVAL '10 days' + INTERVAL '3 hours')::timestamp AT TIME ZONE 'UTC',
 '600 Park Ave', "Houston", "TX", '77002',
 29.7520, -95.3635, 15, 0,
 '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

-- Event 4: Health Fair - Requires First Aid/CPR, in Houston, Monday morning (CRITICAL urgency)
('a50e8400-e29b-41d4-a716-446655440004', 'Community Health Fair',
 'Provide health screenings and basic medical assistance to community members.',
 "healthcare", "CRITICAL", 'PUBLISHED',
 (NOW() + INTERVAL '5 days')::timestamp AT TIME ZONE 'UTC',
 (NOW() + INTERVAL '5 days' + INTERVAL '6 hours')::timestamp AT TIME ZONE 'UTC',
 '700 Health Center Blvd', "Houston", "TX", '77030',
 29.7074, -95.4018, 10, 0,
 '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

-- Event 5: Fundraising Gala - Requires Fundraising/Event Planning, in Houston, Friday evening
('a50e8400-e29b-41d4-a716-446655440005', 'Annual Charity Gala',
 'Help organize and run our annual fundraising gala event.',
 "fundraising", "HIGH", 'PUBLISHED',
 (NOW() + INTERVAL '14 days')::timestamp AT TIME ZONE 'UTC',
 (NOW() + INTERVAL '14 days' + INTERVAL '4 hours')::timestamp AT TIME ZONE 'UTC',
 '800 Ballroom Dr', "Houston", "TX", '77006',
 29.7530, -95.3807, 20, 0,
 '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

-- Event 6: Construction Project - Requires Construction, in Houston, Thursday all day
('a50e8400-e29b-41d4-a716-446655440006', 'Habitat for Humanity Build',
 'Help build affordable housing for families in need.',
 "community", "MEDIUM", 'PUBLISHED',
 (NOW() + INTERVAL '12 days')::timestamp AT TIME ZONE 'UTC',
 (NOW() + INTERVAL '12 days' + INTERVAL '8 hours')::timestamp AT TIME ZONE 'UTC',
 '900 Build St', "Houston", "TX", '77003',
 29.7400, -95.3500, 25, 0,
 '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- ============================================================
-- 7. EVENT REQUIREMENTS (Varied skill requirements)
-- ============================================================

INSERT INTO event_requirements (id, "eventId", "skillId", "minLevel", "isRequired", "createdAt", "updatedAt") VALUES
-- Community Kitchen - Cooking required
('b50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440008', 'INTERMEDIATE', true, NOW(), NOW()),

-- Tutoring Program - Tutoring required, Public Speaking optional
('b50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440005', 'INTERMEDIATE', true, NOW(), NOW()),
('b50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'BEGINNER', false, NOW(), NOW()),

-- Park Cleanup - Gardening required
('b50e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'BEGINNER', true, NOW(), NOW()),

-- Health Fair - First Aid and CPR required
('b50e8400-e29b-41d4-a716-446655440005', 'a50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'ADVANCED', true, NOW(), NOW()),
('b50e8400-e29b-41d4-a716-446655440006', 'a50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', 'ADVANCED', true, NOW(), NOW()),

-- Fundraising Gala - Fundraising required, Event Planning required
('b50e8400-e29b-41d4-a716-446655440007', 'a50e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440009', 'INTERMEDIATE', true, NOW(), NOW()),
('b50e8400-e29b-41d4-a716-446655440008', 'a50e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 'INTERMEDIATE', true, NOW(), NOW()),

-- Construction Project - Construction required, First Aid optional
('b50e8400-e29b-41d4-a716-446655440009', 'a50e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440007', 'INTERMEDIATE', true, NOW(), NOW()),
('b50e8400-e29b-41d4-a716-446655440010', 'a50e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440001', 'BEGINNER', false, NOW(), NOW());
