/**
 * Minimal Database Reset Script
 * Clears all data except skills and admin user
 * For testing registration/login functionality
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Import skills data
const { skills: skillsData } = require('../src/data/skills');

async function main() {
  console.log('🌱 Starting minimal database reset...');

  // Clear existing data
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
  for (const skill of skillsData) {
    await prisma.skill.create({
      data: {
        name: skill.name,
        category: skill.category,
        description: skill.description || null
      }
    });
  }
  console.log(`✅ Seeded ${skillsData.length} skills`);

  // Create Admin User Only
  console.log('👤 Creating admin user...');
  const hashedPassword = bcrypt.hashSync('Admin123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@jacsshiftpilot.com',
      password: hashedPassword,
      role: 'ADMIN',
      verified: true
    }
  });

  // Create Admin Profile
  await prisma.profile.create({
    data: {
      userId: adminUser.id,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1-555-0100',
      address: '123 Admin Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      bio: 'System administrator for JACS ShiftPilot volunteer management platform.',
      maxTravelDistance: 0,
      preferredDays: [],
      preferredTimeSlots: ['morning', 'afternoon'],
      preferredCauses: ['administrative'],
      emailNotifications: true,
      eventReminders: true,
      weekendsOnly: false,
      profileCompleteness: 100
    }
  });

  console.log('✅ Created admin user');
  console.log('');
  console.log('📋 Admin Credentials:');
  console.log('   Username: admin');
  console.log('   Email: admin@jacsshiftpilot.com');
  console.log('   Password: Admin123!');
  console.log('');
  console.log('✨ Minimal database reset completed successfully!');
  console.log('🧪 Database is now ready for testing registration/login functionality');
}

main()
  .catch((e) => {
    console.error('❌ Error resetting database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
