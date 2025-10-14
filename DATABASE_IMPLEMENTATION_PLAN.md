# Database Implementation Plan for Assignment 4
**JACS ShiftPilot - Volunteer Management System**
**Using PostgreSQL + Prisma ORM**

---

## Table of Contents
1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [What Stays vs What Changes](#what-stays-vs-what-changes)
4. [PostgreSQL Installation & Setup](#postgresql-installation--setup)
5. [Prisma Installation & Configuration](#prisma-installation--configuration)
6. [Database Schema Design](#database-schema-design)
7. [Implementation Phases](#implementation-phases)
8. [File Structure Changes](#file-structure-changes)
9. [Testing Strategy](#testing-strategy)
10. [Submission Requirements](#submission-requirements)
11. [Timeline & Milestones](#timeline--milestones)

---

## Overview

### Assignment 4 Requirements
- Create database and connect to web application
- Can use RDBMS or NoSQL
- Must include: UserCredentials, UserProfile, EventDetails, VolunteerHistory, States
- Validations for required fields, field types, and lengths
- Data retrieval and display from backend to frontend
- Data persistence from frontend to backend
- Unit tests with 80%+ code coverage

### Our Approach
- **Database:** PostgreSQL (RDBMS)
- **ORM:** Prisma (modern, type-safe, excellent DX)
- **Strategy:** Incremental migration from in-memory arrays to database
- **Goal:** Maintain all existing functionality and 80%+ test coverage

---

## Current State Analysis

### ✅ What We Have
- **Branch:** Database (ready for implementation)
- **Tests:** 627 passing tests
- **Coverage:** 84.99% overall, 81.76% branch coverage
- **Architecture:**
  - In-memory data storage (`src/data/` folder)
  - REST API with Express.js
  - JWT authentication
  - Matching algorithm implemented
  - Notification system
  - Full test suite

### 🔄 What We're Changing
- Replace in-memory arrays with PostgreSQL database
- Add Prisma ORM for type-safe queries
- Create repository layer for data access
- Update services to use async database operations
- Maintain all existing business logic

---

## What Stays vs What Changes

### ✅ NO CHANGES NEEDED (Keep Everything)

#### 1. **All Controllers** (7 files)
- `src/controllers/authController.js`
- `src/controllers/eventController.js`
- `src/controllers/profileController.js`
- `src/controllers/historyController.js`
- `src/controllers/matchingController.js`
- `src/controllers/notificationController.js`
- `src/controllers/adminController.js`

**Why:** Already using async/await, just minor updates for Prisma responses

#### 2. **All Routes** (7 files)
- `src/routes/auth.js`
- `src/routes/events.js`
- `src/routes/profile.js`
- `src/routes/history.js`
- `src/routes/matching.js`
- `src/routes/notifications.js`
- `src/routes/admin.js`

**Why:** API endpoints stay the same, frontend compatibility maintained

#### 3. **All Middleware** (3 files)
- `src/middleware/auth.js`
- `src/middleware/validation.js`
- `src/middleware/errorHandler.js`

**Why:** Authentication and validation logic unchanged

#### 4. **Business Logic in Services**
- Matching algorithm stays the same
- Authentication logic stays the same
- Notification logic stays the same
- Only the data source changes

#### 5. **Frontend**
- Zero changes required
- API contracts unchanged
- No frontend work for Assignment 4

### 🔄 CHANGES REQUIRED

#### 1. **Data Layer** (Replace)
**OLD:** `src/data/` folder (JavaScript arrays)
- `users.js`
- `events.js`
- `history.js`
- `notifications.js`
- `skills.js`

**NEW:** `src/database/` folder (Prisma repositories)
- `userRepository.js`
- `eventRepository.js`
- `historyRepository.js`
- `notificationRepository.js`
- `skillRepository.js`

#### 2. **Services** (Update imports and add await)
- Change: `require('../data/users')` → `require('../database/userRepository')`
- Add: `await` to all database calls
- Keep: All business logic unchanged

#### 3. **Tests** (Update for async operations)
- Add `await` where needed
- Update mocks to return Promises
- Use test database
- Maintain 80%+ coverage

---

## PostgreSQL Installation & Setup

### For WSL2 (Windows Subsystem for Linux)
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start

# Check status
sudo service postgresql status
```

### For macOS
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

### For Native Linux
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, create user and databases:
CREATE USER jacs_admin WITH PASSWORD 'your_secure_password';
CREATE DATABASE jacs_shiftpilot OWNER jacs_admin;
CREATE DATABASE jacs_shiftpilot_test OWNER jacs_admin;
GRANT ALL PRIVILEGES ON DATABASE jacs_shiftpilot TO jacs_admin;
GRANT ALL PRIVILEGES ON DATABASE jacs_shiftpilot_test TO jacs_admin;
\q
```

### Test Connection
```bash
# Test connection
psql -U jacs_admin -d jacs_shiftpilot -h localhost

# If successful, you'll see: jacs_shiftpilot=>
# Type \q to exit
```

---

## Prisma Installation & Configuration

### Install Prisma Packages
```bash
cd admin/backend
npm install prisma @prisma/client
npm install --save-dev prisma
```

### Initialize Prisma
```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema definition
- `.env` - Database connection URL (if not exists)

### Configure Environment Variables

Update `admin/backend/.env`:
```env
# Database URLs
DATABASE_URL="postgresql://jacs_admin:your_secure_password@localhost:5432/jacs_shiftpilot?schema=public"
DATABASE_TEST_URL="postgresql://jacs_admin:your_secure_password@localhost:5432/jacs_shiftpilot_test?schema=public"

# Node Environment
NODE_ENV=development

# JWT Secret (keep existing)
JWT_SECRET=your_existing_jwt_secret

# Email Config (keep existing if you have it)
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
```

---

## Database Schema Design

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USERS & AUTHENTICATION
// ============================================

model User {
  id        String   @id @default(uuid())
  username  String   @unique @db.VarChar(100)
  email     String   @unique @db.VarChar(255)
  password  String   @db.VarChar(255) // bcrypt hashed
  role      Role     @default(VOLUNTEER)
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile       Profile?
  assignments   Assignment[]
  history       VolunteerHistory[]
  notifications Notification[]

  @@index([email])
  @@index([role])
  @@map("users")
}

enum Role {
  ADMIN
  VOLUNTEER
}

// ============================================
// USER PROFILES
// ============================================

model Profile {
  id               String   @id @default(uuid())
  userId           String   @unique
  firstName        String?  @db.VarChar(100)
  lastName         String?  @db.VarChar(100)
  phone            String?  @db.VarChar(20)
  address          String?  @db.VarChar(255)
  city             String?  @db.VarChar(100)
  state            String?  @db.VarChar(50)
  zipCode          String?  @db.VarChar(10)
  latitude         Float?
  longitude        Float?
  bio              String?  @db.Text
  profilePicture   String?  @db.VarChar(500)
  emergencyContact String?  @db.VarChar(255)
  maxDistance      Int      @default(50)
  weekdaysOnly     Boolean  @default(false)
  preferredCauses  String[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user            User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  volunteerSkills VolunteerSkill[]
  availability    Availability[]
  assignments     Assignment[]
  history         VolunteerHistory[]

  @@index([userId])
  @@index([city, state])
  @@map("profiles")
}

// ============================================
// SKILLS MANAGEMENT
// ============================================

model Skill {
  id          String  @id @default(uuid())
  name        String  @unique @db.VarChar(100)
  category    String? @db.VarChar(50)
  description String? @db.Text

  volunteerSkills   VolunteerSkill[]
  eventRequirements EventRequirement[]

  @@index([category])
  @@map("skills")
}

model VolunteerSkill {
  id               String           @id @default(uuid())
  profileId        String
  skillId          String
  proficiencyLevel ProficiencyLevel

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  skill   Skill   @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@unique([profileId, skillId])
  @@index([profileId])
  @@map("volunteer_skills")
}

enum ProficiencyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

// ============================================
// AVAILABILITY
// ============================================

model Availability {
  id          String  @id @default(uuid())
  profileId   String
  dayOfWeek   Int     // 0-6 (Sunday-Saturday)
  startTime   String  @db.VarChar(5) // HH:MM format
  endTime     String  @db.VarChar(5) // HH:MM format
  isRecurring Boolean @default(true)

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@index([profileId])
  @@index([dayOfWeek])
  @@map("availability")
}

// ============================================
// EVENTS
// ============================================

model Event {
  id                String      @id @default(uuid())
  title             String      @db.VarChar(255)
  description       String?     @db.Text
  location          String?     @db.VarChar(255)
  latitude          Float?
  longitude         Float?
  startDate         DateTime?
  endDate           DateTime?
  urgency           Urgency     @default(MEDIUM)
  status            EventStatus @default(DRAFT)
  maxVolunteers     Int
  currentVolunteers Int         @default(0)
  category          String?     @db.VarChar(50)
  createdBy         String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  requirements  EventRequirement[]
  assignments   Assignment[]
  history       VolunteerHistory[]
  notifications Notification[]

  @@index([status])
  @@index([category])
  @@index([startDate])
  @@index([urgency])
  @@map("events")
}

enum Urgency {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum EventStatus {
  DRAFT
  PUBLISHED
  COMPLETED
  CANCELLED
}

model EventRequirement {
  id                  String            @id @default(uuid())
  eventId             String
  skillId             String
  requiredCount       Int               @default(1)
  requiredProficiency ProficiencyLevel?

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  skill Skill @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@map("event_requirements")
}

// ============================================
// ASSIGNMENTS
// ============================================

model Assignment {
  id          String           @id @default(uuid())
  eventId     String
  profileId   String
  userId      String
  status      AssignmentStatus @default(PENDING)
  matchScore  Float?
  assignedAt  DateTime         @default(now())
  confirmedAt DateTime?

  event   Event   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  profile Profile @relation(fields: [profileId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@index([eventId])
  @@index([userId])
  @@index([status])
  @@map("assignments")
}

enum AssignmentStatus {
  PENDING
  CONFIRMED
  DECLINED
  COMPLETED
  CANCELLED
}

// ============================================
// VOLUNTEER HISTORY
// ============================================

model VolunteerHistory {
  id                String              @id @default(uuid())
  eventId           String
  profileId         String
  userId            String
  status            ParticipationStatus
  hoursWorked       Float?
  performanceRating Int?                // 1-5
  feedback          String?             @db.Text
  participationDate DateTime
  createdAt         DateTime            @default(now())

  event   Event   @relation(fields: [eventId], references: [id])
  profile Profile @relation(fields: [profileId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([eventId])
  @@index([participationDate])
  @@map("volunteer_history")
}

enum ParticipationStatus {
  CONFIRMED
  COMPLETED
  NO_SHOW
  CANCELLED
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id        String              @id @default(uuid())
  userId    String
  eventId   String?
  type      NotificationType
  title     String              @db.VarChar(255)
  message   String              @db.Text
  channel   NotificationChannel @default(IN_APP)
  status    NotificationStatus  @default(UNREAD)
  readAt    DateTime?
  createdAt DateTime            @default(now())

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  event Event? @relation(fields: [eventId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("notifications")
}

enum NotificationType {
  ASSIGNMENT
  REMINDER
  EVENT_UPDATE
  MATCHING_SUGGESTION
  SYSTEM
}

enum NotificationChannel {
  EMAIL
  SMS
  IN_APP
  PUSH
}

enum NotificationStatus {
  UNREAD
  READ
  ARCHIVED
}

// ============================================
// STATES (OPTIONAL)
// ============================================

model State {
  code String @id @db.VarChar(2)
  name String @db.VarChar(100)

  @@map("states")
}
```

### Generate Migration
```bash
npx prisma migrate dev --name init
```

This creates:
- PostgreSQL tables
- `node_modules/.prisma/client` with type-safe queries
- Migration files in `prisma/migrations/`

---

## Implementation Phases

### Phase 1: Database Setup & Schema (Days 1-2)

**Tasks:**
1. Install PostgreSQL on local machine
2. Create databases (dev and test)
3. Install Prisma packages
4. Create Prisma schema
5. Run initial migration
6. Verify tables created

**Deliverables:**
- PostgreSQL running
- Database tables created
- Prisma Client generated

---

### Phase 2: Prisma Client Configuration (Day 3)

**Task:** Create Prisma client singleton

**File:** `admin/backend/src/config/prisma.js`
```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
```

**Test Connection:**
```bash
node -e "const prisma = require('./src/config/prisma'); prisma.\$connect().then(() => console.log('✓ Connected!')).catch(e => console.error('✗ Error:', e))"
```

---

### Phase 3: Create Repository Layer (Days 4-5)

Create `admin/backend/src/database/` directory with 5 repositories:

#### 1. userRepository.js

```javascript
const prisma = require('../config/prisma');

const userRepository = {
  // Find user by email
  findByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true }
    });
  },

  // Find user by ID
  findById: async (id) => {
    return await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });
  },

  // Find user by username
  findByUsername: async (username) => {
    return await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });
  },

  // Get user profile with skills and availability
  getProfile: async (userId) => {
    return await prisma.profile.findUnique({
      where: { userId },
      include: {
        volunteerSkills: {
          include: { skill: true }
        },
        availability: true
      }
    });
  },

  // Create user with profile (transaction)
  createUser: async (userData, profileData) => {
    return await prisma.user.create({
      data: {
        username: userData.username.toLowerCase(),
        email: userData.email.toLowerCase(),
        password: userData.password,
        role: userData.role || 'VOLUNTEER',
        verified: userData.verified || false,
        profile: profileData ? {
          create: profileData
        } : undefined
      },
      include: { profile: true }
    });
  },

  // Update user
  updateUser: async (userId, updateData) => {
    return await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  },

  // Update or create profile
  updateProfile: async (userId, profileData) => {
    return await prisma.profile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
      include: {
        volunteerSkills: {
          include: { skill: true }
        },
        availability: true
      }
    });
  },

  // Delete user (cascade deletes profile)
  deleteUser: async (userId) => {
    return await prisma.user.delete({
      where: { id: userId }
    });
  },

  // Get all users (admin)
  getAllUsers: async () => {
    return await prisma.user.findMany({
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Get volunteers only
  getVolunteers: async () => {
    return await prisma.user.findMany({
      where: { role: 'VOLUNTEER' },
      include: {
        profile: {
          include: {
            volunteerSkills: {
              include: { skill: true }
            },
            availability: true
          }
        }
      }
    });
  },

  // Get volunteer profiles (for matching)
  getVolunteerProfiles: async () => {
    const profiles = await prisma.profile.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            verified: true
          }
        },
        volunteerSkills: {
          include: { skill: true }
        },
        availability: true
      }
    });

    // Filter only volunteers
    return profiles.filter(p => p.user.role === 'VOLUNTEER');
  }
};

module.exports = userRepository;
```

#### 2. eventRepository.js

```javascript
const prisma = require('../config/prisma');

const eventRepository = {
  // Create event with requirements
  create: async (eventData, requirements = []) => {
    return await prisma.event.create({
      data: {
        ...eventData,
        requirements: {
          create: requirements
        }
      },
      include: {
        requirements: {
          include: { skill: true }
        }
      }
    });
  },

  // Find event by ID
  findById: async (eventId) => {
    return await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        requirements: {
          include: { skill: true }
        },
        assignments: {
          include: {
            profile: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });
  },

  // Get all events with filters
  findMany: async (filters = {}) => {
    const where = {};

    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.urgency) where.urgency = filters.urgency;
    if (filters.createdBy) where.createdBy = filters.createdBy;

    return await prisma.event.findMany({
      where,
      include: {
        requirements: {
          include: { skill: true }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Get published events
  getPublishedEvents: async () => {
    return await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        requirements: {
          include: { skill: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });
  },

  // Update event
  update: async (eventId, updateData) => {
    return await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        requirements: {
          include: { skill: true }
        }
      }
    });
  },

  // Delete event
  delete: async (eventId) => {
    return await prisma.event.delete({
      where: { id: eventId }
    });
  },

  // Get event assignments
  getEventAssignments: async (eventId) => {
    return await prisma.assignment.findMany({
      where: { eventId },
      include: {
        profile: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
  },

  // Assign volunteer to event
  assignVolunteer: async (eventId, volunteerId, assignmentData) => {
    // Get profile for the user
    const profile = await prisma.profile.findUnique({
      where: { userId: volunteerId }
    });

    return await prisma.assignment.create({
      data: {
        eventId,
        userId: volunteerId,
        profileId: profile.id,
        status: assignmentData.status || 'PENDING',
        matchScore: assignmentData.matchScore
      },
      include: {
        event: true,
        user: true,
        profile: true
      }
    });
  },

  // Update assignment status
  updateAssignmentStatus: async (assignmentId, status) => {
    return await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status,
        confirmedAt: status === 'CONFIRMED' ? new Date() : undefined
      }
    });
  }
};

module.exports = eventRepository;
```

#### 3. historyRepository.js

```javascript
const prisma = require('../config/prisma');

const historyRepository = {
  // Create history record
  create: async (historyData) => {
    // Get profile for the user
    const profile = await prisma.profile.findUnique({
      where: { userId: historyData.volunteerId }
    });

    return await prisma.volunteerHistory.create({
      data: {
        eventId: historyData.eventId,
        userId: historyData.volunteerId,
        profileId: profile.id,
        status: historyData.status,
        hoursWorked: historyData.hoursWorked,
        performanceRating: historyData.performanceRating,
        feedback: historyData.feedback,
        participationDate: historyData.participationDate || new Date()
      },
      include: {
        event: true,
        user: true
      }
    });
  },

  // Get volunteer history
  findByVolunteerId: async (volunteerId, filters = {}) => {
    const where = { userId: volunteerId };

    if (filters.status) where.status = filters.status;
    if (filters.startDate) {
      where.participationDate = {
        gte: new Date(filters.startDate)
      };
    }
    if (filters.endDate) {
      where.participationDate = {
        ...where.participationDate,
        lte: new Date(filters.endDate)
      };
    }

    return await prisma.volunteerHistory.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            location: true,
            startDate: true
          }
        }
      },
      orderBy: { participationDate: 'desc' }
    });
  },

  // Get event history
  findByEventId: async (eventId) => {
    return await prisma.volunteerHistory.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        profile: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { participationDate: 'desc' }
    });
  },

  // Update history record
  update: async (historyId, updateData) => {
    return await prisma.volunteerHistory.update({
      where: { id: historyId },
      data: updateData
    });
  },

  // Get volunteer statistics
  getVolunteerStats: async (volunteerId) => {
    const history = await prisma.volunteerHistory.findMany({
      where: { userId: volunteerId },
      include: { event: true }
    });

    // Calculate stats
    const totalEvents = history.length;
    const completedEvents = history.filter(h => h.status === 'COMPLETED').length;
    const totalHours = history
      .filter(h => h.status === 'COMPLETED')
      .reduce((sum, h) => sum + (h.hoursWorked || 0), 0);

    const ratings = history
      .filter(h => h.performanceRating)
      .map(h => h.performanceRating);

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null;

    return {
      totalEvents,
      completedEvents,
      totalHours,
      averageRating,
      history
    };
  },

  // Get all volunteer stats (admin)
  getAllVolunteerStats: async () => {
    const volunteers = await prisma.user.findMany({
      where: { role: 'VOLUNTEER' },
      include: {
        profile: true,
        history: {
          include: { event: true }
        }
      }
    });

    return volunteers.map(volunteer => {
      const completedEvents = volunteer.history.filter(h => h.status === 'COMPLETED');
      const totalHours = completedEvents.reduce((sum, h) => sum + (h.hoursWorked || 0), 0);

      return {
        volunteerId: volunteer.id,
        username: volunteer.username,
        email: volunteer.email,
        firstName: volunteer.profile?.firstName,
        lastName: volunteer.profile?.lastName,
        totalEvents: volunteer.history.length,
        completedEvents: completedEvents.length,
        totalHours,
        averageRating: completedEvents.length > 0
          ? completedEvents.reduce((sum, h) => sum + (h.performanceRating || 0), 0) / completedEvents.length
          : null
      };
    });
  }
};

module.exports = historyRepository;
```

#### 4. notificationRepository.js

```javascript
const prisma = require('../config/prisma');

const notificationRepository = {
  // Create notification
  create: async (notificationData) => {
    return await prisma.notification.create({
      data: notificationData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
  },

  // Get user notifications
  findByUserId: async (userId, filters = {}) => {
    const where = { userId };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    return await prisma.notification.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Get unread count
  getUnreadCount: async (userId) => {
    return await prisma.notification.count({
      where: {
        userId,
        status: 'UNREAD'
      }
    });
  },

  // Mark as read
  markAsRead: async (notificationId, userId) => {
    return await prisma.notification.update({
      where: {
        id: notificationId,
        userId // Ensure user owns notification
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });
  },

  // Mark all as read
  markAllAsRead: async (userId) => {
    return await prisma.notification.updateMany({
      where: {
        userId,
        status: 'UNREAD'
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });
  },

  // Delete notification
  delete: async (notificationId, userId) => {
    return await prisma.notification.delete({
      where: {
        id: notificationId,
        userId // Ensure user owns notification
      }
    });
  },

  // Delete multiple
  deleteMany: async (notificationIds, userId) => {
    return await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId
      }
    });
  },

  // Create bulk notifications
  createBulk: async (userIds, notificationData) => {
    const notifications = userIds.map(userId => ({
      userId,
      ...notificationData
    }));

    return await prisma.notification.createMany({
      data: notifications
    });
  }
};

module.exports = notificationRepository;
```

#### 5. skillRepository.js

```javascript
const prisma = require('../config/prisma');

const skillRepository = {
  // Get all skills
  findAll: async () => {
    return await prisma.skill.findMany({
      orderBy: { name: 'asc' }
    });
  },

  // Find skill by ID
  findById: async (skillId) => {
    return await prisma.skill.findUnique({
      where: { id: skillId }
    });
  },

  // Find skill by name
  findByName: async (name) => {
    return await prisma.skill.findUnique({
      where: { name }
    });
  },

  // Search skills
  search: async (query) => {
    return await prisma.skill.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    });
  },

  // Get skills by category
  findByCategory: async (category) => {
    return await prisma.skill.findMany({
      where: { category },
      orderBy: { name: 'asc' }
    });
  },

  // Create skill
  create: async (skillData) => {
    return await prisma.skill.create({
      data: skillData
    });
  },

  // Update skill
  update: async (skillId, updateData) => {
    return await prisma.skill.update({
      where: { id: skillId },
      data: updateData
    });
  },

  // Delete skill
  delete: async (skillId) => {
    return await prisma.skill.delete({
      where: { id: skillId }
    });
  },

  // Add skill to volunteer profile
  addToVolunteer: async (profileId, skillId, proficiencyLevel) => {
    return await prisma.volunteerSkill.create({
      data: {
        profileId,
        skillId,
        proficiencyLevel
      },
      include: {
        skill: true
      }
    });
  },

  // Remove skill from volunteer profile
  removeFromVolunteer: async (profileId, skillId) => {
    return await prisma.volunteerSkill.delete({
      where: {
        profileId_skillId: {
          profileId,
          skillId
        }
      }
    });
  },

  // Update volunteer skill proficiency
  updateVolunteerSkill: async (profileId, skillId, proficiencyLevel) => {
    return await prisma.volunteerSkill.update({
      where: {
        profileId_skillId: {
          profileId,
          skillId
        }
      },
      data: { proficiencyLevel },
      include: { skill: true }
    });
  },

  // Get volunteer skills
  getVolunteerSkills: async (profileId) => {
    return await prisma.volunteerSkill.findMany({
      where: { profileId },
      include: { skill: true }
    });
  }
};

module.exports = skillRepository;
```

---

### Phase 4: Data Migration & Seeding (Day 6)

**Create Seed Script:** `prisma/seed.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // 1. Seed Skills
  // ============================================
  console.log('📚 Seeding skills...');

  const skillsData = [
    { name: 'First Aid & CPR', category: 'Healthcare', description: 'Basic first aid and CPR certification' },
    { name: 'Teaching & Tutoring', category: 'Education', description: 'Teaching and educational support' },
    { name: 'Cooking & Food Prep', category: 'Food Service', description: 'Food preparation and cooking' },
    { name: 'Medical Care', category: 'Healthcare', description: 'Professional medical care' },
    { name: 'Event Planning', category: 'Organization', description: 'Event coordination and planning' },
    { name: 'Construction', category: 'Manual Labor', description: 'Building and construction work' },
    { name: 'Public Speaking', category: 'Communication', description: 'Public speaking and presentations' },
    { name: 'Heavy Lifting', category: 'Manual Labor', description: 'Physical labor and heavy lifting' },
    { name: 'Technology Support', category: 'IT', description: 'Computer and technology assistance' },
    { name: 'Counseling', category: 'Mental Health', description: 'Counseling and emotional support' }
  ];

  for (const skillData of skillsData) {
    await prisma.skill.upsert({
      where: { name: skillData.name },
      update: {},
      create: skillData
    });
  }

  console.log(`✓ Created ${skillsData.length} skills\n`);

  // ============================================
  // 2. Seed Admin User
  // ============================================
  console.log('👤 Seeding admin user...');

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jacsshiftpilot.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@jacsshiftpilot.com',
      password: adminPassword,
      role: 'ADMIN',
      verified: true,
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+1-555-0100',
          address: '123 Admin Street',
          city: 'Houston',
          state: 'Texas',
          zipCode: '77001',
          latitude: 29.7604,
          longitude: -95.3698,
          bio: 'System administrator for JACS ShiftPilot volunteer management platform.',
          maxDistance: 0,
          weekdaysOnly: true,
          preferredCauses: ['administrative']
        }
      }
    }
  });

  console.log(`✓ Created admin user: ${admin.username}\n`);

  // ============================================
  // 3. Seed Volunteer Users
  // ============================================
  console.log('👥 Seeding volunteer users...');

  const volunteerPassword = await bcrypt.hash('Volunteer123!', 10);

  const volunteersData = [
    {
      username: 'johnsmith',
      email: 'john.smith@email.com',
      profile: {
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1-555-0101',
        address: '456 Volunteer Lane',
        city: 'Houston',
        state: 'Texas',
        zipCode: '77002',
        latitude: 29.7505,
        longitude: -95.3704,
        bio: 'Passionate about community service and helping others. Available most weekends.',
        maxDistance: 25,
        weekdaysOnly: false,
        preferredCauses: ['community', 'environmental', 'food']
      },
      skills: [
        { skillName: 'First Aid & CPR', proficiency: 'ADVANCED' },
        { skillName: 'Cooking & Food Prep', proficiency: 'INTERMEDIATE' },
        { skillName: 'Public Speaking', proficiency: 'EXPERT' }
      ],
      availability: [
        { dayOfWeek: 6, startTime: '08:00', endTime: '17:00', isRecurring: true },
        { dayOfWeek: 0, startTime: '09:00', endTime: '15:00', isRecurring: true }
      ]
    },
    {
      username: 'sarahjones',
      email: 'sarah.jones@email.com',
      profile: {
        firstName: 'Sarah',
        lastName: 'Jones',
        phone: '+1-555-0201',
        address: '789 Helper Avenue',
        city: 'Houston',
        state: 'Texas',
        zipCode: '77003',
        latitude: 29.7403,
        longitude: -95.3370,
        bio: 'Healthcare professional with experience in emergency response and patient care.',
        maxDistance: 30,
        weekdaysOnly: true,
        preferredCauses: ['healthcare', 'disaster', 'community']
      },
      skills: [
        { skillName: 'Medical Care', proficiency: 'EXPERT' },
        { skillName: 'Event Planning', proficiency: 'ADVANCED' },
        { skillName: 'Teaching & Tutoring', proficiency: 'INTERMEDIATE' }
      ],
      availability: [
        { dayOfWeek: 1, startTime: '18:00', endTime: '22:00', isRecurring: true },
        { dayOfWeek: 3, startTime: '18:00', endTime: '22:00', isRecurring: true },
        { dayOfWeek: 5, startTime: '18:00', endTime: '22:00', isRecurring: true }
      ]
    },
    {
      username: 'mikebrown',
      email: 'mike.brown@email.com',
      profile: {
        firstName: 'Mike',
        lastName: 'Brown',
        phone: '+1-555-0301',
        address: '321 Service Road',
        city: 'Houston',
        state: 'Texas',
        zipCode: '77004',
        latitude: 29.7205,
        longitude: -95.3890,
        bio: 'Experienced in construction and manual labor. Happy to help with physical tasks.',
        maxDistance: 50,
        weekdaysOnly: false,
        preferredCauses: ['environmental', 'disaster', 'community']
      },
      skills: [
        { skillName: 'Construction', proficiency: 'EXPERT' },
        { skillName: 'Heavy Lifting', proficiency: 'ADVANCED' },
        { skillName: 'First Aid & CPR', proficiency: 'INTERMEDIATE' }
      ],
      availability: [
        { dayOfWeek: 6, startTime: '07:00', endTime: '19:00', isRecurring: true },
        { dayOfWeek: 0, startTime: '08:00', endTime: '16:00', isRecurring: true }
      ]
    }
  ];

  for (const volunteerData of volunteersData) {
    const { skills, availability, profile: profileData, ...userData } = volunteerData;

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: volunteerPassword,
        role: 'VOLUNTEER',
        verified: true,
        profile: {
          create: profileData
        }
      },
      include: { profile: true }
    });

    // Add skills
    for (const skillData of skills) {
      const skill = await prisma.skill.findUnique({
        where: { name: skillData.skillName }
      });

      if (skill) {
        await prisma.volunteerSkill.upsert({
          where: {
            profileId_skillId: {
              profileId: user.profile.id,
              skillId: skill.id
            }
          },
          update: {},
          create: {
            profileId: user.profile.id,
            skillId: skill.id,
            proficiencyLevel: skillData.proficiency
          }
        });
      }
    }

    // Add availability
    for (const avail of availability) {
      await prisma.availability.create({
        data: {
          profileId: user.profile.id,
          ...avail
        }
      });
    }

    console.log(`✓ Created volunteer: ${user.username}`);
  }

  console.log(`\n✓ Created ${volunteersData.length} volunteers\n`);

  // ============================================
  // 4. Seed Sample Events
  // ============================================
  console.log('📅 Seeding sample events...');

  const eventsData = [
    {
      title: 'Community Food Drive',
      description: 'Help organize and distribute food to families in need',
      location: 'Houston Food Bank, 535 Portwall St, Houston, TX 77029',
      latitude: 29.7342,
      longitude: -95.3009,
      startDate: new Date('2024-11-15T09:00:00'),
      endDate: new Date('2024-11-15T15:00:00'),
      urgency: 'HIGH',
      status: 'PUBLISHED',
      maxVolunteers: 10,
      currentVolunteers: 0,
      category: 'food',
      createdBy: admin.id
    },
    {
      title: 'Park Cleanup Day',
      description: 'Environmental cleanup of Memorial Park',
      location: 'Memorial Park, 6501 Memorial Dr, Houston, TX 77007',
      latitude: 29.7657,
      longitude: -95.4441,
      startDate: new Date('2024-11-20T08:00:00'),
      endDate: new Date('2024-11-20T12:00:00'),
      urgency: 'MEDIUM',
      status: 'PUBLISHED',
      maxVolunteers: 15,
      currentVolunteers: 0,
      category: 'environmental',
      createdBy: admin.id
    },
    {
      title: 'Youth Tutoring Program',
      description: 'After-school tutoring for elementary students',
      location: 'Community Center, 1400 W Gray St, Houston, TX 77019',
      latitude: 29.7492,
      longitude: -95.4021,
      startDate: new Date('2024-11-18T15:30:00'),
      endDate: new Date('2024-11-18T18:00:00'),
      urgency: 'LOW',
      status: 'PUBLISHED',
      maxVolunteers: 8,
      currentVolunteers: 0,
      category: 'education',
      createdBy: admin.id
    }
  ];

  for (const eventData of eventsData) {
    await prisma.event.create({
      data: eventData
    });
  }

  console.log(`✓ Created ${eventsData.length} events\n`);

  // ============================================
  // 5. Seed US States
  // ============================================
  console.log('🗺️  Seeding US states...');

  const statesData = [
    { code: 'TX', name: 'Texas' },
    { code: 'CA', name: 'California' },
    { code: 'NY', name: 'New York' },
    { code: 'FL', name: 'Florida' },
    // Add more states as needed
  ];

  for (const stateData of statesData) {
    await prisma.state.upsert({
      where: { code: stateData.code },
      update: {},
      create: stateData
    });
  }

  console.log(`✓ Created ${statesData.length} states\n`);

  console.log('✅ Database seeding completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Update package.json:**
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

**Run Seed:**
```bash
npx prisma db seed
```

**Verify Data:**
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

---

### Phase 5: Update Services (Days 7-9)

Update each service to use repositories. Example transformation:

**BEFORE:** `src/services/authService.js`
```javascript
const { userHelpers } = require('../data/users');

const authService = {
  async login(credentials) {
    const user = userHelpers.findByEmail(credentials.email); // sync
    if (!user) {
      throw new Error('User not found');
    }
    // ... rest of logic
  }
};
```

**AFTER:** `src/services/authService.js`
```javascript
const userRepository = require('../database/userRepository');

const authService = {
  async login(credentials) {
    const user = await userRepository.findByEmail(credentials.email); // async
    if (!user) {
      throw new Error('User not found');
    }
    // ... rest of logic STAYS THE SAME
  }
};
```

**Services to Update:**
1. `src/services/authService.js` - Use userRepository
2. `src/services/eventService.js` - Use eventRepository
3. `src/services/historyService.js` - Use historyRepository
4. `src/services/notificationService.js` - Use notificationRepository
5. `src/services/matchingService.js` - Use userRepository & eventRepository
6. `src/services/profileService.js` - Use userRepository & skillRepository

**Key Changes:**
- Replace `require('../data/*)` with `require('../database/*Repository')`
- Add `await` to all repository calls
- Handle Prisma errors appropriately
- Keep all business logic unchanged

---

### Phase 6: Update Tests (Days 10-11)

#### Step 1: Create Test Setup

**File:** `admin/backend/jest.setup.js`
```javascript
const { execSync } = require('child_process');
const path = require('path');

// Use test database
process.env.DATABASE_URL = process.env.DATABASE_TEST_URL ||
  'postgresql://jacs_admin:password@localhost:5432/jacs_shiftpilot_test?schema=public';

// Set test environment
process.env.NODE_ENV = 'test';

let prisma;

beforeAll(async () => {
  console.log('Setting up test database...');

  // Reset test database before all tests
  try {
    execSync('npx prisma migrate reset --force --skip-seed', {
      cwd: path.join(__dirname, 'admin', 'backend'),
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Failed to reset test database:', error);
    throw error;
  }

  // Initialize Prisma client
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();

  console.log('Test database ready!');
});

afterAll(async () => {
  // Disconnect Prisma
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Clean up between test files
afterEach(async () => {
  // Optional: Clear specific tables if needed
  // await prisma.assignment.deleteMany();
  // await prisma.notification.deleteMany();
});
```

#### Step 2: Update jest.config.js

```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000, // Increase timeout for database operations
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/prisma/',
    '/src/data/' // Exclude old data files
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/data/**', // Exclude old data layer
    '!src/config/prisma.js' // Exclude Prisma config
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Step 3: Update Test Files

**Pattern for updating tests:**

**BEFORE:**
```javascript
describe('AuthService', () => {
  it('should login user', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(result).toBeDefined();
  });
});
```

**AFTER:**
```javascript
const prisma = require('../src/config/prisma');

describe('AuthService', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany();
  });

  it('should login user', async () => {
    // Create test user first
    await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'VOLUNTEER',
        verified: true
      }
    });

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(result).toBeDefined();
  });
});
```

**Update Order (17 test files):**
1. Controller tests (7 files)
2. Service tests (6 files)
3. Utils tests (2 files)
4. Middleware tests (2 files)

**Run tests incrementally:**
```bash
# Test one file at a time
npm test -- tests/services/authService.test.js
npm test -- tests/controllers/authController.test.js

# Run all tests
npm test

# Check coverage
npm run test:coverage
```

---

### Phase 7: Error Handling & Validation (Day 12)

#### Create Prisma Error Handler

**File:** `admin/backend/src/utils/prismaErrorHandler.js`
```javascript
/**
 * Handle Prisma-specific errors
 * https://www.prisma.io/docs/reference/api-reference/error-reference
 */

const handlePrismaError = (error) => {
  // Unique constraint violation
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    return {
      status: 409,
      message: `${field} already exists`
    };
  }

  // Record not found
  if (error.code === 'P2025') {
    return {
      status: 404,
      message: 'Record not found'
    };
  }

  // Foreign key constraint failed
  if (error.code === 'P2003') {
    return {
      status: 400,
      message: 'Related record not found'
    };
  }

  // Required field missing
  if (error.code === 'P2011') {
    return {
      status: 400,
      message: 'Required field is missing'
    };
  }

  // Invalid data type
  if (error.code === 'P2006') {
    return {
      status: 400,
      message: 'Invalid data type provided'
    };
  }

  // Database timeout
  if (error.code === 'P1008') {
    return {
      status: 504,
      message: 'Database operation timed out'
    };
  }

  // Default error
  return {
    status: 500,
    message: 'Database error occurred'
  };
};

module.exports = handlePrismaError;
```

#### Update Error Handler Middleware

**File:** `admin/backend/src/middleware/errorHandler.js`
```javascript
const handlePrismaError = require('../utils/prismaErrorHandler');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    const { status, message } = handlePrismaError(err);
    return res.status(status).json({
      status: 'error',
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Handle validation errors (existing)
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
```

---

## File Structure Changes

### New Files Created
```
admin/backend/
├── prisma/
│   ├── schema.prisma          (NEW - 500+ lines)
│   ├── seed.js                (NEW - 300+ lines)
│   └── migrations/            (AUTO-GENERATED)
│       └── 20241014_init/
│           └── migration.sql
├── src/
│   ├── config/
│   │   └── prisma.js          (NEW - 20 lines)
│   ├── database/              (NEW FOLDER)
│   │   ├── userRepository.js  (NEW - 200 lines)
│   │   ├── eventRepository.js (NEW - 180 lines)
│   │   ├── historyRepository.js (NEW - 150 lines)
│   │   ├── notificationRepository.js (NEW - 120 lines)
│   │   └── skillRepository.js (NEW - 100 lines)
│   └── utils/
│       └── prismaErrorHandler.js (NEW - 50 lines)
├── jest.setup.js              (NEW - 40 lines)
└── docs/
    └── database-schema.sql    (NEW - generated)
```

### Files Updated
```
admin/backend/
├── src/
│   ├── services/              (UPDATE 6 files)
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   ├── historyService.js
│   │   ├── notificationService.js
│   │   ├── matchingService.js
│   │   └── profileService.js
│   └── middleware/
│       └── errorHandler.js    (UPDATE)
├── tests/                     (UPDATE 17 files)
│   ├── controllers/
│   ├── services/
│   └── utils/
├── .env                       (UPDATE - add DATABASE_URL)
├── .gitignore                 (UPDATE - add .env)
├── jest.config.js             (UPDATE)
└── package.json               (UPDATE - add dependencies)
```

### Files to Delete (After Testing)
```
admin/backend/src/data/        (DELETE after migration complete)
├── users.js
├── events.js
├── history.js
├── notifications.js
└── skills.js
```

---

## Testing Strategy

### Test Database Setup
1. Separate test database: `jacs_shiftpilot_test`
2. Reset database before test suite
3. Clean data between test files
4. Use transactions for test isolation

### Test Coverage Goals
- **Maintain 80%+ coverage** (currently at 84.99%)
- All existing 627 tests should pass
- Add new database-specific tests
- Test error scenarios (constraints, validations)

### Test Execution
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/services/authService.test.js

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Coverage with HTML report
npm run test:coverage -- --coverage --coverageDirectory=coverage
```

---

## Submission Requirements

### Assignment 4 Deliverables

#### 1. GitHub Repository Link (5 points)
- Provide GitHub URL with all code
- Ensure Database branch is pushed
- Include test files with 80%+ coverage

#### 2. SQL Statements / Schema (3 points)

**Generate SQL:**
```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > docs/database-schema.sql
```

**Include:**
- `prisma/schema.prisma` (Prisma schema)
- `docs/database-schema.sql` (Generated SQL)
- ERD diagram (already have `docs/ERD.pdf`)

#### 3. Code Coverage Report (2 points)

```bash
npm run test:coverage
```

**Include:**
- Screenshot of coverage summary
- Full coverage report HTML
- Must show 80%+ coverage

#### 4. Team Contributions (3 points)

**Create table in submission document:**

| Group Member Name | Contribution | Discussion Notes |
|-------------------|--------------|------------------|
| Member 1 | Database schema design, Prisma setup | Led Prisma configuration and migration |
| Member 2 | Repository layer implementation | Created all 5 repository files |
| Member 3 | Service layer updates | Updated all services to use repositories |
| Member 4 | Test suite updates | Updated all 627 tests for database |

---

## Timeline & Milestones

### 12-Day Implementation Plan

#### Days 1-2: Foundation
- ✅ Install PostgreSQL
- ✅ Create databases
- ✅ Install Prisma
- ✅ Create schema
- ✅ Run migration
- ✅ Verify tables

**Milestone:** Database running with tables created

---

#### Days 3-4: Configuration & Repositories
- ✅ Create Prisma client config
- ✅ Create 5 repository files
- ✅ Test repository functions
- ✅ Create seed script

**Milestone:** Repository layer complete

---

#### Days 5-6: Data Migration
- ✅ Run seed script
- ✅ Verify data in Prisma Studio
- ✅ Update environment variables
- ✅ Test database connections

**Milestone:** Data migrated to PostgreSQL

---

#### Days 7-9: Service Updates
- ✅ Update authService
- ✅ Update eventService
- ✅ Update historyService
- ✅ Update notificationService
- ✅ Update matchingService
- ✅ Update profileService

**Milestone:** All services using database

---

#### Days 10-11: Test Updates
- ✅ Create test setup
- ✅ Update jest config
- ✅ Update all 17 test files
- ✅ Fix failing tests
- ✅ Verify 80%+ coverage

**Milestone:** All tests passing with database

---

#### Day 12: Final Testing & Documentation
- ✅ Full integration test
- ✅ Generate SQL documentation
- ✅ Create submission document
- ✅ Screenshot coverage report
- ✅ Clean up old data files
- ✅ Submit to Canvas

**Milestone:** Assignment 4 complete and submitted

---

## Quick Reference Commands

### PostgreSQL Commands
```bash
# Start PostgreSQL
sudo service postgresql start

# Access PostgreSQL
psql -U jacs_admin -d jacs_shiftpilot -h localhost

# List databases
\l

# Connect to database
\c jacs_shiftpilot

# List tables
\dt

# Describe table
\d users

# Exit
\q
```

### Prisma Commands
```bash
# Initialize Prisma
npx prisma init

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (dev only - deletes all data!)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio

# Format schema
npx prisma format

# Validate schema
npx prisma validate

# Pull database schema (reverse engineer)
npx prisma db pull

# Push schema without migration
npx prisma db push
```

### Testing Commands
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/services/authService.test.js

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run tests matching pattern
npm test -- --testNamePattern="should login"
```

### Git Commands
```bash
# Check current branch
git branch

# View status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Implement database with Prisma"

# Push to remote
git push origin Database

# View commit history
git log --oneline
```

---

## Troubleshooting

### PostgreSQL Issues

**Problem:** Can't connect to PostgreSQL
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Check port
sudo netstat -plnt | grep postgres
```

**Problem:** Permission denied
```bash
# Reset password
sudo -u postgres psql
ALTER USER jacs_admin WITH PASSWORD 'new_password';
```

### Prisma Issues

**Problem:** Migration failed
```bash
# Reset and try again
npx prisma migrate reset --force
npx prisma migrate dev --name init
```

**Problem:** Client not generated
```bash
# Regenerate client
npx prisma generate
```

**Problem:** Schema validation error
```bash
# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

### Test Issues

**Problem:** Tests timing out
- Increase timeout in jest.config.js
- Check database connection
- Verify test database exists

**Problem:** Tests failing after migration
- Reset test database
- Clear node_modules/.cache
- Regenerate Prisma Client

---

## Success Criteria

### Before Submission Checklist

- [ ] PostgreSQL installed and running
- [ ] Both databases created (dev and test)
- [ ] Prisma schema complete
- [ ] All migrations run successfully
- [ ] Seed script populates data
- [ ] All 5 repositories created
- [ ] All 6 services updated
- [ ] All 627 tests passing
- [ ] Coverage at 80%+
- [ ] No console errors
- [ ] Prisma Studio shows data
- [ ] SQL documentation generated
- [ ] Submission document complete
- [ ] GitHub branch pushed

### Final Verification

```bash
# 1. Check database
npx prisma studio

# 2. Run all tests
npm test

# 3. Check coverage
npm run test:coverage

# 4. Verify tables
psql -U jacs_admin -d jacs_shiftpilot -h localhost -c "\dt"

# 5. Test API endpoints
# Start server and test endpoints manually
npm start
```

---

## Next Steps After Assignment 4

Once database implementation is complete:

1. **Optimize Performance**
   - Add database indexes
   - Implement caching with Redis
   - Query optimization

2. **Add Advanced Features**
   - Full-text search
   - Database backups
   - Query logging
   - Connection pooling

3. **Production Deployment**
   - Deploy to cloud database (AWS RDS, etc.)
   - Environment configuration
   - Monitoring and alerts

4. **Continue Development**
   - Assignment 5 requirements
   - Additional features
   - Performance improvements

---

**End of Database Implementation Plan**

This plan provides a complete roadmap for implementing PostgreSQL with Prisma ORM for Assignment 4. Follow each phase carefully and test incrementally to ensure success.

Good luck with your implementation! 🚀
