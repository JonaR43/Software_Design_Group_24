/**
 * Enhanced Mock Data Seed Script
 * Keeps existing admin user and adds comprehensive test data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting mock data seed...');

  // Get the existing admin user
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });

  if (adminUsers.length === 0) {
    console.log('❌ No admin user found. Please create an admin user first.');
    return;
  }

  const admin = adminUsers[0];
  console.log(`✅ Found admin user: ${admin.email}`);

  // Clear all data EXCEPT users and profiles
  console.log('🗑️  Clearing existing data (keeping users)...');
  await prisma.notification.deleteMany();
  await prisma.volunteerHistory.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.eventRequirement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.volunteerSkill.deleteMany();

  // Delete volunteer users and profiles (keep admin)
  const adminProfile = await prisma.profile.findUnique({
    where: { userId: admin.id }
  });

  await prisma.profile.deleteMany({
    where: {
      userId: { not: admin.id }
    }
  });

  await prisma.user.deleteMany({
    where: {
      id: { not: admin.id }
    }
  });

  console.log('✅ Cleared existing data');

  // Ensure skills exist
  console.log('🎯 Seeding skills...');
  const skills = [
    { name: 'Teaching', category: 'education', description: 'Ability to teach and mentor others' },
    { name: 'First Aid', category: 'healthcare', description: 'Basic first aid and CPR knowledge' },
    { name: 'Cooking', category: 'community', description: 'Food preparation skills' },
    { name: 'Construction', category: 'community', description: 'Building and repair skills' },
    { name: 'Gardening', category: 'environment', description: 'Gardening and landscaping' },
    { name: 'Event Planning', category: 'community', description: 'Organizing and coordinating events' },
    { name: 'Translation', category: 'education', description: 'Multilingual translation' },
    { name: 'Childcare', category: 'community', description: 'Caring for children' }
  ];

  const skillRecords = [];
  for (const skill of skills) {
    const existing = await prisma.skill.findFirst({
      where: { name: skill.name }
    });

    if (existing) {
      skillRecords.push(existing);
    } else {
      const created = await prisma.skill.create({ data: skill });
      skillRecords.push(created);
    }
  }
  console.log(`✅ Seeded ${skillRecords.length} skills`);

  // Create volunteer users with availability
  console.log('👥 Creating volunteer users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const volunteers = [
    {
      username: 'sarah.johnson',
      email: 'sarah.johnson@test.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '555-0101',
      skills: ['Teaching', 'Childcare'],
      availability: [
        { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { specificDate: new Date('2025-11-10'), startTime: '10:00', endTime: '14:00' }
      ]
    },
    {
      username: 'mike.chen',
      email: 'mike.chen@test.com',
      firstName: 'Mike',
      lastName: 'Chen',
      phone: '555-0102',
      skills: ['First Aid', 'Event Planning'],
      availability: [
        { dayOfWeek: 'Tuesday', startTime: '14:00', endTime: '20:00' },
        { dayOfWeek: 'Thursday', startTime: '14:00', endTime: '20:00' },
        { specificDate: new Date('2025-11-15'), startTime: '09:00', endTime: '17:00' }
      ]
    },
    {
      username: 'emma.davis',
      email: 'emma.davis@test.com',
      firstName: 'Emma',
      lastName: 'Davis',
      phone: '555-0103',
      skills: ['Cooking', 'Gardening'],
      availability: [
        { dayOfWeek: 'Saturday', startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 'Sunday', startTime: '08:00', endTime: '16:00' },
        { specificDate: new Date('2025-11-20'), startTime: '10:00', endTime: '15:00' }
      ]
    },
    {
      username: 'james.wilson',
      email: 'james.wilson@test.com',
      firstName: 'James',
      lastName: 'Wilson',
      phone: '555-0104',
      skills: ['Construction', 'Event Planning'],
      availability: [
        { dayOfWeek: 'Friday', startTime: '13:00', endTime: '19:00' },
        { specificDate: new Date('2025-11-12'), startTime: '09:00', endTime: '17:00' },
        { specificDate: new Date('2025-11-18'), startTime: '09:00', endTime: '17:00' }
      ]
    },
    {
      username: 'lisa.martinez',
      email: 'lisa.martinez@test.com',
      firstName: 'Lisa',
      lastName: 'Martinez',
      phone: '555-0105',
      skills: ['Translation', 'Teaching'],
      availability: [
        { dayOfWeek: 'Monday', startTime: '18:00', endTime: '21:00' },
        { dayOfWeek: 'Wednesday', startTime: '18:00', endTime: '21:00' },
        { specificDate: new Date('2025-11-25'), startTime: '14:00', endTime: '18:00' }
      ]
    }
  ];

  for (const vol of volunteers) {
    const user = await prisma.user.create({
      data: {
        username: vol.username,
        email: vol.email,
        password: hashedPassword,
        role: 'VOLUNTEER',
        verified: true
      }
    });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        firstName: vol.firstName,
        lastName: vol.lastName,
        phone: vol.phone,
        address: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        maxTravelDistance: 25,
        emailNotifications: true,
        eventReminders: true,
        profileCompleteness: 85
      }
    });

    // Add skills
    for (const skillName of vol.skills) {
      const skill = skillRecords.find(s => s.name === skillName);
      if (skill) {
        await prisma.volunteerSkill.create({
          data: {
            profileId: profile.id,
            skillId: skill.id,
            proficiency: 'INTERMEDIATE',
            yearsOfExp: 2,
            certified: false
          }
        });
      }
    }

    // Add availability
    for (const slot of vol.availability) {
      await prisma.availability.create({
        data: {
          profileId: profile.id,
          dayOfWeek: slot.dayOfWeek || null,
          specificDate: slot.specificDate ? new Date(slot.specificDate.toISOString().split('T')[0] + 'T12:00:00Z') : null,
          isRecurring: !slot.specificDate,
          startTime: slot.startTime,
          endTime: slot.endTime
        }
      });
    }

    console.log(`✅ Created volunteer: ${vol.email} (password: password123)`);
  }

  // Create future events that match volunteer availability
  console.log('📅 Creating events...');
  const events = [
    {
      title: 'Community Food Drive',
      description: 'Help distribute food to families in need',
      category: 'community',
      urgencyLevel: 'HIGH',
      startDate: new Date('2025-11-10T10:00:00Z'),
      endDate: new Date('2025-11-10T14:00:00Z'),
      maxVolunteers: 10,
      requiredSkills: ['Cooking']
    },
    {
      title: 'Youth Tutoring Program',
      description: 'Tutor students in math and science',
      category: 'education',
      urgencyLevel: 'MEDIUM',
      startDate: new Date('2025-11-12T09:00:00Z'),
      endDate: new Date('2025-11-12T17:00:00Z'),
      maxVolunteers: 8,
      requiredSkills: ['Teaching']
    },
    {
      title: 'Health Fair Assistance',
      description: 'Assist at community health fair',
      category: 'healthcare',
      urgencyLevel: 'CRITICAL',
      startDate: new Date('2025-11-15T09:00:00Z'),
      endDate: new Date('2025-11-15T17:00:00Z'),
      maxVolunteers: 15,
      requiredSkills: ['First Aid']
    },
    {
      title: 'Park Cleanup Day',
      description: 'Clean up and beautify local parks',
      category: 'environment',
      urgencyLevel: 'LOW',
      startDate: new Date('2025-11-18T09:00:00Z'),
      endDate: new Date('2025-11-18T15:00:00Z'),
      maxVolunteers: 20,
      requiredSkills: ['Gardening']
    },
    {
      title: 'Habitat for Humanity Build',
      description: 'Help build homes for families',
      category: 'community',
      urgencyLevel: 'HIGH',
      startDate: new Date('2025-11-20T08:00:00Z'),
      endDate: new Date('2025-11-20T16:00:00Z'),
      maxVolunteers: 12,
      requiredSkills: ['Construction']
    },
    {
      title: 'Holiday Charity Event',
      description: 'Organize and run holiday charity event',
      category: 'community',
      urgencyLevel: 'MEDIUM',
      startDate: new Date('2025-11-25T14:00:00Z'),
      endDate: new Date('2025-11-25T18:00:00Z'),
      maxVolunteers: 10,
      requiredSkills: ['Event Planning']
    },
    {
      title: 'Senior Center Activities',
      description: 'Lead activities at senior center',
      category: 'community',
      urgencyLevel: 'MEDIUM',
      startDate: new Date('2025-11-22T10:00:00Z'),
      endDate: new Date('2025-11-22T14:00:00Z'),
      maxVolunteers: 6,
      requiredSkills: ['Event Planning']
    },
    {
      title: 'Library Reading Program',
      description: 'Read to children at the library',
      category: 'education',
      urgencyLevel: 'LOW',
      startDate: new Date('2025-11-13T15:00:00Z'),
      endDate: new Date('2025-11-13T17:00:00Z'),
      maxVolunteers: 5,
      requiredSkills: ['Teaching', 'Childcare']
    },
    // Additional events to test carousel pagination
    {
      title: 'Community Garden Planting',
      description: 'Plant vegetables and flowers in community garden',
      category: 'environment',
      urgencyLevel: 'MEDIUM',
      startDate: new Date('2025-11-16T09:00:00Z'),
      endDate: new Date('2025-11-16T13:00:00Z'),
      maxVolunteers: 15,
      requiredSkills: ['Gardening']
    },
    {
      title: 'After School Tutoring',
      description: 'Help elementary students with homework',
      category: 'education',
      urgencyLevel: 'HIGH',
      startDate: new Date('2025-11-19T15:00:00Z'),
      endDate: new Date('2025-11-19T18:00:00Z'),
      maxVolunteers: 8,
      requiredSkills: ['Teaching']
    },
    {
      title: 'Soup Kitchen Service',
      description: 'Prepare and serve meals to those in need',
      category: 'community',
      urgencyLevel: 'HIGH',
      startDate: new Date('2025-11-21T11:00:00Z'),
      endDate: new Date('2025-11-21T14:00:00Z'),
      maxVolunteers: 12,
      requiredSkills: ['Cooking']
    },
    {
      title: 'Home Repair Workshop',
      description: 'Teach basic home repair skills',
      category: 'community',
      urgencyLevel: 'LOW',
      startDate: new Date('2025-11-23T10:00:00Z'),
      endDate: new Date('2025-11-23T16:00:00Z'),
      maxVolunteers: 10,
      requiredSkills: ['Construction']
    },
    {
      title: 'Medical Clinic Support',
      description: 'Assist nurses at free medical clinic',
      category: 'healthcare',
      urgencyLevel: 'CRITICAL',
      startDate: new Date('2025-11-17T08:00:00Z'),
      endDate: new Date('2025-11-17T17:00:00Z'),
      maxVolunteers: 20,
      requiredSkills: ['First Aid']
    },
    {
      title: 'Festival Planning Committee',
      description: 'Help organize annual community festival',
      category: 'community',
      urgencyLevel: 'MEDIUM',
      startDate: new Date('2025-11-24T14:00:00Z'),
      endDate: new Date('2025-11-24T18:00:00Z'),
      maxVolunteers: 8,
      requiredSkills: ['Event Planning']
    }
  ];

  for (const event of events) {
    const createdEvent = await prisma.event.create({
      data: {
        title: event.title,
        description: event.description,
        category: event.category,
        urgencyLevel: event.urgencyLevel,
        status: 'PUBLISHED',
        startDate: event.startDate,
        endDate: event.endDate,
        address: '456 Event Ave',
        city: 'Houston',
        state: 'TX',
        zipCode: '77002',
        latitude: 29.7604,
        longitude: -95.3698,
        maxVolunteers: event.maxVolunteers,
        currentVolunteers: 0,
        createdBy: admin.id
      }
    });

    // Add required skills
    for (const skillName of event.requiredSkills) {
      const skill = skillRecords.find(s => s.name === skillName);
      if (skill) {
        await prisma.eventRequirement.create({
          data: {
            eventId: createdEvent.id,
            skillId: skill.id,
            minLevel: 'BEGINNER',
            isRequired: false
          }
        });
      }
    }

    console.log(`✅ Created event: ${event.title} on ${event.startDate.toLocaleDateString()}`);
  }

  console.log('\n✨ Mock data seed completed successfully!');
  console.log('\n📋 Test User Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log(`  Email: ${admin.email}`);
  console.log('  Password: <your existing password>');
  console.log('\nVolunteers (all with password: password123):');
  console.log('  sarah.johnson@test.com - Available Mon/Wed + Nov 10');
  console.log('  mike.chen@test.com - Available Tue/Thu + Nov 15');
  console.log('  emma.davis@test.com - Available Sat/Sun + Nov 20');
  console.log('  james.wilson@test.com - Available Fri + Nov 12 & 18');
  console.log('  lisa.martinez@test.com - Available Mon/Wed evenings + Nov 25');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
