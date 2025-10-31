-- ============================================================
-- JACS ShiftPilot - Volunteer Management System
-- Mock Data for Testing
-- ============================================================
-- This file populates the database with sample data for testing
-- and demonstration purposes.
--
-- Prerequisites: Run database_schema.sql first
-- ============================================================

-- Set timezone
SET timezone = 'UTC';

-- ============================================================
-- 1. USERS
-- ============================================================
-- Password for all users: Admin@123 or Volunteer@123
-- Hashed with bcrypt (10 rounds)

INSERT INTO users (id, username, email, password, role, verified, "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@example.com', '$2a$10$YourHashedPasswordHere', 'ADMIN', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'sarah.johnson', 'sarah.johnson@example.com', '$2a$10$YourHashedPasswordHere', 'VOLUNTEER', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'michael.chen', 'michael.chen@example.com', '$2a$10$YourHashedPasswordHere', 'VOLUNTEER', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'emma.davis', 'emma.davis@example.com', '$2a$10$YourHashedPasswordHere', 'VOLUNTEER', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'james.wilson', 'james.wilson@example.com', '$2a$10$YourHashedPasswordHere', 'VOLUNTEER', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'olivia.martinez', 'olivia.martinez@example.com', '$2a$10$YourHashedPasswordHere', 'VOLUNTEER', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'william.brown', 'william.brown@example.com', '$2a$10$YourHashedPasswordHere', 'VOLUNTEER', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'sophia.garcia', 'sophia.garcia@example.com', '$2a$10$YourHashedPasswordHere', 'VOLUNTEER', true, NOW(), NOW());

-- ============================================================
-- 2. SKILLS
-- ============================================================

INSERT INTO skills (id, name, category, description, "createdAt", "updatedAt") VALUES
('650e8400-e29b-41d4-a716-446655440001', 'First Aid', 'Healthcare', 'Basic medical assistance and emergency response', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'CPR Certified', 'Healthcare', 'Cardiopulmonary resuscitation certification', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440003', 'Event Planning', 'Administrative', 'Organizing and coordinating events', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440004', 'Public Speaking', 'Communication', 'Speaking to groups and presentations', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440005', 'Tutoring', 'Education', 'Teaching and mentoring students', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440006', 'Gardening', 'Environmental', 'Plant care and landscaping', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440007', 'Construction', 'Manual Labor', 'Building and repair skills', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440008', 'Cooking', 'Food Service', 'Food preparation and meal planning', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440009', 'Fundraising', 'Administrative', 'Raising money for causes', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440010', 'Social Media', 'Technology', 'Managing social media accounts', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440011', 'Photography', 'Creative', 'Taking and editing photos', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440012', 'Translation', 'Communication', 'Spanish-English translation', NOW(), NOW());

-- ============================================================
-- 3. PROFILES
-- ============================================================

INSERT INTO profiles (id, "userId", "firstName", "lastName", phone, address, city, state, "zipCode", bio, "maxTravelDistance", "preferredDays", "preferredTimeSlots", "preferredCauses", "emailNotifications", "eventReminders", "weekendsOnly", "profileCompleteness", "lastActive", "createdAt", "updatedAt") VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Admin', 'User', '713-555-0100', '100 Admin St', 'Houston', 'TX', '77001', 'System administrator', 50, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], ARRAY['morning', 'afternoon'], ARRAY['administrative'], true, true, false, 100, NOW(), NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Sarah', 'Johnson', '555-0101', '123 Main St', 'Houston', 'TX', '77001', 'Passionate about community service and healthcare', 25, ARRAY['Tuesday', 'Thursday', 'Saturday'], ARRAY['afternoon', 'evening'], ARRAY['healthcare', 'community'], true, true, false, 85, NOW(), NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Michael', 'Chen', '555-0102', '456 Oak Ave', 'Houston', 'TX', '77002', 'Software engineer looking to give back through education', 30, ARRAY['Monday', 'Wednesday', 'Friday'], ARRAY['evening'], ARRAY['education', 'technology'], true, true, false, 90, NOW(), NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Emma', 'Davis', '555-0103', '789 Pine Rd', 'Houston', 'TX', '77003', 'Environmental advocate and gardening enthusiast', 20, ARRAY['Saturday', 'Sunday'], ARRAY['morning', 'afternoon'], ARRAY['environmental', 'community'], true, true, true, 80, NOW(), NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'James', 'Wilson', '555-0104', '321 Elm St', 'Houston', 'TX', '77004', 'Construction worker with a heart for building community', 35, ARRAY['Monday', 'Tuesday', 'Wednesday'], ARRAY['morning', 'afternoon'], ARRAY['community', 'disaster'], true, true, false, 75, NOW(), NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'Olivia', 'Martinez', '555-0105', '654 Maple Dr', 'Houston', 'TX', '77005', 'Bilingual educator passionate about helping others', 25, ARRAY['Thursday', 'Friday', 'Saturday'], ARRAY['afternoon', 'evening'], ARRAY['education', 'food'], true, true, false, 88, NOW(), NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'William', 'Brown', '555-0106', '987 Cedar Ln', 'Houston', 'TX', '77006', 'Retired chef wanting to share culinary skills', 15, ARRAY['Monday', 'Wednesday', 'Friday', 'Saturday'], ARRAY['morning', 'afternoon'], ARRAY['food', 'community'], true, true, false, 82, NOW(), NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 'Sophia', 'Garcia', '555-0107', '147 Birch Ave', 'Houston', 'TX', '77007', 'Marketing professional skilled in social media and fundraising', 40, ARRAY['Tuesday', 'Thursday', 'Sunday'], ARRAY['afternoon', 'evening'], ARRAY['fundraising', 'administrative'], true, true, false, 92, NOW(), NOW(), NOW());

-- ============================================================
-- 4. VOLUNTEER SKILLS
-- ============================================================

INSERT INTO volunteer_skills (id, "profileId", "skillId", proficiency, "yearsOfExp", certified, "createdAt", "updatedAt") VALUES
-- Sarah Johnson - Healthcare focus
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'ADVANCED', 3, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'INTERMEDIATE', 2, true, NOW(), NOW()),

-- Michael Chen - Education/Tech focus
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'EXPERT', 5, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440010', 'ADVANCED', 4, false, NOW(), NOW()),

-- Emma Davis - Environmental focus
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440006', 'EXPERT', 8, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440011', 'INTERMEDIATE', 2, false, NOW(), NOW()),

-- James Wilson - Construction focus
('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440007', 'EXPERT', 10, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 'BEGINNER', 1, false, NOW(), NOW()),

-- Olivia Martinez - Education/Translation
('850e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440005', 'ADVANCED', 6, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440012', 'EXPERT', 10, false, NOW(), NOW()),

-- William Brown - Cooking focus
('850e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440008', 'EXPERT', 15, true, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 'INTERMEDIATE', 5, false, NOW(), NOW()),

-- Sophia Garcia - Fundraising/Social Media
('850e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440009', 'ADVANCED', 7, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440010', 'EXPERT', 8, false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440015', '750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440003', 'ADVANCED', 5, false, NOW(), NOW());

-- ============================================================
-- 5. AVAILABILITY
-- ============================================================

-- Sarah Johnson availability
INSERT INTO availability (id, "profileId", "dayOfWeek", "specificDate", "isRecurring", "startTime", "endTime", "createdAt", "updatedAt") VALUES
('950e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', 'Tuesday', NULL, true, '14:00', '18:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 'Thursday', NULL, true, '14:00', '18:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', 'Saturday', NULL, true, '09:00', '17:00', NOW(), NOW());

-- Michael Chen availability
INSERT INTO availability (id, "profileId", "dayOfWeek", "specificDate", "isRecurring", "startTime", "endTime", "createdAt", "updatedAt") VALUES
('950e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440003', 'Monday', NULL, true, '18:00', '21:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440003', 'Wednesday', NULL, true, '18:00', '21:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440003', 'Friday', NULL, true, '18:00', '21:00', NOW(), NOW());

-- Emma Davis availability
INSERT INTO availability (id, "profileId", "dayOfWeek", "specificDate", "isRecurring", "startTime", "endTime", "createdAt", "updatedAt") VALUES
('950e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440004', 'Saturday', NULL, true, '08:00', '16:00', NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440004', 'Sunday', NULL, true, '08:00', '16:00', NOW(), NOW());

-- ============================================================
-- 6. EVENTS
-- ============================================================

INSERT INTO events (id, title, description, category, "urgencyLevel", status, "startDate", "endDate", address, city, state, "zipCode", latitude, longitude, "maxVolunteers", "currentVolunteers", "createdBy", "createdAt", "updatedAt") VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'Community Health Fair', 'Annual health fair providing free health screenings, vaccinations, and health education to underserved communities.', 'healthcare', 'MEDIUM', 'PUBLISHED', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '8 hours', '500 Community Blvd', 'Houston', 'TX', '77001', 29.7604, -95.3698, 20, 3, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

('a50e8400-e29b-41d4-a716-446655440002', 'Youth Tutoring Program', 'After-school tutoring program for middle school students in math, science, and reading.', 'educational', 'HIGH', 'PUBLISHED', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', '200 Education Dr', 'Houston', 'TX', '77002', 29.7430, -95.3977, 15, 2, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

('a50e8400-e29b-41d4-a716-446655440003', 'Park Cleanup Day', 'Monthly park cleanup and beautification project. Help keep our parks clean and green!', 'environmental', 'LOW', 'PUBLISHED', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '4 hours', '300 Park Ave', 'Houston', 'TX', '77003', 29.7219, -95.3512, 30, 5, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

('a50e8400-e29b-41d4-a716-446655440004', 'Community Kitchen', 'Weekly community meal preparation and service for homeless and food-insecure individuals.', 'food', 'HIGH', 'PUBLISHED', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '6 hours', '400 Kitchen St', 'Houston', 'TX', '77004', 29.7355, -95.3987, 12, 4, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

('a50e8400-e29b-41d4-a716-446655440005', 'Habitat Home Build', 'Help build homes for families in need. Construction experience helpful but not required.', 'community', 'MEDIUM', 'PUBLISHED', NOW() + INTERVAL '28 days', NOW() + INTERVAL '28 days' + INTERVAL '8 hours', '600 Build Rd', 'Houston', 'TX', '77005', 29.7189, -95.4031, 25, 8, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

('a50e8400-e29b-41d4-a716-446655440006', 'Charity Fundraising Gala', 'Annual fundraising event to support local community programs. Need event staff and social media coverage.', 'fundraising', 'HIGH', 'PUBLISHED', NOW() + INTERVAL '35 days', NOW() + INTERVAL '35 days' + INTERVAL '5 hours', '700 Gala Blvd', 'Houston', 'TX', '77006', 29.7297, -95.3959, 10, 2, '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- ============================================================
-- 7. EVENT REQUIREMENTS
-- ============================================================

-- Community Health Fair requirements
INSERT INTO event_requirements (id, "eventId", "skillId", "minLevel", "isRequired", "createdAt", "updatedAt") VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'INTERMEDIATE', true, NOW(), NOW()),
('b50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'INTERMEDIATE', false, NOW(), NOW());

-- Youth Tutoring Program requirements
INSERT INTO event_requirements (id, "eventId", "skillId", "minLevel", "isRequired", "createdAt", "updatedAt") VALUES
('b50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440005', 'INTERMEDIATE', true, NOW(), NOW());

-- Park Cleanup requirements
INSERT INTO event_requirements (id, "eventId", "skillId", "minLevel", "isRequired", "createdAt", "updatedAt") VALUES
('b50e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'BEGINNER', false, NOW(), NOW());

-- Community Kitchen requirements
INSERT INTO event_requirements (id, "eventId", "skillId", "minLevel", "isRequired", "createdAt", "updatedAt") VALUES
('b50e8400-e29b-41d4-a716-446655440005', 'a50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440008', 'INTERMEDIATE', true, NOW(), NOW()),
('b50e8400-e29b-41d4-a716-446655440006', 'a50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'BEGINNER', false, NOW(), NOW());

-- Habitat Home Build requirements
INSERT INTO event_requirements (id, "eventId", "skillId", "minLevel", "isRequired", "createdAt", "updatedAt") VALUES
('b50e8400-e29b-41d4-a716-446655440007', 'a50e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440007', 'INTERMEDIATE', false, NOW(), NOW());

-- Fundraising Gala requirements
INSERT INTO event_requirements (id, "eventId", "skillId", "minLevel", "isRequired", "createdAt", "updatedAt") VALUES
('b50e8400-e29b-41d4-a716-446655440008', 'a50e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440009', 'INTERMEDIATE', true, NOW(), NOW()),
('b50e8400-e29b-41d4-a716-446655440009', 'a50e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440010', 'ADVANCED', false, NOW(), NOW());

-- ============================================================
-- 8. ASSIGNMENTS
-- ============================================================

INSERT INTO assignments (id, "eventId", "volunteerId", status, "matchScore", notes, "assignedAt", "confirmedAt", "updatedAt") VALUES
-- Community Health Fair assignments
('c50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'CONFIRMED', 95.5, 'Excellent first aid skills', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW()),
('c50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', 'CONFIRMED', 78.0, 'Good general support', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW()),

-- Youth Tutoring assignments
('c50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'CONFIRMED', 98.5, 'Perfect match for math tutoring', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW()),
('c50e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'PENDING', 92.0, 'Great for bilingual students', NOW() - INTERVAL '1 day', NULL, NOW()),

-- Park Cleanup assignments
('c50e8400-e29b-41d4-a716-446655440005', 'a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'CONFIRMED', 96.0, 'Gardening expert', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
('c50e8400-e29b-41d4-a716-446655440006', 'a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'CONFIRMED', 65.0, NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW()),

-- Community Kitchen assignments
('c50e8400-e29b-41d4-a716-446655440007', 'a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'CONFIRMED', 99.0, 'Professional chef', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', NOW()),
('c50e8400-e29b-41d4-a716-446655440008', 'a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', 'PENDING', 75.0, NULL, NOW(), NULL, NOW()),

-- Fundraising Gala assignments
('c50e8400-e29b-41d4-a716-446655440009', 'a50e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440008', 'CONFIRMED', 97.5, 'Perfect for social media coverage', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW());

-- ============================================================
-- 9. NOTIFICATIONS
-- ============================================================

INSERT INTO notifications (id, "userId", type, priority, title, message, "eventId", "relatedId", read, "readAt", "actionUrl", "actionLabel", metadata, "expiresAt", "createdAt", "updatedAt") VALUES
-- Sarah Johnson notifications
('d50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'ASSIGNMENT', 'HIGH', 'New Event Assignment', 'You have been assigned to Community Health Fair on ' || TO_CHAR(NOW() + INTERVAL '14 days', 'Mon DD, YYYY'), 'a50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001', true, NOW() - INTERVAL '1 day', '/dashboard/events/a50e8400-e29b-41d4-a716-446655440001', 'View Event', NULL, NOW() + INTERVAL '30 days', NOW() - INTERVAL '3 days', NOW()),

('d50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'REMINDER', 'MEDIUM', 'Event Reminder', 'Reminder: Community Health Fair starts in 3 days', 'a50e8400-e29b-41d4-a716-446655440001', NULL, false, NULL, '/dashboard/events/a50e8400-e29b-41d4-a716-446655440001', 'View Event', NULL, NOW() + INTERVAL '14 days', NOW(), NOW()),

-- Michael Chen notifications
('d50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'MATCHING_SUGGESTION', 'MEDIUM', 'Recommended Event', 'Youth Tutoring Program matches your skills and availability!', 'a50e8400-e29b-41d4-a716-446655440002', NULL, false, NULL, '/dashboard/events/a50e8400-e29b-41d4-a716-446655440002', 'View Event', '{"matchScore": 98.5}', NOW() + INTERVAL '7 days', NOW() - INTERVAL '4 days', NOW()),

-- Sophia Garcia notifications
('d50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', 'ASSIGNMENT', 'HIGH', 'Event Assignment Confirmed', 'Your assignment to Charity Fundraising Gala has been confirmed', 'a50e8400-e29b-41d4-a716-446655440006', 'c50e8400-e29b-41d4-a716-446655440009', true, NOW(), '/dashboard/events/a50e8400-e29b-41d4-a716-446655440006', 'View Event', NULL, NOW() + INTERVAL '35 days', NOW() - INTERVAL '1 day', NOW());

-- ============================================================
-- 10. VOLUNTEER HISTORY
-- ============================================================

INSERT INTO volunteer_history (id, "volunteerId", "eventId", "assignmentId", status, "hoursWorked", "performanceRating", feedback, attendance, "skillsUtilized", "participationDate", "completionDate", "recordedBy", "adminNotes", "createdAt", "updatedAt") VALUES
-- Sarah's past participation
('e50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001', 'COMPLETED', 6.5, 5, 'Excellent volunteer! Very knowledgeable and professional.', 'PRESENT', ARRAY['First Aid', 'CPR Certified'], NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', '550e8400-e29b-41d4-a716-446655440001', 'Outstanding performance', NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'),

-- Michael's past participation
('e50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440002', NULL, 'COMPLETED', 3.0, 5, 'Great tutor, students loved working with him!', 'PRESENT', ARRAY['Tutoring'], NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days', '550e8400-e29b-41d4-a716-446655440001', 'Highly effective tutor', NOW() - INTERVAL '44 days', NOW() - INTERVAL '44 days'),

-- Emma's past participation
('e50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440003', NULL, 'COMPLETED', 4.0, 5, 'Brought expertise and enthusiasm to the project', 'PRESENT', ARRAY['Gardening'], NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days', '550e8400-e29b-41d4-a716-446655440001', 'Exceptional volunteer', NOW() - INTERVAL '59 days', NOW() - INTERVAL '59 days');

-- ============================================================
-- 11. US STATES (for dropdown selection)
-- ============================================================

INSERT INTO states (id, code, name, abbreviation, "createdAt", "updatedAt") VALUES
('f50e8400-e29b-41d4-a716-446655440001', 'AL', 'Alabama', 'AL', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440002', 'AK', 'Alaska', 'AK', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440003', 'AZ', 'Arizona', 'AZ', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440004', 'AR', 'Arkansas', 'AR', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440005', 'CA', 'California', 'CA', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440006', 'CO', 'Colorado', 'CO', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440007', 'CT', 'Connecticut', 'CT', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440008', 'DE', 'Delaware', 'DE', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440009', 'FL', 'Florida', 'FL', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440010', 'GA', 'Georgia', 'GA', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440044', 'TX', 'Texas', 'TX', NOW(), NOW()),
('f50e8400-e29b-41d4-a716-446655440050', 'NY', 'New York', 'NY', NOW(), NOW());
-- Add more states as needed

-- ============================================================
-- MOCK DATA COMPLETE
-- ============================================================
-- Note: Password hashes are placeholders. Use bcrypt to generate
-- real hashes with: bcrypt.hash('YourPassword', 10)
-- ============================================================

-- Update event current volunteer counts based on assignments
UPDATE events e SET "currentVolunteers" = (
    SELECT COUNT(*) FROM assignments a
    WHERE a."eventId" = e.id AND a.status IN ('CONFIRMED', 'COMPLETED')
);

-- Verify data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'Skills', COUNT(*) FROM skills
UNION ALL
SELECT 'Volunteer Skills', COUNT(*) FROM volunteer_skills
UNION ALL
SELECT 'Availability', COUNT(*) FROM availability
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'Event Requirements', COUNT(*) FROM event_requirements
UNION ALL
SELECT 'Assignments', COUNT(*) FROM assignments
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Volunteer History', COUNT(*) FROM volunteer_history
UNION ALL
SELECT 'States', COUNT(*) FROM states;

-- ============================================================
-- END OF MOCK DATA
-- ============================================================
