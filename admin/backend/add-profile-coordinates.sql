-- Add latitude and longitude to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Update profiles with GPS coordinates based on city
-- Houston volunteers (29.76°N, 95.37°W)
UPDATE profiles SET latitude = 29.7520, longitude = -95.3635 WHERE "firstName" = 'Sarah' AND "lastName" = 'Local';
UPDATE profiles SET latitude = 29.7400, longitude = -95.3500 WHERE "firstName" = 'Mike' AND "lastName" = 'AllSkills';
UPDATE profiles SET latitude = 29.7200, longitude = -95.3400 WHERE "firstName" = 'Emma' AND "lastName" = 'Weekends';
UPDATE profiles SET latitude = 29.7180, longitude = -95.4018 WHERE "firstName" = 'John' AND "lastName" = 'NoSkills';
UPDATE profiles SET latitude = 29.7530, longitude = -95.3807 WHERE "firstName" = 'Amy' AND "lastName" = 'Busy';
UPDATE profiles SET latitude = 29.7604, longitude = -95.3698 WHERE "firstName" = 'Admin' AND "lastName" = 'User';

-- Austin volunteers (30.27°N, 97.74°W) - ~165 miles from Houston
UPDATE profiles SET latitude = 30.2672, longitude = -97.7431 WHERE "firstName" = 'James' AND "lastName" = 'Austin';
UPDATE profiles SET latitude = 30.2500, longitude = -97.7667 WHERE "firstName" = 'Lisa' AND "lastName" = 'Austin';

-- Dallas volunteers (32.78°N, 96.80°W) - ~240 miles from Houston
UPDATE profiles SET latitude = 32.7767, longitude = -96.7970 WHERE "firstName" = 'David' AND "lastName" = 'Dallas';
UPDATE profiles SET latitude = 32.7800, longitude = -96.8000 WHERE "firstName" = 'Maria' AND "lastName" = 'Dallas';

-- Los Angeles volunteers (34.05°N, 118.24°W) - ~1500 miles from Houston
UPDATE profiles SET latitude = 34.0522, longitude = -118.2437 WHERE "firstName" = 'Carlos' AND "lastName" = 'Rodriguez';
UPDATE profiles SET latitude = 34.0900, longitude = -118.3600 WHERE "firstName" = 'Nina' AND "lastName" = 'Lopez';

-- New York volunteers (40.71°N, 74.01°W) - ~1600 miles from Houston
UPDATE profiles SET latitude = 40.7128, longitude = -74.0060 WHERE "firstName" = 'Robert' AND "lastName" = 'Smith';
UPDATE profiles SET latitude = 40.7794, longitude = -73.9632 WHERE "firstName" = 'Jessica' AND "lastName" = 'Brown';

-- Miami volunteer (25.76°N, 80.19°W) - ~1000 miles from Houston
UPDATE profiles SET latitude = 25.7617, longitude = -80.1918 WHERE "firstName" = 'Alex' AND "lastName" = 'Rivera';

-- Chicago volunteer (41.88°N, 87.63°W) - ~1080 miles from Houston
UPDATE profiles SET latitude = 41.8781, longitude = -87.6298 WHERE "firstName" = 'Sophia' AND "lastName" = 'Chen';
