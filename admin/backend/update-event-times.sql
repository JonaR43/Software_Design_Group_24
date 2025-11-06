-- Update event times to realistic daytime hours

-- Event 1: Community Kitchen - Tuesday 10:00-14:00
UPDATE events
SET "startDate" = date_trunc('day', "startDate") + INTERVAL '10 hours',
    "endDate" = date_trunc('day', "endDate") + INTERVAL '14 hours'
WHERE title = 'Community Kitchen';

-- Event 2: After School Tutoring Program - Wednesday 15:00-18:00
UPDATE events
SET "startDate" = date_trunc('day', "startDate") + INTERVAL '15 hours',
    "endDate" = date_trunc('day', "endDate") + INTERVAL '18 hours'
WHERE title = 'After School Tutoring Program';

-- Event 3: Community Park Cleanup - Saturday 09:00-12:00
UPDATE events
SET "startDate" = date_trunc('day', "startDate") + INTERVAL '9 hours',
    "endDate" = date_trunc('day', "endDate") + INTERVAL '12 hours'
WHERE title = 'Community Park Cleanup';

-- Event 4: Community Health Fair - Monday 08:00-14:00
UPDATE events
SET "startDate" = date_trunc('day', "startDate") + INTERVAL '8 hours',
    "endDate" = date_trunc('day', "endDate") + INTERVAL '14 hours'
WHERE title = 'Community Health Fair';

-- Event 5: Annual Charity Gala - Friday 18:00-22:00
UPDATE events
SET "startDate" = date_trunc('day', "startDate") + INTERVAL '18 hours',
    "endDate" = date_trunc('day', "endDate") + INTERVAL '22 hours'
WHERE title = 'Annual Charity Gala';

-- Event 6: Habitat for Humanity Build - Thursday 08:00-16:00
UPDATE events
SET "startDate" = date_trunc('day', "startDate") + INTERVAL '8 hours',
    "endDate" = date_trunc('day', "endDate") + INTERVAL '16 hours'
WHERE title = 'Habitat for Humanity Build';
