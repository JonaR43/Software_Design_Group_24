-- ============================================================
-- JACS ShiftPilot - Volunteer Management System
-- Database Schema (PostgreSQL)
-- ============================================================
-- This file creates the complete database schema for the
-- JACS ShiftPilot volunteer management system.
-- ============================================================

-- Create database (run this separately if needed)
-- CREATE DATABASE shiftpilot;
-- \c shiftpilot;

-- Drop existing tables and types if they exist (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS volunteer_history CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS event_requirements CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS availability CASCADE;
DROP TABLE IF EXISTS volunteer_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS states CASCADE;

-- Drop existing enums if they exist
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "EventStatus" CASCADE;
DROP TYPE IF EXISTS "UrgencyLevel" CASCADE;
DROP TYPE IF EXISTS "AssignmentStatus" CASCADE;
DROP TYPE IF EXISTS "ParticipationStatus" CASCADE;
DROP TYPE IF EXISTS "AttendanceType" CASCADE;
DROP TYPE IF EXISTS "ProficiencyLevel" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;
DROP TYPE IF EXISTS "NotificationPriority" CASCADE;

-- ============================================================
-- ENUMS (Custom Types)
-- ============================================================

CREATE TYPE "Role" AS ENUM ('VOLUNTEER', 'ADMIN');

CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED', 'COMPLETED');

CREATE TYPE "ParticipationStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

CREATE TYPE "AttendanceType" AS ENUM ('PENDING', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

CREATE TYPE "NotificationType" AS ENUM ('ASSIGNMENT', 'REMINDER', 'EVENT_UPDATE', 'MATCHING_SUGGESTION', 'ANNOUNCEMENT', 'SYSTEM');

CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- ============================================================
-- TABLES
-- ============================================================

-- Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role "Role" DEFAULT 'VOLUNTEER' NOT NULL,
    verified BOOLEAN DEFAULT false NOT NULL,
    "oauthProvider" VARCHAR(50),
    "oauthId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Profiles Table
CREATE TABLE profiles (
    id VARCHAR(36) PRIMARY KEY,
    "userId" VARCHAR(36) UNIQUE NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    "zipCode" VARCHAR(10),
    bio TEXT,
    avatar VARCHAR(500),
    "maxTravelDistance" INTEGER DEFAULT 25,
    "preferredDays" VARCHAR(20)[],
    "preferredTimeSlots" VARCHAR(50)[],
    "preferredCauses" VARCHAR(100)[],
    "emailNotifications" BOOLEAN DEFAULT true NOT NULL,
    "eventReminders" BOOLEAN DEFAULT true NOT NULL,
    "weekendsOnly" BOOLEAN DEFAULT false NOT NULL,
    "profileCompleteness" INTEGER DEFAULT 0 NOT NULL,
    "lastActive" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Skills Table
CREATE TABLE skills (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Volunteer Skills (Junction Table)
CREATE TABLE volunteer_skills (
    id VARCHAR(36) PRIMARY KEY,
    "profileId" VARCHAR(36) NOT NULL,
    "skillId" VARCHAR(36) NOT NULL,
    proficiency "ProficiencyLevel" NOT NULL,
    "yearsOfExp" INTEGER DEFAULT 0,
    certified BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY ("skillId") REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE ("profileId", "skillId")
);

-- Availability Table
CREATE TABLE availability (
    id VARCHAR(36) PRIMARY KEY,
    "profileId" VARCHAR(36) NOT NULL,
    "dayOfWeek" VARCHAR(20),
    "specificDate" DATE,
    "isRecurring" BOOLEAN DEFAULT true NOT NULL,
    "startTime" VARCHAR(10) NOT NULL,
    "endTime" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("profileId") REFERENCES profiles(id) ON DELETE CASCADE
);

-- Events Table
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    "urgencyLevel" "UrgencyLevel" DEFAULT 'MEDIUM' NOT NULL,
    status "EventStatus" DEFAULT 'DRAFT' NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    "zipCode" VARCHAR(10) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    "maxVolunteers" INTEGER NOT NULL,
    "currentVolunteers" INTEGER DEFAULT 0 NOT NULL,
    "createdBy" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("createdBy") REFERENCES users(id)
);

-- Event Requirements Table
CREATE TABLE event_requirements (
    id VARCHAR(36) PRIMARY KEY,
    "eventId" VARCHAR(36) NOT NULL,
    "skillId" VARCHAR(36) NOT NULL,
    "minLevel" "ProficiencyLevel" NOT NULL,
    "isRequired" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("eventId") REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY ("skillId") REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE ("eventId", "skillId")
);

-- Assignments Table
CREATE TABLE assignments (
    id VARCHAR(36) PRIMARY KEY,
    "eventId" VARCHAR(36) NOT NULL,
    "volunteerId" VARCHAR(36) NOT NULL,
    status "AssignmentStatus" DEFAULT 'PENDING' NOT NULL,
    "matchScore" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    notes TEXT,
    "assignedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("eventId") REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY ("volunteerId") REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE ("eventId", "volunteerId")
);

-- Volunteer History Table
CREATE TABLE volunteer_history (
    id VARCHAR(36) PRIMARY KEY,
    "volunteerId" VARCHAR(36) NOT NULL,
    "eventId" VARCHAR(36) NOT NULL,
    "assignmentId" VARCHAR(36),
    status "ParticipationStatus" NOT NULL,
    "hoursWorked" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "performanceRating" INTEGER,
    feedback TEXT,
    attendance "AttendanceType" NOT NULL,
    "skillsUtilized" VARCHAR(100)[],
    "participationDate" TIMESTAMP(3) NOT NULL,
    "completionDate" TIMESTAMP(3),
    "recordedBy" VARCHAR(36),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("volunteerId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("eventId") REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE ("volunteerId", "eventId")
);

-- Notifications Table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    "userId" VARCHAR(36) NOT NULL,
    type "NotificationType" NOT NULL,
    priority "NotificationPriority" DEFAULT 'MEDIUM' NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    "eventId" VARCHAR(36),
    "relatedId" VARCHAR(36),
    read BOOLEAN DEFAULT false NOT NULL,
    "readAt" TIMESTAMP(3),
    "actionUrl" VARCHAR(500),
    "actionLabel" VARCHAR(100),
    metadata JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- States Table (for dropdown selection)
CREATE TABLE states (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(2) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================================
-- INDEXES (for performance)
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_profiles_userId ON profiles("userId");
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_startDate ON events("startDate");
CREATE INDEX idx_events_createdBy ON events("createdBy");
CREATE INDEX idx_assignments_volunteerId ON assignments("volunteerId");
CREATE INDEX idx_assignments_eventId ON assignments("eventId");
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_notifications_userId ON notifications("userId");
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_volunteer_history_volunteerId ON volunteer_history("volunteerId");
CREATE INDEX idx_volunteer_history_eventId ON volunteer_history("eventId");

-- ============================================================
-- COMMENTS (for documentation)
-- ============================================================

COMMENT ON TABLE users IS 'Stores user authentication and account information';
COMMENT ON TABLE profiles IS 'Stores detailed volunteer profile information';
COMMENT ON TABLE skills IS 'Master list of available skills';
COMMENT ON TABLE volunteer_skills IS 'Maps volunteers to their skills with proficiency levels';
COMMENT ON TABLE availability IS 'Tracks volunteer availability schedules';
COMMENT ON TABLE events IS 'Stores volunteer event information';
COMMENT ON TABLE event_requirements IS 'Defines skill requirements for events';
COMMENT ON TABLE assignments IS 'Tracks volunteer-event assignments';
COMMENT ON TABLE volunteer_history IS 'Records volunteer participation history and feedback';
COMMENT ON TABLE notifications IS 'Manages user notifications';
COMMENT ON TABLE states IS 'Reference table for US states';

-- ============================================================
-- Schema Creation Complete
-- ============================================================
-- Next step: Run the mock data SQL file (database_mock_data.sql)
-- to populate the database with sample data for testing.
-- ============================================================
