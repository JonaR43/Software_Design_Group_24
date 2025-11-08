/**
 * Large Mock Data Seed Script
 * Creates comprehensive test data for development and demo
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper to create consistent password hashes
const hashPassword = (password) => bcrypt.hashSync(password, 10);

// Helper to generate random date
const randomFutureDate = (daysFromNow, hourStart = 9, hourEnd = 17) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const hour = Math.floor(Math.random() * (hourEnd - hourStart) + hourStart);
  date.setHours(hour, 0, 0, 0);
  return date;
};

async function main() {
  console.log('🌱 Starting large database seed...');

  // ========================================
  // 1. STATES
  // ========================================
  console.log('📍 Seeding states...');
  const states = [
    { code: 'TX', name: 'Texas', abbreviation: 'TX' },
    { code: 'CA', name: 'California', abbreviation: 'CA' },
    { code: 'NY', name: 'New York', abbreviation: 'NY' },
    { code: 'FL', name: 'Florida', abbreviation: 'FL' },
    { code: 'IL', name: 'Illinois', abbreviation: 'IL' },
    { code: 'VA', name: 'Virginia', abbreviation: 'VA' },
    { code: 'WA', name: 'Washington', abbreviation: 'WA' }
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
  const skillsData = [
    { name: 'Event Planning', category: 'administrative', description: 'Planning and organizing events' },
    { name: 'Data Entry', category: 'administrative', description: 'Data management and entry' },
    { name: 'Customer Service', category: 'social', description: 'Helping and interacting with people' },
    { name: 'First Aid/CPR', category: 'healthcare', description: 'Emergency medical response' },
    { name: 'Nursing', category: 'healthcare', description: 'Medical care and assistance' },
    { name: 'Tutoring', category: 'education', description: 'Teaching and mentoring' },
    { name: 'Public Speaking', category: 'communication', description: 'Presentations and speaking' },
    { name: 'Teaching', category: 'education', description: 'Educational instruction' },
    { name: 'Gardening', category: 'environmental', description: 'Plant care and landscaping' },
    { name: 'Construction', category: 'manual labor', description: 'Building and repair work' },
    { name: 'Painting', category: 'manual labor', description: 'Interior/exterior painting' },
    { name: 'Carpentry', category: 'manual labor', description: 'Woodworking and building' },
    { name: 'Cooking', category: 'food service', description: 'Food preparation and service' },
    { name: 'Food Service', category: 'food service', description: 'Serving and food handling' },
    { name: 'Fundraising', category: 'administrative', description: 'Raising funds for causes' },
    { name: 'Social Media', category: 'technology', description: 'Digital marketing and engagement' },
    { name: 'Photography', category: 'creative', description: 'Photo and video documentation' },
    { name: 'Translation', category: 'communication', description: 'Language translation services' },
    { name: 'Animal Care', category: 'environmental', description: 'Pet and animal assistance' },
    { name: 'Graphic Design', category: 'creative', description: 'Visual design and branding' },
    { name: 'Web Development', category: 'technology', description: 'Website creation and maintenance' },
    { name: 'Writing', category: 'communication', description: 'Content creation and editing' },
    { name: 'Childcare', category: 'social', description: 'Caring for children' },
    { name: 'Elderly Care', category: 'healthcare', description: 'Assisting elderly individuals' },
    { name: 'Sports Coaching', category: 'education', description: 'Athletic training and coaching' }
  ];

  const createdSkills = {};
  for (const skill of skillsData) {
    const created = await prisma.skill.upsert({
      where: { name: skill.name },
      update: skill,
      create: skill
    });
    createdSkills[skill.name] = created;
  }
  console.log(`✅ Seeded ${skillsData.length} skills`);

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

  // Volunteer data
  const volunteers = [
    // Houston volunteers (local)
    {
      username: 'john.smith', email: 'john.smith@email.com',
      firstName: 'John', lastName: 'Smith',
      city: 'Houston', state: 'TX', zipCode: '77003',
      lat: 29.7520, lng: -95.3720,
      skills: ['First Aid/CPR', 'Customer Service'],
      proficiencies: ['ADVANCED', 'INTERMEDIATE'],
      bio: 'Healthcare professional passionate about community service',
      maxDistance: 25,
      causes: ['healthcare', 'community'],
      days: ['Monday', 'Wednesday', 'Friday']
    },
    {
      username: 'sarah.jones', email: 'sarah.jones@email.com',
      firstName: 'Sarah', lastName: 'Jones',
      city: 'Houston', state: 'TX', zipCode: '77005',
      lat: 29.7180, lng: -95.4020,
      skills: ['Event Planning', 'Public Speaking', 'Fundraising'],
      proficiencies: ['EXPERT', 'ADVANCED', 'ADVANCED'],
      bio: 'Professional event planner dedicated to making a difference',
      maxDistance: 30,
      causes: ['community', 'educational'],
      days: ['Saturday', 'Sunday']
    },
    {
      username: 'mike.brown', email: 'mike.brown@email.com',
      firstName: 'Mike', lastName: 'Brown',
      city: 'Houston', state: 'TX', zipCode: '77006',
      lat: 29.7490, lng: -95.3860,
      skills: ['Cooking', 'Construction', 'Gardening'],
      proficiencies: ['INTERMEDIATE', 'BEGINNER', 'ADVANCED'],
      bio: 'Jack of all trades, eager to help wherever needed',
      maxDistance: 40,
      causes: ['food', 'environmental', 'community'],
      days: ['Tuesday', 'Thursday', 'Saturday']
    },
    {
      username: 'emily.davis', email: 'emily.davis@email.com',
      firstName: 'Emily', lastName: 'Davis',
      city: 'Houston', state: 'TX', zipCode: '77007',
      lat: 29.7633, lng: -95.3903,
      skills: ['Teaching', 'Tutoring', 'Childcare'],
      proficiencies: ['EXPERT', 'ADVANCED', 'INTERMEDIATE'],
      bio: 'Educator with 10 years experience, loves working with kids',
      maxDistance: 20,
      causes: ['educational', 'community'],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
    },
    {
      username: 'david.wilson', email: 'david.wilson@email.com',
      firstName: 'David', lastName: 'Wilson',
      city: 'Houston', state: 'TX', zipCode: '77004',
      lat: 29.7300, lng: -95.3400,
      skills: ['Photography', 'Graphic Design', 'Social Media'],
      proficiencies: ['EXPERT', 'ADVANCED', 'ADVANCED'],
      bio: 'Creative professional helping nonprofits with marketing',
      maxDistance: 35,
      causes: ['community', 'creative'],
      days: ['Friday', 'Saturday', 'Sunday']
    },
    {
      username: 'lisa.garcia', email: 'lisa.garcia@email.com',
      firstName: 'Lisa', lastName: 'Garcia',
      city: 'Houston', state: 'TX', zipCode: '77008',
      lat: 29.7810, lng: -95.4030,
      skills: ['Translation', 'Customer Service', 'Teaching'],
      proficiencies: ['EXPERT', 'ADVANCED', 'INTERMEDIATE'],
      bio: 'Bilingual educator helping bridge language barriers',
      maxDistance: 25,
      causes: ['educational', 'community', 'social'],
      days: ['Monday', 'Wednesday', 'Friday', 'Sunday']
    },
    {
      username: 'james.martinez', email: 'james.martinez@email.com',
      firstName: 'James', lastName: 'Martinez',
      city: 'Houston', state: 'TX', zipCode: '77009',
      lat: 29.7850, lng: -95.3550,
      skills: ['Construction', 'Carpentry', 'Painting'],
      proficiencies: ['EXPERT', 'ADVANCED', 'INTERMEDIATE'],
      bio: 'Contractor volunteering skills for community projects',
      maxDistance: 45,
      causes: ['community', 'housing'],
      days: ['Saturday', 'Sunday']
    },
    {
      username: 'maria.rodriguez', email: 'maria.rodriguez@email.com',
      firstName: 'Maria', lastName: 'Rodriguez',
      city: 'Houston', state: 'TX', zipCode: '77010',
      lat: 29.7540, lng: -95.3630,
      skills: ['Nursing', 'Elderly Care', 'First Aid/CPR'],
      proficiencies: ['EXPERT', 'ADVANCED', 'EXPERT'],
      bio: 'Registered nurse passionate about senior care',
      maxDistance: 30,
      causes: ['healthcare', 'elderly'],
      days: ['Tuesday', 'Thursday', 'Saturday']
    },
    {
      username: 'robert.lee', email: 'robert.lee@email.com',
      firstName: 'Robert', lastName: 'Lee',
      city: 'Houston', state: 'TX', zipCode: '77011',
      lat: 29.7420, lng: -95.3200,
      skills: ['Sports Coaching', 'Teaching', 'Youth Mentoring'],
      proficiencies: ['ADVANCED', 'INTERMEDIATE', 'ADVANCED'],
      bio: 'Former athlete coaching youth sports programs',
      maxDistance: 35,
      causes: ['sports', 'youth', 'educational'],
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday']
    },
    {
      username: 'jennifer.white', email: 'jennifer.white@email.com',
      firstName: 'Jennifer', lastName: 'White',
      city: 'Houston', state: 'TX', zipCode: '77012',
      lat: 29.7100, lng: -95.2950,
      skills: ['Animal Care', 'Gardening', 'Environmental'],
      proficiencies: ['EXPERT', 'ADVANCED', 'INTERMEDIATE'],
      bio: 'Veterinary technician and nature enthusiast',
      maxDistance: 40,
      causes: ['animal', 'environmental'],
      days: ['Sunday']
    },
    // Austin volunteers (165 miles away)
    {
      username: 'chris.austin', email: 'chris.austin@email.com',
      firstName: 'Chris', lastName: 'Austin',
      city: 'Austin', state: 'TX', zipCode: '78701',
      lat: 30.2672, lng: -97.7431,
      skills: ['Web Development', 'Social Media', 'Graphic Design'],
      proficiencies: ['EXPERT', 'ADVANCED', 'INTERMEDIATE'],
      bio: 'Tech professional helping nonprofits go digital',
      maxDistance: 180,
      causes: ['technology', 'community'],
      days: ['Saturday', 'Sunday']
    },
    {
      username: 'amanda.taylor', email: 'amanda.taylor@email.com',
      firstName: 'Amanda', lastName: 'Taylor',
      city: 'Austin', state: 'TX', zipCode: '78702',
      lat: 30.2635, lng: -97.7239,
      skills: ['Writing', 'Public Speaking', 'Fundraising'],
      proficiencies: ['EXPERT', 'ADVANCED', 'INTERMEDIATE'],
      bio: 'Communications specialist supporting causes',
      maxDistance: 200,
      causes: ['communication', 'fundraising'],
      days: ['Friday', 'Saturday']
    },
    // Dallas volunteers (240 miles away)
    {
      username: 'michael.dallas', email: 'michael.dallas@email.com',
      firstName: 'Michael', lastName: 'Dallas',
      city: 'Dallas', state: 'TX', zipCode: '75201',
      lat: 32.7767, lng: -96.7970,
      skills: ['Event Planning', 'Fundraising', 'Public Speaking'],
      proficiencies: ['ADVANCED', 'ADVANCED', 'INTERMEDIATE'],
      bio: 'Event coordinator for large-scale charity events',
      maxDistance: 260,
      causes: ['fundraising', 'community'],
      days: ['Saturday', 'Sunday']
    },
    {
      username: 'jessica.moore', email: 'jessica.moore@email.com',
      firstName: 'Jessica', lastName: 'Moore',
      city: 'Dallas', state: 'TX', zipCode: '75202',
      lat: 32.7817, lng: -96.7984,
      skills: ['Data Entry', 'Customer Service'],
      proficiencies: ['INTERMEDIATE', 'ADVANCED'],
      bio: 'Administrative professional with flexible schedule',
      maxDistance: 250,
      causes: ['administrative', 'community'],
      days: ['Monday', 'Tuesday', 'Wednesday']
    },
    // California volunteers (far away - for testing distance)
    {
      username: 'alex.california', email: 'alex.california@email.com',
      firstName: 'Alex', lastName: 'California',
      city: 'Los Angeles', state: 'CA', zipCode: '90001',
      lat: 34.0522, lng: -118.2437,
      skills: ['Photography', 'Social Media', 'Graphic Design'],
      proficiencies: ['EXPERT', 'EXPERT', 'ADVANCED'],
      bio: 'Creative director traveling for volunteer projects',
      maxDistance: 1600,
      causes: ['creative', 'photography'],
      days: ['Saturday', 'Sunday']
    },
    // New volunteer with no skills (for testing low match scores)
    {
      username: 'newbie.volunteer', email: 'newbie.volunteer@email.com',
      firstName: 'New', lastName: 'Volunteer',
      city: 'Houston', state: 'TX', zipCode: '77013',
      lat: 29.7250, lng: -95.2780,
      skills: [],
      proficiencies: [],
      bio: 'Just starting my volunteer journey!',
      maxDistance: 15,
      causes: ['community'],
      days: ['Saturday']
    }
  ];

  for (const vol of volunteers) {
    const user = await prisma.user.upsert({
      where: { email: vol.email },
      update: {},
      create: {
        username: vol.username,
        email: vol.email,
        password: hashPassword('Volunteer123!'),
        role: 'VOLUNTEER',
        verified: true
      }
    });

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: vol.firstName,
        lastName: vol.lastName,
        phone: `713-555-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `${Math.floor(Math.random() * 9000) + 1000} Main St`,
        city: vol.city,
        state: vol.state,
        zipCode: vol.zipCode,
        latitude: vol.lat,
        longitude: vol.lng,
        bio: vol.bio,
        maxTravelDistance: vol.maxDistance,
        preferredCauses: vol.causes,
        preferredDays: vol.days,
        preferredTimeSlots: ['morning', 'afternoon'],
        profileCompleteness: 85 + Math.floor(Math.random() * 15)
      }
    });

    // Add skills
    for (let i = 0; i < vol.skills.length; i++) {
      const skillName = vol.skills[i];
      if (createdSkills[skillName]) {
        await prisma.volunteerSkill.upsert({
          where: {
            profileId_skillId: {
              profileId: profile.id,
              skillId: createdSkills[skillName].id
            }
          },
          update: {},
          create: {
            profileId: profile.id,
            skillId: createdSkills[skillName].id,
            proficiency: vol.proficiencies[i] || 'INTERMEDIATE',
            yearsOfExp: Math.floor(Math.random() * 10)
          }
        });
      }
    }

    // Add availability
    for (const day of vol.days) {
      await prisma.availability.create({
        data: {
          profileId: profile.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true
        }
      }).catch(() => {}); // Skip duplicates
    }
  }

  console.log(`✅ Seeded admin + ${volunteers.length} volunteers with profiles and skills`);

  // ========================================
  // 4. EVENTS
  // ========================================
  console.log('📅 Seeding events...');

  const eventsData = [
    {
      id: 'event-food-drive-001',
      title: 'Community Food Drive',
      description: 'Help organize and distribute food to families in need. We need volunteers to sort donations, pack bags, and distribute to local families.',
      category: 'food',
      urgency: 'HIGH',
      status: 'PUBLISHED',
      daysFromNow: 7,
      duration: 8,
      address: '456 Community Center Drive',
      city: 'Houston', state: 'TX', zip: '77002',
      lat: 29.7520, lng: -95.3720,
      maxVol: 20,
      skills: [
        { skill: 'Cooking', level: 'BEGINNER', required: true },
        { skill: 'Event Planning', level: 'INTERMEDIATE', required: false }
      ]
    },
    {
      id: 'event-park-cleanup-001',
      title: 'Memorial Park Cleanup',
      description: 'Join us for a community park cleanup to beautify our local green spaces. Tools provided.',
      category: 'environmental',
      urgency: 'MEDIUM',
      status: 'PUBLISHED',
      daysFromNow: 9,
      duration: 6,
      address: '789 Memorial Park Drive',
      city: 'Houston', state: 'TX', zip: '77007',
      lat: 29.7633, lng: -95.3903,
      maxVol: 30,
      skills: [
        { skill: 'Gardening', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'event-health-fair-001',
      title: 'Community Health Fair',
      description: 'Free health screenings and wellness education for the community. Need volunteers with healthcare background.',
      category: 'healthcare',
      urgency: 'CRITICAL',
      status: 'PUBLISHED',
      daysFromNow: 30,
      duration: 6,
      address: '123 Medical Plaza',
      city: 'Houston', state: 'TX', zip: '77004',
      lat: 29.7300, lng: -95.3400,
      maxVol: 15,
      skills: [
        { skill: 'First Aid/CPR', level: 'ADVANCED', required: true },
        { skill: 'Nursing', level: 'INTERMEDIATE', required: false },
        { skill: 'Customer Service', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'event-tutoring-001',
      title: 'After School Tutoring Program',
      description: 'Help students with homework and provide educational support. Looking for patient, encouraging volunteers.',
      category: 'education',
      urgency: 'MEDIUM',
      status: 'PUBLISHED',
      daysFromNow: 5,
      duration: 4,
      address: '321 School Road',
      city: 'Houston', state: 'TX', zip: '77008',
      lat: 29.7810, lng: -95.4030,
      maxVol: 10,
      skills: [
        { skill: 'Tutoring', level: 'INTERMEDIATE', required: true },
        { skill: 'Teaching', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'event-construction-001',
      title: 'Habitat for Humanity Build Day',
      description: 'Help build affordable housing for families in need. Construction experience helpful but not required.',
      category: 'housing',
      urgency: 'HIGH',
      status: 'PUBLISHED',
      daysFromNow: 14,
      duration: 8,
      address: '567 Build Street',
      city: 'Houston', state: 'TX', zip: '77009',
      lat: 29.7850, lng: -95.3550,
      maxVol: 25,
      skills: [
        { skill: 'Construction', level: 'INTERMEDIATE', required: false },
        { skill: 'Carpentry', level: 'BEGINNER', required: false },
        { skill: 'Painting', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'event-fundraiser-001',
      title: 'Charity Gala Planning',
      description: 'Help organize our annual charity gala. Need event planners, decorators, and coordinators.',
      category: 'fundraising',
      urgency: 'MEDIUM',
      status: 'PUBLISHED',
      daysFromNow: 45,
      duration: 10,
      address: '890 Grand Avenue',
      city: 'Houston', state: 'TX', zip: '77005',
      lat: 29.7180, lng: -95.4020,
      maxVol: 12,
      skills: [
        { skill: 'Event Planning', level: 'ADVANCED', required: true },
        { skill: 'Fundraising', level: 'INTERMEDIATE', required: true }
      ]
    },
    {
      id: 'event-animal-shelter-001',
      title: 'Animal Shelter Weekend',
      description: 'Help care for rescued animals. Tasks include feeding, walking, cleaning, and socializing animals.',
      category: 'animal',
      urgency: 'LOW',
      status: 'PUBLISHED',
      daysFromNow: 12,
      duration: 6,
      address: '234 Paws Lane',
      city: 'Houston', state: 'TX', zip: '77012',
      lat: 29.7100, lng: -95.2950,
      maxVol: 20,
      skills: [
        { skill: 'Animal Care', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'event-soup-kitchen-001',
      title: 'Community Soup Kitchen',
      description: 'Prepare and serve meals to those experiencing homelessness. Food service experience helpful.',
      category: 'food',
      urgency: 'MEDIUM',
      status: 'PUBLISHED',
      daysFromNow: 3,
      duration: 5,
      address: '456 Charity Street',
      city: 'Houston', state: 'TX', zip: '77003',
      lat: 29.7520, lng: -95.3720,
      maxVol: 15,
      skills: [
        { skill: 'Cooking', level: 'BEGINNER', required: false },
        { skill: 'Food Service', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'event-sports-camp-001',
      title: 'Youth Sports Camp',
      description: 'Coach kids in various sports activities. Need enthusiastic volunteers who love working with children.',
      category: 'sports',
      urgency: 'MEDIUM',
      status: 'PUBLISHED',
      daysFromNow: 21,
      duration: 8,
      address: '789 Sports Complex',
      city: 'Houston', state: 'TX', zip: '77011',
      lat: 29.7420, lng: -95.3200,
      maxVol: 18,
      skills: [
        { skill: 'Sports Coaching', level: 'INTERMEDIATE', required: true },
        { skill: 'Childcare', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'event-photography-001',
      title: 'Nonprofit Photography Day',
      description: 'Professional headshots and photos for local nonprofits. Photographers and assistants needed.',
      category: 'creative',
      urgency: 'LOW',
      status: 'PUBLISHED',
      daysFromNow: 28,
      duration: 6,
      address: '123 Studio Avenue',
      city: 'Houston', state: 'TX', zip: '77006',
      lat: 29.7490, lng: -95.3860,
      maxVol: 8,
      skills: [
        { skill: 'Photography', level: 'ADVANCED', required: true },
        { skill: 'Graphic Design', level: 'INTERMEDIATE', required: false }
      ]
    },
    {
      id: 'event-senior-center-001',
      title: 'Senior Center Activity Day',
      description: 'Spend time with seniors through games, crafts, and conversation. Bring joy to their day!',
      category: 'elderly',
      urgency: 'LOW',
      status: 'PUBLISHED',
      daysFromNow: 10,
      duration: 4,
      address: '345 Golden Years Drive',
      city: 'Houston', state: 'TX', zip: '77010',
      lat: 29.7540, lng: -95.3630,
      maxVol: 12,
      skills: [
        { skill: 'Elderly Care', level: 'BEGINNER', required: false },
        { skill: 'Customer Service', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'event-tech-training-001',
      title: 'Tech Skills Workshop for Seniors',
      description: 'Teach seniors basic computer and smartphone skills. Patient, tech-savvy volunteers needed.',
      category: 'technology',
      urgency: 'MEDIUM',
      status: 'PUBLISHED',
      daysFromNow: 18,
      duration: 4,
      address: '567 Digital Lane',
      city: 'Houston', state: 'TX', zip: '77007',
      lat: 29.7633, lng: -95.3903,
      maxVol: 10,
      skills: [
        { skill: 'Web Development', level: 'BEGINNER', required: false },
        { skill: 'Teaching', level: 'INTERMEDIATE', required: true }
      ]
    }
  ];

  for (const evt of eventsData) {
    const startDate = randomFutureDate(evt.daysFromNow);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + evt.duration);

    const event = await prisma.event.upsert({
      where: { id: evt.id },
      update: {},
      create: {
        id: evt.id,
        title: evt.title,
        description: evt.description,
        category: evt.category,
        urgencyLevel: evt.urgency,
        status: evt.status,
        startDate,
        endDate,
        address: evt.address,
        city: evt.city,
        state: evt.state,
        zipCode: evt.zip,
        latitude: evt.lat,
        longitude: evt.lng,
        maxVolunteers: evt.maxVol,
        currentVolunteers: 0,
        createdBy: admin.id
      }
    });

    // Add required skills
    for (const skillReq of evt.skills) {
      if (createdSkills[skillReq.skill]) {
        await prisma.eventRequirement.upsert({
          where: {
            eventId_skillId: {
              eventId: event.id,
              skillId: createdSkills[skillReq.skill].id
            }
          },
          update: {},
          create: {
            eventId: event.id,
            skillId: createdSkills[skillReq.skill].id,
            minLevel: skillReq.level,
            isRequired: skillReq.required
          }
        });
      }
    }
  }

  console.log(`✅ Seeded ${eventsData.length} events with requirements`);

  console.log('\n✨ Large database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   States: ${states.length}`);
  console.log(`   Skills: ${skillsData.length}`);
  console.log(`   Users: 1 admin + ${volunteers.length} volunteers`);
  console.log(`   Events: ${eventsData.length}`);
  console.log('\n📝 Test Credentials:');
  console.log('   Admin:     admin@jacsshiftpilot.com / Admin123!');
  console.log('   Volunteers: [name]@email.com / Volunteer123!');
  console.log('   Examples:  john.smith@email.com');
  console.log('              sarah.jones@email.com');
  console.log('              mike.brown@email.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
