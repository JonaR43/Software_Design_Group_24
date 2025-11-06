-- Fix event days of week to match their intended schedules

-- Helper: Get next occurrence of a specific day of week
-- 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday

-- Event 1: Community Kitchen - Next Tuesday 10:00-14:00
UPDATE events
SET "startDate" = date_trunc('day', CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '10 hours',
    "endDate" = date_trunc('day', CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '14 hours'
WHERE title = 'Community Kitchen';

-- Event 2: After School Tutoring - Next Wednesday 15:00-18:00
UPDATE events
SET "startDate" = date_trunc('day', CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '15 hours',
    "endDate" = date_trunc('day', CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '18 hours'
WHERE title = 'After School Tutoring Program';

-- Event 3: Community Park Cleanup - Next Saturday 09:00-12:00
UPDATE events
SET "startDate" = date_trunc('day', CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '9 hours',
    "endDate" = date_trunc('day', CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '12 hours'
WHERE title = 'Community Park Cleanup';

-- Event 4: Community Health Fair - Next Monday 08:00-14:00
UPDATE events
SET "startDate" = date_trunc('day', CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '8 hours',
    "endDate" = date_trunc('day', CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '14 hours'
WHERE title = 'Community Health Fair';

-- Event 5: Annual Charity Gala - Next Friday 18:00-22:00
UPDATE events
SET "startDate" = date_trunc('day', CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '18 hours',
    "endDate" = date_trunc('day', CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '22 hours'
WHERE title = 'Annual Charity Gala';

-- Event 6: Habitat for Humanity Build - Next Thursday 08:00-16:00
UPDATE events
SET "startDate" = date_trunc('day', CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '8 hours',
    "endDate" = date_trunc('day', CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7 + 7) * interval '1 day') + INTERVAL '16 hours'
WHERE title = 'Habitat for Humanity Build';
