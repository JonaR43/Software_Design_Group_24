/**
 * Database Seed Script
 * Populates the database with initial data from in-memory structures
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Import existing data
const { users, profiles } = require('../src/data/users');
const { skills: skillsData } = require('../src/data/skills');
const { events } = require('../src/data/events');
const { volunteerHistory } = require('../src/data/history');
const { notifications } = require('../src/data/notifications');

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  Clearing existing data...');
    await prisma.notification.deleteMany();
    await prisma.volunteerHistory.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.eventRequirement.deleteMany();
    await prisma.event.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.volunteerSkill.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.state.deleteMany();
    console.log('✅ Existing data cleared');
  }

  // Seed States
  console.log('📍 Seeding states...');
  const states = [
    { code: 'AL', name: 'Alabama', abbreviation: 'AL' },
    { code: 'AK', name: 'Alaska', abbreviation: 'AK' },
    { code: 'AZ', name: 'Arizona', abbreviation: 'AZ' },
    { code: 'AR', name: 'Arkansas', abbreviation: 'AR' },
    { code: 'CA', name: 'California', abbreviation: 'CA' },
    { code: 'CO', name: 'Colorado', abbreviation: 'CO' },
    { code: 'CT', name: 'Connecticut', abbreviation: 'CT' },
    { code: 'DE', name: 'Delaware', abbreviation: 'DE' },
    { code: 'FL', name: 'Florida', abbreviation: 'FL' },
    { code: 'GA', name: 'Georgia', abbreviation: 'GA' },
    { code: 'HI', name: 'Hawaii', abbreviation: 'HI' },
    { code: 'ID', name: 'Idaho', abbreviation: 'ID' },
    { code: 'IL', name: 'Illinois', abbreviation: 'IL' },
    { code: 'IN', name: 'Indiana', abbreviation: 'IN' },
    { code: 'IA', name: 'Iowa', abbreviation: 'IA' },
    { code: 'KS', name: 'Kansas', abbreviation: 'KS' },
    { code: 'KY', name: 'Kentucky', abbreviation: 'KY' },
    { code: 'LA', name: 'Louisiana', abbreviation: 'LA' },
    { code: 'ME', name: 'Maine', abbreviation: 'ME' },
    { code: 'MD', name: 'Maryland', abbreviation: 'MD' },
    { code: 'MA', name: 'Massachusetts', abbreviation: 'MA' },
    { code: 'MI', name: 'Michigan', abbreviation: 'MI' },
    { code: 'MN', name: 'Minnesota', abbreviation: 'MN' },
    { code: 'MS', name: 'Mississippi', abbreviation: 'MS' },
    { code: 'MO', name: 'Missouri', abbreviation: 'MO' },
    { code: 'MT', name: 'Montana', abbreviation: 'MT' },
    { code: 'NE', name: 'Nebraska', abbreviation: 'NE' },
    { code: 'NV', name: 'Nevada', abbreviation: 'NV' },
    { code: 'NH', name: 'New Hampshire', abbreviation: 'NH' },
    { code: 'NJ', name: 'New Jersey', abbreviation: 'NJ' },
    { code: 'NM', name: 'New Mexico', abbreviation: 'NM' },
    { code: 'NY', name: 'New York', abbreviation: 'NY' },
    { code: 'NC', name: 'North Carolina', abbreviation: 'NC' },
    { code: 'ND', name: 'North Dakota', abbreviation: 'ND' },
    { code: 'OH', name: 'Ohio', abbreviation: 'OH' },
    { code: 'OK', name: 'Oklahoma', abbreviation: 'OK' },
    { code: 'OR', name: 'Oregon', abbreviation: 'OR' },
    { code: 'PA', name: 'Pennsylvania', abbreviation: 'PA' },
    { code: 'RI', name: 'Rhode Island', abbreviation: 'RI' },
    { code: 'SC', name: 'South Carolina', abbreviation: 'SC' },
    { code: 'SD', name: 'South Dakota', abbreviation: 'SD' },
    { code: 'TN', name: 'Tennessee', abbreviation: 'TN' },
    { code: 'TX', name: 'Texas', abbreviation: 'TX' },
    { code: 'UT', name: 'Utah', abbreviation: 'UT' },
    { code: 'VT', name: 'Vermont', abbreviation: 'VT' },
    { code: 'VA', name: 'Virginia', abbreviation: 'VA' },
    { code: 'WA', name: 'Washington', abbreviation: 'WA' },
    { code: 'WV', name: 'West Virginia', abbreviation: 'WV' },
    { code: 'WI', name: 'Wisconsin', abbreviation: 'WI' },
    { code: 'WY', name: 'Wyoming', abbreviation: 'WY' }
  ];

  await prisma.state.createMany({
    data: states,
    skipDuplicates: true
  });
  console.log(`✅ Seeded ${states.length} states`);

  // Seed Skills
  console.log('🎯 Seeding skills...');
  const skillIdMap = new Map(); // Map old IDs to new UUIDs

  for (const skill of skillsData) {
    const createdSkill = await prisma.skill.create({
      data: {
        name: skill.name,
        category: skill.category,
        description: skill.description || null
      }
    });
    skillIdMap.set(skill.id, createdSkill.id);
  }
  console.log(`✅ Seeded ${skillsData.length} skills`);

  // Seed Users and Profiles
  console.log('👥 Seeding users and profiles...');
  const userIdMap = new Map(); // Map old IDs to new UUIDs

  for (const user of users) {
    // Create user
    const createdUser = await prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: user.password, // Already hashed in source data
        role: user.role.toUpperCase(),
        verified: user.verified || false,
        oauthProvider: user.oauthProvider || null,
        oauthId: user.oauthId || null,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
      }
    });

    userIdMap.set(user.id, createdUser.id);

    // Create profile if exists
    const profile = profiles.find(p => p.userId === user.id);
    if (profile) {
      // Map full state names to abbreviations
      const stateMap = {
        'Texas': 'TX',
        'California': 'CA',
        'Florida': 'FL',
        'New York': 'NY'
        // Add more mappings as needed
      };

      const stateCode = profile.state && profile.state.length > 2
        ? stateMap[profile.state] || null
        : profile.state || null;

      await prisma.profile.create({
        data: {
          userId: createdUser.id,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phone: profile.phone || null,
          address: profile.address || null,
          city: profile.city || null,
          state: stateCode,
          zipCode: profile.zipCode || null,
          bio: profile.bio || null,
          avatar: profile.avatar || null,
          maxTravelDistance: profile.maxTravelDistance || profile.preferences?.maxDistance || 25,
          preferredDays: profile.preferences?.preferredDays || [],
          preferredTimeSlots: profile.preferences?.preferredTimeSlots || [],
          preferredCauses: profile.preferences?.causes || profile.preferences?.preferredCauses || [],
          emailNotifications: profile.preferences?.emailNotifications !== false,
          eventReminders: profile.preferences?.eventReminders !== false,
          weekendsOnly: profile.preferences?.weekendsOnly || profile.preferences?.weekdaysOnly === false,
          profileCompleteness: profile.profileCompleteness || 0,
          lastActive: profile.lastActive ? new Date(profile.lastActive) : null,
          createdAt: profile.createdAt ? new Date(profile.createdAt) : new Date(),
          updatedAt: profile.updatedAt ? new Date(profile.updatedAt) : new Date()
        }
      });

      // Add skills to profile
      if (profile.skills && profile.skills.length > 0) {
        const profileRecord = await prisma.profile.findUnique({
          where: { userId: createdUser.id }
        });

        for (const skill of profile.skills) {
          const newSkillId = skillIdMap.get(skill.skillId);
          if (newSkillId && profileRecord) {
            await prisma.volunteerSkill.create({
              data: {
                profileId: profileRecord.id,
                skillId: newSkillId,
                proficiency: skill.proficiency.toUpperCase(),
                yearsOfExp: skill.yearsOfExp || 0,
                certified: skill.certified || false
              }
            }).catch(() => {}); // Skip duplicates
          }
        }
      }

      // Add availability to profile
      if (profile.availability && profile.availability.length > 0) {
        const profileRecord = await prisma.profile.findUnique({
          where: { userId: createdUser.id }
        });

        if (profileRecord) {
          // Map day numbers to day names
          const dayMap = {
            0: 'Sunday',
            1: 'Monday',
            2: 'Tuesday',
            3: 'Wednesday',
            4: 'Thursday',
            5: 'Friday',
            6: 'Saturday'
          };

          for (const slot of profile.availability) {
            const dayOfWeek = typeof slot.dayOfWeek === 'number'
              ? dayMap[slot.dayOfWeek]
              : slot.dayOfWeek;

            await prisma.availability.create({
              data: {
                profileId: profileRecord.id,
                dayOfWeek: dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime
              }
            });
          }
        }
      }
    }
  }
  console.log(`✅ Seeded ${users.length} users and ${profiles.length} profiles`);

  // Seed Events
  console.log('📅 Seeding events...');
  const eventIdMap = new Map(); // Map old IDs to new UUIDs

  for (const event of events) {
    const creatorId = userIdMap.get(event.createdBy);
    if (!creatorId) continue;

    // Map state names to codes
    const eventStateCode = event.state && event.state.length > 2
      ? (event.state === 'Texas' ? 'TX' : event.state)
      : event.state || 'TX';

    // Map urgency levels - handle variations
    const urgencyMap = {
      'URGENT': 'CRITICAL',
      'NORMAL': 'MEDIUM'
    };
    const urgencyLevel = event.urgencyLevel ? event.urgencyLevel.toUpperCase() : 'MEDIUM';
    const mappedUrgency = urgencyMap[urgencyLevel] || urgencyLevel;

    // Validate urgency level
    const validUrgency = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(mappedUrgency)
      ? mappedUrgency
      : 'MEDIUM';

    const createdEvent = await prisma.event.create({
      data: {
        title: event.title,
        description: event.description,
        category: event.category,
        urgencyLevel: validUrgency,
        status: event.status.toUpperCase().replace('-', '_'),
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        address: event.address || 'TBD',
        city: event.city || 'Houston',
        state: eventStateCode,
        zipCode: event.zipCode || '77001',
        latitude: event.latitude || null,
        longitude: event.longitude || null,
        maxVolunteers: event.maxVolunteers,
        currentVolunteers: event.currentVolunteers || 0,
        createdBy: creatorId,
        createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
        updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date()
      }
    });

    eventIdMap.set(event.id, createdEvent.id);

    // Add required skills
    if (event.requiredSkills && event.requiredSkills.length > 0) {
      for (const reqSkill of event.requiredSkills) {
        const newSkillId = skillIdMap.get(reqSkill.skillId);
        if (newSkillId) {
          await prisma.eventRequirement.create({
            data: {
              eventId: createdEvent.id,
              skillId: newSkillId,
              minLevel: reqSkill.minLevel.toUpperCase(),
              isRequired: reqSkill.isRequired !== false || reqSkill.required !== false
            }
          }).catch(() => {}); // Skip duplicates
        }
      }
    }
  }
  console.log(`✅ Seeded ${events.length} events`);

  console.log('✨ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
