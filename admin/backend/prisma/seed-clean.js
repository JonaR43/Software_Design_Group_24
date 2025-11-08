/**
 * Clean Database Seed Script
 * Populates database with test data using upsert to avoid duplicate errors
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper to create consistent password hashes
const hashPassword = (password) => bcrypt.hashSync(password, 10);

async function main() {
  console.log('🌱 Starting clean database seed...');

  // ========================================
  // 1. STATES
  // ========================================
  console.log('📍 Seeding states...');
  const states = [
    { code: 'TX', name: 'Texas', abbreviation: 'TX' },
    { code: 'CA', name: 'California', abbreviation: 'CA' },
    { code: 'NY', name: 'New York', abbreviation: 'NY' },
    { code: 'FL', name: 'Florida', abbreviation: 'FL' },
    { code: 'IL', name: 'Illinois', abbreviation: 'IL' }
  ];

  for (const state of states) {
    await prisma.state.upsert({
      where: { code: state.code },
      update: {},
      create: state
    });
  }
  console.log(`✅ Seeded ${states.length} states`);

  // ========================================
  // 2. SKILLS
  // ========================================
  console.log('🎯 Seeding skills...');
  const skills = [
    { name: 'Event Planning', category: 'administrative', description: 'Planning and organizing events' },
    { name: 'Data Entry', category: 'administrative', description: 'Data management and entry' },
    { name: 'Customer Service', category: 'social', description: 'Helping and interacting with people' },
    { name: 'First Aid/CPR', category: 'healthcare', description: 'Emergency medical response' },
    { name: 'Tutoring', category: 'education', description: 'Teaching and mentoring' },
    { name: 'Public Speaking', category: 'communication', description: 'Presentations and speaking' },
    { name: 'Gardening', category: 'environmental', description: 'Plant care and landscaping' },
    { name: 'Construction', category: 'manual labor', description: 'Building and repair work' },
    { name: 'Cooking', category: 'food service', description: 'Food preparation and service' },
    { name: 'Fundraising', category: 'administrative', description: 'Raising funds for causes' },
    { name: 'Social Media', category: 'technology', description: 'Digital marketing and engagement' },
    { name: 'Photography', category: 'creative', description: 'Photo and video documentation' },
    { name: 'Translation', category: 'communication', description: 'Language translation services' },
    { name: 'Animal Care', category: 'environmental', description: 'Pet and animal assistance' },
    { name: 'Graphic Design', category: 'creative', description: 'Visual design and branding' }
  ];

  const createdSkills = {};
  for (const skill of skills) {
    const created = await prisma.skill.upsert({
      where: { name: skill.name },
      update: skill,
      create: skill
    });
    createdSkills[skill.name] = created;
  }
  console.log(`✅ Seeded ${skills.length} skills`);

  // ========================================
  // 3. USERS & PROFILES
  // ========================================
  console.log('👥 Seeding users and profiles...');

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jacsshiftpilot.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@jacsshiftpilot.com',
      password: hashPassword('Admin123!'),
      role: 'ADMIN',
      verified: true
    }
  });

  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '713-555-0001',
      address: '123 Admin Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77002',
      latitude: 29.7604,
      longitude: -95.3698,
      bio: 'System administrator for JACS ShiftPilot',
      maxTravelDistance: 50,
      preferredCauses: ['community', 'administrative'],
      profileCompleteness: 100
    }
  });

  // Volunteer 1: John Smith - Local Houston, Healthcare focus
  const john = await prisma.user.upsert({
    where: { email: 'john.smith@email.com' },
    update: {},
    create: {
      username: 'johnsmith',
      email: 'john.smith@email.com',
      password: hashPassword('Volunteer123!'),
      role: 'VOLUNTEER',
      verified: true
    }
  });

  const johnProfile = await prisma.profile.upsert({
    where: { userId: john.id },
    update: {},
    create: {
      userId: john.id,
      firstName: 'John',
      lastName: 'Smith',
      phone: '713-555-0102',
      address: '456 Oak Avenue',
      city: 'Houston',
      state: 'TX',
      zipCode: '77003',
      latitude: 29.7520,
      longitude: -95.3720,
      bio: 'Healthcare professional passionate about community service',
      maxTravelDistance: 25,
      preferredCauses: ['healthcare', 'community'],
      preferredDays: ['Monday', 'Tuesday', 'Wednesday'],
      preferredTimeSlots: ['morning', 'afternoon'],
      profileCompleteness: 90
    }
  });

  // Add skills for John
  await prisma.volunteerSkill.upsert({
    where: {
      profileId_skillId: {
        profileId: johnProfile.id,
        skillId: createdSkills['First Aid/CPR'].id
      }
    },
    update: {},
    create: {
      profileId: johnProfile.id,
      skillId: createdSkills['First Aid/CPR'].id,
      proficiency: 'ADVANCED',
      yearsOfExp: 5,
      certified: true
    }
  });

  await prisma.volunteerSkill.upsert({
    where: {
      profileId_skillId: {
        profileId: johnProfile.id,
        skillId: createdSkills['Customer Service'].id
      }
    },
    update: {},
    create: {
      profileId: johnProfile.id,
      skillId: createdSkills['Customer Service'].id,
      proficiency: 'INTERMEDIATE',
      yearsOfExp: 3
    }
  });

  // Add availability for John
  await prisma.availability.create({
    data: {
      profileId: johnProfile.id,
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true
    }
  }).catch(() => {}); // Skip if exists

  await prisma.availability.create({
    data: {
      profileId: johnProfile.id,
      dayOfWeek: 'Wednesday',
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true
    }
  }).catch(() => {});

  // Volunteer 2: Sarah Jones - Event Planning expert
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.jones@email.com' },
    update: {},
    create: {
      username: 'sarahjones',
      email: 'sarah.jones@email.com',
      password: hashPassword('Volunteer123!'),
      role: 'VOLUNTEER',
      verified: true
    }
  });

  const sarahProfile = await prisma.profile.upsert({
    where: { userId: sarah.id },
    update: {},
    create: {
      userId: sarah.id,
      firstName: 'Sarah',
      lastName: 'Jones',
      phone: '713-555-0103',
      address: '789 Pine Road',
      city: 'Houston',
      state: 'TX',
      zipCode: '77005',
      latitude: 29.7180,
      longitude: -95.4020,
      bio: 'Professional event planner looking to give back',
      maxTravelDistance: 30,
      preferredCauses: ['community', 'educational'],
      preferredDays: ['Saturday', 'Sunday'],
      preferredTimeSlots: ['morning', 'afternoon'],
      weekendsOnly: true,
      profileCompleteness: 95
    }
  });

  await prisma.volunteerSkill.upsert({
    where: {
      profileId_skillId: {
        profileId: sarahProfile.id,
        skillId: createdSkills['Event Planning'].id
      }
    },
    update: {},
    create: {
      profileId: sarahProfile.id,
      skillId: createdSkills['Event Planning'].id,
      proficiency: 'EXPERT',
      yearsOfExp: 8,
      certified: true
    }
  });

  await prisma.volunteerSkill.upsert({
    where: {
      profileId_skillId: {
        profileId: sarahProfile.id,
        skillId: createdSkills['Public Speaking'].id
      }
    },
    update: {},
    create: {
      profileId: sarahProfile.id,
      skillId: createdSkills['Public Speaking'].id,
      proficiency: 'ADVANCED',
      yearsOfExp: 6
    }
  });

  // Volunteer 3: Mike Brown - Multi-skilled volunteer
  const mike = await prisma.user.upsert({
    where: { email: 'mike.brown@email.com' },
    update: {},
    create: {
      username: 'mikebrown',
      email: 'mike.brown@email.com',
      password: hashPassword('Volunteer123!'),
      role: 'VOLUNTEER',
      verified: true
    }
  });

  const mikeProfile = await prisma.profile.upsert({
    where: { userId: mike.id },
    update: {},
    create: {
      userId: mike.id,
      firstName: 'Mike',
      lastName: 'Brown',
      phone: '713-555-0104',
      address: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77006',
      latitude: 29.7490,
      longitude: -95.3860,
      bio: 'Jack of all trades, eager to help wherever needed',
      maxTravelDistance: 40,
      preferredCauses: ['food', 'environmental', 'community'],
      preferredDays: ['Tuesday', 'Thursday', 'Saturday'],
      preferredTimeSlots: ['afternoon', 'evening'],
      profileCompleteness: 85
    }
  });

  await prisma.volunteerSkill.upsert({
    where: {
      profileId_skillId: {
        profileId: mikeProfile.id,
        skillId: createdSkills['Cooking'].id
      }
    },
    update: {},
    create: {
      profileId: mikeProfile.id,
      skillId: createdSkills['Cooking'].id,
      proficiency: 'INTERMEDIATE',
      yearsOfExp: 4
    }
  });

  await prisma.volunteerSkill.upsert({
    where: {
      profileId_skillId: {
        profileId: mikeProfile.id,
        skillId: createdSkills['Construction'].id
      }
    },
    update: {},
    create: {
      profileId: mikeProfile.id,
      skillId: createdSkills['Construction'].id,
      proficiency: 'BEGINNER',
      yearsOfExp: 1
    }
  });

  await prisma.volunteerSkill.upsert({
    where: {
      profileId_skillId: {
        profileId: mikeProfile.id,
        skillId: createdSkills['Gardening'].id
      }
    },
    update: {},
    create: {
      profileId: mikeProfile.id,
      skillId: createdSkills['Gardening'].id,
      proficiency: 'ADVANCED',
      yearsOfExp: 7
    }
  });

  console.log('✅ Seeded 4 users with profiles and skills');

  // ========================================
  // 4. EVENTS
  // ========================================
  console.log('📅 Seeding events...');

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Event 1: Community Food Drive
  const foodDrive = await prisma.event.upsert({
    where: { id: 'event-food-drive-001' },
    update: {},
    create: {
      id: 'event-food-drive-001',
      title: 'Community Food Drive',
      description: 'Help organize and distribute food to families in need. We need volunteers to sort donations, pack bags, and distribute to local families.',
      category: 'food',
      urgencyLevel: 'HIGH',
      status: 'PUBLISHED',
      startDate: new Date(nextWeek.setHours(9, 0, 0)),
      endDate: new Date(nextWeek.setHours(17, 0, 0)),
      address: '456 Community Center Drive',
      city: 'Houston',
      state: 'TX',
      zipCode: '77002',
      latitude: 29.7520,
      longitude: -95.3720,
      maxVolunteers: 20,
      currentVolunteers: 0,
      createdBy: admin.id
    }
  });

  await prisma.eventRequirement.upsert({
    where: {
      eventId_skillId: {
        eventId: foodDrive.id,
        skillId: createdSkills['Cooking'].id
      }
    },
    update: {},
    create: {
      eventId: foodDrive.id,
      skillId: createdSkills['Cooking'].id,
      minLevel: 'BEGINNER',
      isRequired: true
    }
  });

  await prisma.eventRequirement.upsert({
    where: {
      eventId_skillId: {
        eventId: foodDrive.id,
        skillId: createdSkills['Event Planning'].id
      }
    },
    update: {},
    create: {
      eventId: foodDrive.id,
      skillId: createdSkills['Event Planning'].id,
      minLevel: 'INTERMEDIATE',
      isRequired: false
    }
  });

  // Event 2: Park Cleanup
  const parkCleanup = await prisma.event.upsert({
    where: { id: 'event-park-cleanup-001' },
    update: {},
    create: {
      id: 'event-park-cleanup-001',
      title: 'Memorial Park Cleanup',
      description: 'Join us for a community park cleanup to beautify our local green spaces. Tools provided.',
      category: 'environmental',
      urgencyLevel: 'MEDIUM',
      status: 'PUBLISHED',
      startDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000).setHours(8, 0, 0),
      endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000).setHours(14, 0, 0),
      address: '789 Memorial Park Drive',
      city: 'Houston',
      state: 'TX',
      zipCode: '77007',
      latitude: 29.7633,
      longitude: -95.3903,
      maxVolunteers: 30,
      currentVolunteers: 0,
      createdBy: admin.id
    }
  });

  await prisma.eventRequirement.upsert({
    where: {
      eventId_skillId: {
        eventId: parkCleanup.id,
        skillId: createdSkills['Gardening'].id
      }
    },
    update: {},
    create: {
      eventId: parkCleanup.id,
      skillId: createdSkills['Gardening'].id,
      minLevel: 'BEGINNER',
      isRequired: false
    }
  });

  // Event 3: Health Fair
  const healthFair = await prisma.event.upsert({
    where: { id: 'event-health-fair-001' },
    update: {},
    create: {
      id: 'event-health-fair-001',
      title: 'Community Health Fair',
      description: 'Free health screenings and wellness education for the community. Need volunteers with healthcare background.',
      category: 'healthcare',
      urgencyLevel: 'CRITICAL',
      status: 'PUBLISHED',
      startDate: new Date(nextMonth.setHours(10, 0, 0)),
      endDate: new Date(nextMonth.setHours(16, 0, 0)),
      address: '123 Medical Plaza',
      city: 'Houston',
      state: 'TX',
      zipCode: '77004',
      latitude: 29.7300,
      longitude: -95.3400,
      maxVolunteers: 15,
      currentVolunteers: 0,
      createdBy: admin.id
    }
  });

  await prisma.eventRequirement.upsert({
    where: {
      eventId_skillId: {
        eventId: healthFair.id,
        skillId: createdSkills['First Aid/CPR'].id
      }
    },
    update: {},
    create: {
      eventId: healthFair.id,
      skillId: createdSkills['First Aid/CPR'].id,
      minLevel: 'ADVANCED',
      isRequired: true
    }
  });

  await prisma.eventRequirement.upsert({
    where: {
      eventId_skillId: {
        eventId: healthFair.id,
        skillId: createdSkills['Customer Service'].id
      }
    },
    update: {},
    create: {
      eventId: healthFair.id,
      skillId: createdSkills['Customer Service'].id,
      minLevel: 'INTERMEDIATE',
      isRequired: false
    }
  });

  console.log('✅ Seeded 3 events with requirements');

  console.log('\n✨ Database seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin:     admin@jacsshiftpilot.com / Admin123!');
  console.log('   Volunteer: john.smith@email.com / Volunteer123!');
  console.log('   Volunteer: sarah.jones@email.com / Volunteer123!');
  console.log('   Volunteer: mike.brown@email.com / Volunteer123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
