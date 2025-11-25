/**
 * Comprehensive Demo Seed Script
 * Creates complete test data with past and future events, full volunteer history, and diverse users
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper to create consistent password hashes
const hashPassword = (password) => bcrypt.hashSync(password, 10);

// Helper to generate random date in the past
const randomPastDate = (daysAgo, hourStart = 9, hourEnd = 17) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const hour = Math.floor(Math.random() * (hourEnd - hourStart) + hourStart);
  date.setHours(hour, 0, 0, 0);
  return date;
};

// Helper to generate random future date
const randomFutureDate = (daysFromNow, hourStart = 9, hourEnd = 17) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const hour = Math.floor(Math.random() * (hourEnd - hourStart) + hourStart);
  date.setHours(hour, 0, 0, 0);
  return date;
};

async function main() {
  console.log('🌱 Starting comprehensive demo database seed...');

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
    { code: 'WA', name: 'Washington', abbreviation: 'WA' },
    { code: 'GA', name: 'Georgia', abbreviation: 'GA' },
    { code: 'CO', name: 'Colorado', abbreviation: 'CO' },
    { code: 'AZ', name: 'Arizona', abbreviation: 'AZ' }
  ];

  for (const state of states) {
    await prisma.state.create({ data: state });
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
    const created = await prisma.skill.create({ data: skill });
    createdSkills[skill.name] = created;
  }
  console.log(`✅ Seeded ${skillsData.length} skills`);

  // ========================================
  // 3. USERS & PROFILES
  // ========================================
  console.log('👥 Seeding users and profiles...');

  // Admin user
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@jacsshiftpilot.com',
      password: hashPassword('Admin123!'),
      role: 'ADMIN',
      verified: true,
      createdAt: randomPastDate(365),
      updatedAt: new Date()
    }
  });

  await prisma.profile.create({
    data: {
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
      preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      preferredTimeSlots: ['morning', 'afternoon'],
      profileCompleteness: 100,
      lastActive: new Date()
    }
  });

  // Volunteer data with diverse locations
  const volunteers = [
    // Houston volunteers (local)
    {
      username: 'john.smith', email: 'john.smith@email.com',
      firstName: 'John', lastName: 'Smith',
      city: 'Houston', state: 'TX', zipCode: '77003',
      lat: 29.7520, lng: -95.3720,
      skills: ['First Aid/CPR', 'Customer Service', 'Teaching'],
      proficiencies: ['EXPERT', 'ADVANCED', 'INTERMEDIATE'],
      yearsExp: [5, 3, 2],
      certified: [true, false, false],
      bio: 'Healthcare professional passionate about community service. 5+ years emergency response experience.',
      maxDistance: 25,
      causes: ['healthcare', 'community', 'education'],
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      joinedDaysAgo: 180
    },
    {
      username: 'sarah.jones', email: 'sarah.jones@email.com',
      firstName: 'Sarah', lastName: 'Jones',
      city: 'Houston', state: 'TX', zipCode: '77005',
      lat: 29.7180, lng: -95.4020,
      skills: ['Event Planning', 'Public Speaking', 'Fundraising'],
      proficiencies: ['EXPERT', 'ADVANCED', 'ADVANCED'],
      yearsExp: [7, 5, 6],
      certified: [false, false, false],
      bio: 'Professional event planner dedicated to making a difference. Organized 50+ charity events.',
      maxDistance: 30,
      causes: ['community', 'educational', 'fundraising'],
      days: ['Friday', 'Saturday', 'Sunday'],
      joinedDaysAgo: 240
    },
    {
      username: 'mike.brown', email: 'mike.brown@email.com',
      firstName: 'Mike', lastName: 'Brown',
      city: 'Houston', state: 'TX', zipCode: '77006',
      lat: 29.7490, lng: -95.3860,
      skills: ['Cooking', 'Construction', 'Gardening', 'Food Service'],
      proficiencies: ['ADVANCED', 'INTERMEDIATE', 'ADVANCED', 'INTERMEDIATE'],
      yearsExp: [4, 2, 5, 3],
      certified: [true, false, false, true],
      bio: 'Jack of all trades, eager to help wherever needed. Former chef and handyman.',
      maxDistance: 40,
      causes: ['food', 'environmental', 'community'],
      days: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
      joinedDaysAgo: 300
    },
    {
      username: 'emily.davis', email: 'emily.davis@email.com',
      firstName: 'Emily', lastName: 'Davis',
      city: 'Houston', state: 'TX', zipCode: '77007',
      lat: 29.7633, lng: -95.3903,
      skills: ['Teaching', 'Tutoring', 'Childcare', 'Public Speaking'],
      proficiencies: ['EXPERT', 'EXPERT', 'ADVANCED', 'INTERMEDIATE'],
      yearsExp: [10, 8, 6, 4],
      certified: [true, true, true, false],
      bio: 'Educator with 10+ years experience, loves working with kids. Certified teacher and tutor.',
      maxDistance: 20,
      causes: ['educational', 'community', 'youth'],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      joinedDaysAgo: 400
    },
    {
      username: 'david.wilson', email: 'david.wilson@email.com',
      firstName: 'David', lastName: 'Wilson',
      city: 'Houston', state: 'TX', zipCode: '77004',
      lat: 29.7300, lng: -95.3400,
      skills: ['Photography', 'Graphic Design', 'Social Media', 'Web Development'],
      proficiencies: ['EXPERT', 'ADVANCED', 'ADVANCED', 'INTERMEDIATE'],
      yearsExp: [8, 6, 5, 3],
      certified: [false, false, false, false],
      bio: 'Creative professional helping nonprofits with marketing and branding.',
      maxDistance: 35,
      causes: ['community', 'creative', 'technology'],
      days: ['Friday', 'Saturday', 'Sunday'],
      joinedDaysAgo: 150
    },
    {
      username: 'lisa.garcia', email: 'lisa.garcia@email.com',
      firstName: 'Lisa', lastName: 'Garcia',
      city: 'Houston', state: 'TX', zipCode: '77008',
      lat: 29.7810, lng: -95.4030,
      skills: ['Translation', 'Customer Service', 'Teaching', 'Public Speaking'],
      proficiencies: ['EXPERT', 'ADVANCED', 'ADVANCED', 'INTERMEDIATE'],
      yearsExp: [10, 5, 6, 3],
      certified: [true, false, true, false],
      bio: 'Bilingual educator (Spanish/English) helping bridge language barriers in the community.',
      maxDistance: 25,
      causes: ['educational', 'community', 'social'],
      days: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      joinedDaysAgo: 220
    },
    {
      username: 'james.martinez', email: 'james.martinez@email.com',
      firstName: 'James', lastName: 'Martinez',
      city: 'Houston', state: 'TX', zipCode: '77009',
      lat: 29.7850, lng: -95.3550,
      skills: ['Construction', 'Carpentry', 'Painting'],
      proficiencies: ['EXPERT', 'EXPERT', 'ADVANCED'],
      yearsExp: [15, 12, 8],
      certified: [true, true, false],
      bio: 'Licensed contractor volunteering skills for community housing projects.',
      maxDistance: 45,
      causes: ['community', 'housing'],
      days: ['Saturday', 'Sunday'],
      joinedDaysAgo: 350
    },
    {
      username: 'maria.rodriguez', email: 'maria.rodriguez@email.com',
      firstName: 'Maria', lastName: 'Rodriguez',
      city: 'Houston', state: 'TX', zipCode: '77010',
      lat: 29.7540, lng: -95.3630,
      skills: ['Nursing', 'Elderly Care', 'First Aid/CPR'],
      proficiencies: ['EXPERT', 'EXPERT', 'EXPERT'],
      yearsExp: [12, 10, 12],
      certified: [true, true, true],
      bio: 'Registered nurse with geriatric specialization, passionate about senior care.',
      maxDistance: 30,
      causes: ['healthcare', 'elderly'],
      days: ['Tuesday', 'Thursday', 'Saturday'],
      joinedDaysAgo: 450
    },
    {
      username: 'robert.lee', email: 'robert.lee@email.com',
      firstName: 'Robert', lastName: 'Lee',
      city: 'Houston', state: 'TX', zipCode: '77011',
      lat: 29.7420, lng: -95.3200,
      skills: ['Sports Coaching', 'Teaching', 'Childcare'],
      proficiencies: ['EXPERT', 'ADVANCED', 'ADVANCED'],
      yearsExp: [8, 5, 6],
      certified: [true, true, false],
      bio: 'Former college athlete coaching youth sports programs. Certified sports trainer.',
      maxDistance: 35,
      causes: ['sports', 'youth', 'educational'],
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      joinedDaysAgo: 280
    },
    {
      username: 'jennifer.white', email: 'jennifer.white@email.com',
      firstName: 'Jennifer', lastName: 'White',
      city: 'Houston', state: 'TX', zipCode: '77012',
      lat: 29.7100, lng: -95.2950,
      skills: ['Animal Care', 'Gardening'],
      proficiencies: ['EXPERT', 'ADVANCED'],
      yearsExp: [10, 7],
      certified: [true, false],
      bio: 'Veterinary technician and nature enthusiast. Running animal rescue for 5 years.',
      maxDistance: 40,
      causes: ['animal', 'environmental'],
      days: ['Saturday', 'Sunday'],
      joinedDaysAgo: 200
    },
    // Austin volunteers (165 miles away)
    {
      username: 'chris.austin', email: 'chris.austin@email.com',
      firstName: 'Chris', lastName: 'Austin',
      city: 'Austin', state: 'TX', zipCode: '78701',
      lat: 30.2672, lng: -97.7431,
      skills: ['Web Development', 'Social Media', 'Graphic Design'],
      proficiencies: ['EXPERT', 'ADVANCED', 'INTERMEDIATE'],
      yearsExp: [9, 6, 4],
      certified: [false, false, false],
      bio: 'Senior tech professional helping nonprofits build digital presence. Full-stack developer.',
      maxDistance: 200,
      causes: ['technology', 'community'],
      days: ['Saturday', 'Sunday'],
      joinedDaysAgo: 120
    },
    {
      username: 'amanda.taylor', email: 'amanda.taylor@email.com',
      firstName: 'Amanda', lastName: 'Taylor',
      city: 'Austin', state: 'TX', zipCode: '78702',
      lat: 30.2635, lng: -97.7239,
      skills: ['Writing', 'Public Speaking', 'Fundraising', 'Social Media'],
      proficiencies: ['EXPERT', 'ADVANCED', 'ADVANCED', 'INTERMEDIATE'],
      yearsExp: [8, 6, 5, 4],
      certified: [false, false, false, false],
      bio: 'Communications director supporting nonprofit causes. Published author.',
      maxDistance: 250,
      causes: ['communication', 'fundraising', 'educational'],
      days: ['Friday', 'Saturday', 'Sunday'],
      joinedDaysAgo: 160
    },
    // Dallas volunteers (240 miles away)
    {
      username: 'michael.dallas', email: 'michael.dallas@email.com',
      firstName: 'Michael', lastName: 'Dallas',
      city: 'Dallas', state: 'TX', zipCode: '75201',
      lat: 32.7767, lng: -96.7970,
      skills: ['Event Planning', 'Fundraising', 'Public Speaking'],
      proficiencies: ['EXPERT', 'EXPERT', 'ADVANCED'],
      yearsExp: [10, 9, 7],
      certified: [false, false, false],
      bio: 'Professional event coordinator specializing in large-scale charity galas and fundraisers.',
      maxDistance: 270,
      causes: ['fundraising', 'community'],
      days: ['Saturday', 'Sunday'],
      joinedDaysAgo: 190
    },
    {
      username: 'jessica.moore', email: 'jessica.moore@email.com',
      firstName: 'Jessica', lastName: 'Moore',
      city: 'Dallas', state: 'TX', zipCode: '75202',
      lat: 32.7817, lng: -96.7984,
      skills: ['Data Entry', 'Customer Service'],
      proficiencies: ['ADVANCED', 'ADVANCED'],
      yearsExp: [5, 6],
      certified: [false, false],
      bio: 'Administrative professional with flexible schedule, eager to help with office work.',
      maxDistance: 250,
      causes: ['administrative', 'community'],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Saturday'],
      joinedDaysAgo: 80
    },
    // San Antonio volunteers (200 miles away)
    {
      username: 'carlos.sanchez', email: 'carlos.sanchez@email.com',
      firstName: 'Carlos', lastName: 'Sanchez',
      city: 'San Antonio', state: 'TX', zipCode: '78205',
      lat: 29.4241, lng: -98.4936,
      skills: ['Construction', 'Painting', 'Carpentry'],
      proficiencies: ['ADVANCED', 'ADVANCED', 'INTERMEDIATE'],
      yearsExp: [7, 6, 4],
      certified: [true, false, false],
      bio: 'Construction foreman helping build homes for underserved communities.',
      maxDistance: 220,
      causes: ['housing', 'community'],
      days: ['Saturday', 'Sunday'],
      joinedDaysAgo: 110
    },
    // California volunteers (far away - for testing distance filtering)
    {
      username: 'alex.california', email: 'alex.california@email.com',
      firstName: 'Alex', lastName: 'California',
      city: 'Los Angeles', state: 'CA', zipCode: '90001',
      lat: 34.0522, lng: -118.2437,
      skills: ['Photography', 'Social Media', 'Graphic Design', 'Web Development'],
      proficiencies: ['EXPERT', 'EXPERT', 'EXPERT', 'ADVANCED'],
      yearsExp: [12, 10, 11, 6],
      certified: [false, false, false, false],
      bio: 'Award-winning creative director traveling nationwide for special volunteer projects.',
      maxDistance: 1600,
      causes: ['creative', 'photography', 'technology'],
      days: ['Saturday', 'Sunday'],
      joinedDaysAgo: 60
    },
    // New York volunteer (very far - testing edge cases)
    {
      username: 'sophia.newman', email: 'sophia.newman@email.com',
      firstName: 'Sophia', lastName: 'Newman',
      city: 'New York', state: 'NY', zipCode: '10001',
      lat: 40.7128, lng: -74.0060,
      skills: ['Fundraising', 'Event Planning', 'Public Speaking', 'Writing'],
      proficiencies: ['EXPERT', 'EXPERT', 'EXPERT', 'ADVANCED'],
      yearsExp: [15, 12, 10, 8],
      certified: [false, false, false, false],
      bio: 'Former Fortune 500 executive now full-time philanthropist. Visits Houston quarterly.',
      maxDistance: 2000,
      causes: ['fundraising', 'community', 'educational'],
      days: ['Friday', 'Saturday', 'Sunday'],
      joinedDaysAgo: 30
    },
    // Volunteer with limited skills (for testing low match scores)
    {
      username: 'newbie.volunteer', email: 'newbie.volunteer@email.com',
      firstName: 'Alex', lastName: 'Newcomer',
      city: 'Houston', state: 'TX', zipCode: '77013',
      lat: 29.7250, lng: -95.2780,
      skills: ['Customer Service'],
      proficiencies: ['BEGINNER'],
      yearsExp: [0],
      certified: [false],
      bio: 'Just starting my volunteer journey! Eager to learn and help in any way I can.',
      maxDistance: 15,
      causes: ['community'],
      days: ['Saturday'],
      joinedDaysAgo: 7
    },
    // Volunteer with conflicting schedule (for testing availability)
    {
      username: 'busy.professional', email: 'busy.professional@email.com',
      firstName: 'Rachel', lastName: 'Busy',
      city: 'Houston', state: 'TX', zipCode: '77014',
      lat: 29.9500, lng: -95.5200,
      skills: ['Data Entry', 'Event Planning'],
      proficiencies: ['ADVANCED', 'INTERMEDIATE'],
      yearsExp: [6, 3],
      certified: [false, false],
      bio: 'Corporate professional with limited availability but strong commitment.',
      maxDistance: 20,
      causes: ['administrative', 'community'],
      days: ['Sunday'],
      joinedDaysAgo: 45
    }
  ];

  const createdVolunteers = [];
  for (const vol of volunteers) {
    const joinedDate = randomPastDate(vol.joinedDaysAgo);
    const user = await prisma.user.create({
      data: {
        username: vol.username,
        email: vol.email,
        password: hashPassword('Volunteer123!'),
        role: 'VOLUNTEER',
        verified: true,
        createdAt: joinedDate,
        updatedAt: new Date()
      }
    });

    const profile = await prisma.profile.create({
      data: {
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
        profileCompleteness: 85 + Math.floor(Math.random() * 15),
        lastActive: randomPastDate(Math.floor(Math.random() * 7)),
        createdAt: joinedDate,
        updatedAt: new Date()
      }
    });

    createdVolunteers.push({ user, profile, data: vol });

    // Add skills
    for (let i = 0; i < vol.skills.length; i++) {
      const skillName = vol.skills[i];
      if (createdSkills[skillName]) {
        await prisma.volunteerSkill.create({
          data: {
            profileId: profile.id,
            skillId: createdSkills[skillName].id,
            proficiency: vol.proficiencies[i],
            yearsOfExp: vol.yearsExp[i],
            certified: vol.certified[i]
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
      });
    }
  }

  console.log(`✅ Seeded admin + ${volunteers.length} volunteers with profiles, skills, and availability`);

  // ========================================
  // 4. PAST EVENTS (COMPLETED)
  // ========================================
  console.log('📅 Seeding past/completed events...');

  const pastEventsData = [
    {
      id: 'past-food-drive-001',
      title: 'Thanksgiving Food Drive',
      description: 'Major food drive for Thanksgiving. Distributed meals to 500+ families in need.',
      category: 'food',
      urgency: 'HIGH',
      status: 'COMPLETED',
      daysAgo: 45,
      duration: 8,
      address: '456 Community Center Drive',
      city: 'Houston', state: 'TX', zip: '77002',
      lat: 29.7520, lng: -95.3720,
      maxVol: 20,
      currentVol: 18,
      skills: [
        { skill: 'Cooking', level: 'INTERMEDIATE', required: true },
        { skill: 'Food Service', level: 'BEGINNER', required: false },
        { skill: 'Event Planning', level: 'INTERMEDIATE', required: false }
      ]
    },
    {
      id: 'past-health-fair-001',
      title: 'Fall Community Health Fair',
      description: 'Free health screenings and wellness education. Served 300+ community members.',
      category: 'healthcare',
      urgency: 'CRITICAL',
      status: 'COMPLETED',
      daysAgo: 60,
      duration: 6,
      address: '123 Medical Plaza',
      city: 'Houston', state: 'TX', zip: '77004',
      lat: 29.7300, lng: -95.3400,
      maxVol: 15,
      currentVol: 12,
      skills: [
        { skill: 'First Aid/CPR', level: 'ADVANCED', required: true },
        { skill: 'Nursing', level: 'INTERMEDIATE', required: true },
        { skill: 'Customer Service', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'past-park-cleanup-001',
      title: 'Summer Park Beautification',
      description: 'Major park cleanup and landscaping project. Planted 50 trees and cleaned 5 acres.',
      category: 'environmental',
      urgency: 'MEDIUM',
      status: 'COMPLETED',
      daysAgo: 90,
      duration: 6,
      address: '789 Memorial Park Drive',
      city: 'Houston', state: 'TX', zip: '77007',
      lat: 29.7633, lng: -95.3903,
      maxVol: 30,
      currentVol: 28,
      skills: [
        { skill: 'Gardening', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'past-tutoring-001',
      title: 'Back to School Tutoring Program',
      description: 'Intensive tutoring program helping 40 students prepare for standardized tests.',
      category: 'education',
      urgency: 'MEDIUM',
      status: 'COMPLETED',
      daysAgo: 120,
      duration: 4,
      address: '321 School Road',
      city: 'Houston', state: 'TX', zip: '77008',
      lat: 29.7810, lng: -95.4030,
      maxVol: 12,
      currentVol: 10,
      skills: [
        { skill: 'Tutoring', level: 'INTERMEDIATE', required: true },
        { skill: 'Teaching', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'past-construction-001',
      title: 'Habitat Home Build - Johnson Family',
      description: 'Successfully built a 3-bedroom home for the Johnson family. Project completed on schedule.',
      category: 'housing',
      urgency: 'HIGH',
      status: 'COMPLETED',
      daysAgo: 150,
      duration: 8,
      address: '567 Build Street',
      city: 'Houston', state: 'TX', zip: '77009',
      lat: 29.7850, lng: -95.3550,
      maxVol: 25,
      currentVol: 22,
      skills: [
        { skill: 'Construction', level: 'INTERMEDIATE', required: true },
        { skill: 'Carpentry', level: 'BEGINNER', required: false },
        { skill: 'Painting', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'past-animal-shelter-001',
      title: 'Animal Shelter Adoption Day',
      description: 'Major adoption event! 35 animals found forever homes. Amazing success.',
      category: 'animal',
      urgency: 'MEDIUM',
      status: 'COMPLETED',
      daysAgo: 30,
      duration: 8,
      address: '234 Paws Lane',
      city: 'Houston', state: 'TX', zip: '77012',
      lat: 29.7100, lng: -95.2950,
      maxVol: 20,
      currentVol: 16,
      skills: [
        { skill: 'Animal Care', level: 'BEGINNER', required: false },
        { skill: 'Customer Service', level: 'BEGINNER', required: false }
      ]
    },
    {
      id: 'past-fundraiser-001',
      title: 'Annual Charity Gala 2024',
      description: 'Record-breaking gala raised $250,000 for local charities. Incredible volunteer support!',
      category: 'fundraising',
      urgency: 'HIGH',
      status: 'COMPLETED',
      daysAgo: 75,
      duration: 10,
      address: '890 Grand Avenue',
      city: 'Houston', state: 'TX', zip: '77005',
      lat: 29.7180, lng: -95.4020,
      maxVol: 15,
      currentVol: 14,
      skills: [
        { skill: 'Event Planning', level: 'ADVANCED', required: true },
        { skill: 'Fundraising', level: 'INTERMEDIATE', required: true },
        { skill: 'Customer Service', level: 'BEGINNER', required: false }
      ]
    }
  ];

  const createdPastEvents = [];
  for (const evt of pastEventsData) {
    const startDate = randomPastDate(evt.daysAgo, 9, 10);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + evt.duration);

    const event = await prisma.event.create({
      data: {
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
        currentVolunteers: evt.currentVol,
        createdBy: admin.id,
        createdAt: randomPastDate(evt.daysAgo + 20),
        updatedAt: randomPastDate(evt.daysAgo - 1)
      }
    });

    createdPastEvents.push({ event, data: evt, startDate, endDate });

    // Add required skills
    for (const skillReq of evt.skills) {
      if (createdSkills[skillReq.skill]) {
        await prisma.eventRequirement.create({
          data: {
            eventId: event.id,
            skillId: createdSkills[skillReq.skill].id,
            minLevel: skillReq.level,
            isRequired: skillReq.required
          }
        });
      }
    }
  }

  console.log(`✅ Seeded ${pastEventsData.length} past/completed events`);

  // ========================================
  // 5. FUTURE EVENTS (UPCOMING/PUBLISHED)
  // ========================================
  console.log('📅 Seeding future/upcoming events...');

  const futureEventsData = [
    {
      id: 'future-food-drive-001',
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
      id: 'future-park-cleanup-001',
      title: 'Memorial Park Spring Cleanup',
      description: 'Join us for a community park cleanup to beautify our local green spaces. Tools and refreshments provided.',
      category: 'environmental',
      urgency: 'MEDIUM',
      status: 'PUBLISHED',
      daysFromNow: 10,
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
      id: 'future-health-fair-001',
      title: 'Spring Community Health Fair',
      description: 'Free health screenings and wellness education for the community. Need volunteers with healthcare background.',
      category: 'healthcare',
      urgency: 'CRITICAL',
      status: 'PUBLISHED',
      daysFromNow: 14,
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
      id: 'future-tutoring-001',
      title: 'After School Tutoring - Spring Session',
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
      id: 'future-construction-001',
      title: 'Habitat for Humanity - Martinez Home',
      description: 'Help build affordable housing for the Martinez family. Construction experience helpful but not required.',
      category: 'housing',
      urgency: 'HIGH',
      status: 'PUBLISHED',
      daysFromNow: 21,
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
      id: 'future-fundraiser-001',
      title: 'Spring Charity Gala Planning',
      description: 'Help organize our spring charity gala. Need event planners, decorators, and coordinators.',
      category: 'fundraising',
      urgency: 'HIGH',
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
      id: 'future-animal-shelter-001',
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
      id: 'future-soup-kitchen-001',
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
      id: 'future-sports-camp-001',
      title: 'Youth Sports Camp',
      description: 'Coach kids in various sports activities. Need enthusiastic volunteers who love working with children.',
      category: 'sports',
      urgency: 'MEDIUM',
      status: 'PUBLISHED',
      daysFromNow: 28,
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
      id: 'future-photography-001',
      title: 'Nonprofit Photography Day',
      description: 'Professional headshots and photos for local nonprofits. Photographers and assistants needed.',
      category: 'creative',
      urgency: 'LOW',
      status: 'PUBLISHED',
      daysFromNow: 35,
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
      id: 'future-senior-center-001',
      title: 'Senior Center Game Day',
      description: 'Spend time with seniors through games, crafts, and conversation. Bring joy to their day!',
      category: 'elderly',
      urgency: 'LOW',
      status: 'PUBLISHED',
      daysFromNow: 17,
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
      id: 'future-tech-training-001',
      title: 'Tech Skills Workshop for Seniors',
      description: 'Teach seniors basic computer and smartphone skills. Patient, tech-savvy volunteers needed.',
      category: 'technology',
      urgency: 'MEDIUM',
      status: 'PUBLISHED',
      daysFromNow: 24,
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

  const createdFutureEvents = [];
  for (const evt of futureEventsData) {
    const startDate = randomFutureDate(evt.daysFromNow);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + evt.duration);

    const event = await prisma.event.create({
      data: {
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
        createdBy: admin.id,
        createdAt: randomPastDate(Math.floor(Math.random() * 30) + 10),
        updatedAt: new Date()
      }
    });

    createdFutureEvents.push({ event, data: evt });

    // Add required skills
    for (const skillReq of evt.skills) {
      if (createdSkills[skillReq.skill]) {
        await prisma.eventRequirement.create({
          data: {
            eventId: event.id,
            skillId: createdSkills[skillReq.skill].id,
            minLevel: skillReq.level,
            isRequired: skillReq.required
          }
        });
      }
    }
  }

  console.log(`✅ Seeded ${futureEventsData.length} future/upcoming events`);

  // ========================================
  // 6. ASSIGNMENTS & VOLUNTEER HISTORY FOR PAST EVENTS
  // ========================================
  console.log('📝 Creating assignments and volunteer history for past events...');

  let assignmentCount = 0;
  let historyCount = 0;

  // Assignment mapping for past events
  const eventVolunteerMap = {
    'past-food-drive-001': [
      { vol: 'john.smith@email.com', status: 'COMPLETED', hours: 8, rating: 5, attendance: 'PRESENT' },
      { vol: 'sarah.jones@email.com', status: 'COMPLETED', hours: 8, rating: 5, attendance: 'PRESENT' },
      { vol: 'mike.brown@email.com', status: 'COMPLETED', hours: 7.5, rating: 4, attendance: 'PRESENT' },
      { vol: 'emily.davis@email.com', status: 'COMPLETED', hours: 8, rating: 5, attendance: 'PRESENT' },
      { vol: 'lisa.garcia@email.com', status: 'COMPLETED', hours: 6, rating: 4, attendance: 'LATE' },
    ],
    'past-health-fair-001': [
      { vol: 'john.smith@email.com', status: 'COMPLETED', hours: 6, rating: 5, attendance: 'PRESENT' },
      { vol: 'maria.rodriguez@email.com', status: 'COMPLETED', hours: 6, rating: 5, attendance: 'PRESENT' },
      { vol: 'emily.davis@email.com', status: 'NO_SHOW', hours: 0, rating: null, attendance: 'ABSENT' },
    ],
    'past-park-cleanup-001': [
      { vol: 'mike.brown@email.com', status: 'COMPLETED', hours: 6, rating: 5, attendance: 'PRESENT' },
      { vol: 'jennifer.white@email.com', status: 'COMPLETED', hours: 6, rating: 5, attendance: 'PRESENT' },
      { vol: 'robert.lee@email.com', status: 'COMPLETED', hours: 5.5, rating: 4, attendance: 'PRESENT' },
      { vol: 'david.wilson@email.com', status: 'COMPLETED', hours: 4, rating: 4, attendance: 'LATE' },
    ],
    'past-tutoring-001': [
      { vol: 'emily.davis@email.com', status: 'COMPLETED', hours: 4, rating: 5, attendance: 'PRESENT' },
      { vol: 'lisa.garcia@email.com', status: 'COMPLETED', hours: 4, rating: 5, attendance: 'PRESENT' },
      { vol: 'robert.lee@email.com', status: 'COMPLETED', hours: 4, rating: 4, attendance: 'PRESENT' },
    ],
    'past-construction-001': [
      { vol: 'james.martinez@email.com', status: 'COMPLETED', hours: 8, rating: 5, attendance: 'PRESENT' },
      { vol: 'mike.brown@email.com', status: 'COMPLETED', hours: 8, rating: 4, attendance: 'PRESENT' },
      { vol: 'carlos.sanchez@email.com', status: 'COMPLETED', hours: 8, rating: 5, attendance: 'PRESENT' },
    ],
    'past-animal-shelter-001': [
      { vol: 'jennifer.white@email.com', status: 'COMPLETED', hours: 8, rating: 5, attendance: 'PRESENT' },
      { vol: 'robert.lee@email.com', status: 'COMPLETED', hours: 7, rating: 4, attendance: 'PRESENT' },
    ],
    'past-fundraiser-001': [
      { vol: 'sarah.jones@email.com', status: 'COMPLETED', hours: 10, rating: 5, attendance: 'PRESENT' },
      { vol: 'michael.dallas@email.com', status: 'COMPLETED', hours: 10, rating: 5, attendance: 'PRESENT' },
      { vol: 'amanda.taylor@email.com', status: 'COMPLETED', hours: 9.5, rating: 5, attendance: 'PRESENT' },
      { vol: 'david.wilson@email.com', status: 'COMPLETED', hours: 10, rating: 5, attendance: 'PRESENT' },
    ]
  };

  for (const [eventId, assignments] of Object.entries(eventVolunteerMap)) {
    const pastEvent = createdPastEvents.find(e => e.event.id === eventId);
    if (!pastEvent) continue;

    for (const assignment of assignments) {
      const volunteer = createdVolunteers.find(v => v.user.email === assignment.vol);
      if (!volunteer) continue;

      // Create assignment
      // Note: Assignment status is COMPLETED for past events (event happened)
      // The volunteer history status will track if they actually showed up
      const createdAssignment = await prisma.assignment.create({
        data: {
          eventId: pastEvent.event.id,
          volunteerId: volunteer.user.id,
          status: 'COMPLETED', // All past event assignments are COMPLETED
          matchScore: 0.75 + Math.random() * 0.25,
          notes: 'Assigned based on skills and availability',
          assignedAt: randomPastDate(pastEvent.data.daysAgo + 15),
          confirmedAt: randomPastDate(pastEvent.data.daysAgo + 10),
          updatedAt: randomPastDate(pastEvent.data.daysAgo - 2)
        }
      });
      assignmentCount++;

      // Create volunteer history
      const feedback = assignment.rating === 5
        ? 'Excellent work! Highly dedicated and professional volunteer.'
        : assignment.rating === 4
        ? 'Great performance. Reliable and helpful throughout the event.'
        : assignment.rating === 3
        ? 'Good effort. Could improve in some areas.'
        : assignment.rating === null
        ? null
        : 'Satisfactory performance.';

      await prisma.volunteerHistory.create({
        data: {
          volunteerId: volunteer.user.id,
          eventId: pastEvent.event.id,
          assignmentId: createdAssignment.id,
          status: assignment.status, // NO_SHOW, COMPLETED, etc. - ParticipationStatus
          hoursWorked: assignment.hours,
          performanceRating: assignment.rating,
          feedback: feedback,
          attendance: assignment.attendance,
          skillsUtilized: [],
          participationDate: pastEvent.startDate,
          completionDate: assignment.status === 'COMPLETED' ? pastEvent.endDate : null,
          recordedBy: admin.id,
          adminNotes: assignment.status === 'NO_SHOW' ? 'Did not attend - follow up needed' : 'Event completed successfully'
        }
      });
      historyCount++;
    }
  }

  console.log(`✅ Created ${assignmentCount} assignments and ${historyCount} volunteer history records`);

  // ========================================
  // 7. SOME ASSIGNMENTS FOR FUTURE EVENTS (PENDING/CONFIRMED)
  // ========================================
  console.log('📝 Creating pending assignments for future events...');

  let futureAssignmentCount = 0;

  // Add some pending/confirmed assignments for upcoming events
  const futureAssignments = [
    { event: 'future-soup-kitchen-001', vol: 'mike.brown@email.com', status: 'CONFIRMED' },
    { event: 'future-soup-kitchen-001', vol: 'john.smith@email.com', status: 'CONFIRMED' },
    { event: 'future-tutoring-001', vol: 'emily.davis@email.com', status: 'CONFIRMED' },
    { event: 'future-tutoring-001', vol: 'lisa.garcia@email.com', status: 'PENDING' },
    { event: 'future-park-cleanup-001', vol: 'jennifer.white@email.com', status: 'CONFIRMED' },
    { event: 'future-park-cleanup-001', vol: 'mike.brown@email.com', status: 'CONFIRMED' },
    { event: 'future-health-fair-001', vol: 'john.smith@email.com', status: 'PENDING' },
    { event: 'future-health-fair-001', vol: 'maria.rodriguez@email.com', status: 'CONFIRMED' },
    { event: 'future-fundraiser-001', vol: 'sarah.jones@email.com', status: 'CONFIRMED' },
    { event: 'future-fundraiser-001', vol: 'michael.dallas@email.com', status: 'PENDING' },
  ];

  for (const assignment of futureAssignments) {
    const futureEvent = createdFutureEvents.find(e => e.event.id === assignment.event);
    const volunteer = createdVolunteers.find(v => v.user.email === assignment.vol);

    if (futureEvent && volunteer) {
      await prisma.assignment.create({
        data: {
          eventId: futureEvent.event.id,
          volunteerId: volunteer.user.id,
          status: assignment.status,
          matchScore: 0.70 + Math.random() * 0.30,
          notes: 'Assigned based on matching algorithm',
          assignedAt: randomPastDate(Math.floor(Math.random() * 10) + 1),
          confirmedAt: assignment.status === 'CONFIRMED' ? randomPastDate(Math.floor(Math.random() * 5) + 1) : null,
          updatedAt: new Date()
        }
      });
      futureAssignmentCount++;

      // Update event currentVolunteers count
      await prisma.event.update({
        where: { id: futureEvent.event.id },
        data: {
          currentVolunteers: {
            increment: 1
          }
        }
      });
    }
  }

  console.log(`✅ Created ${futureAssignmentCount} pending/confirmed assignments for future events`);

  // ========================================
  // 8. NOTIFICATIONS
  // ========================================
  console.log('🔔 Creating notifications...');

  let notificationCount = 0;

  // Create various types of notifications for volunteers
  for (const volData of createdVolunteers.slice(0, 10)) {
    // Assignment notification
    await prisma.notification.create({
      data: {
        userId: volData.user.id,
        type: 'ASSIGNMENT',
        priority: 'HIGH',
        title: 'New Event Assignment',
        message: 'You have been assigned to a new volunteer event that matches your skills!',
        read: Math.random() > 0.5,
        readAt: Math.random() > 0.5 ? randomPastDate(5) : null,
        actionUrl: '/events',
        actionLabel: 'View Event',
        createdAt: randomPastDate(7),
        updatedAt: randomPastDate(7)
      }
    });
    notificationCount++;

    // Event reminder notification
    await prisma.notification.create({
      data: {
        userId: volData.user.id,
        type: 'REMINDER',
        priority: 'MEDIUM',
        title: 'Upcoming Event Reminder',
        message: 'Reminder: You have a volunteer event coming up in 2 days.',
        read: Math.random() > 0.3,
        readAt: Math.random() > 0.3 ? randomPastDate(2) : null,
        actionUrl: '/events',
        actionLabel: 'View Details',
        expiresAt: randomFutureDate(5),
        createdAt: randomPastDate(3),
        updatedAt: randomPastDate(3)
      }
    });
    notificationCount++;
  }

  // Create announcement for all volunteers
  const announcement = await prisma.notification.create({
    data: {
      userId: admin.id,
      type: 'ANNOUNCEMENT',
      priority: 'HIGH',
      title: 'New Volunteer Opportunities Available!',
      message: 'We have several exciting new volunteer opportunities available. Check out the events page to find your perfect match!',
      read: false,
      actionUrl: '/events',
      actionLabel: 'Browse Events',
      expiresAt: randomFutureDate(30),
      createdAt: randomPastDate(1),
      updatedAt: randomPastDate(1)
    }
  });
  notificationCount++;

  console.log(`✅ Created ${notificationCount} notifications`);

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n✨ Comprehensive demo database seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 DATABASE SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 States:               ${states.length}`);
  console.log(`🎯 Skills:               ${skillsData.length}`);
  console.log(`👥 Users:                1 admin + ${volunteers.length} volunteers`);
  console.log(`📅 Past Events:          ${pastEventsData.length} (COMPLETED)`);
  console.log(`📅 Future Events:        ${futureEventsData.length} (PUBLISHED/UPCOMING)`);
  console.log(`📝 Assignments:          ${assignmentCount + futureAssignmentCount}`);
  console.log(`   - Past:               ${assignmentCount}`);
  console.log(`   - Future:             ${futureAssignmentCount}`);
  console.log(`📊 Volunteer History:    ${historyCount} records`);
  console.log(`🔔 Notifications:        ${notificationCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📝 TEST CREDENTIALS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Admin Account:');
  console.log('   Email:    admin@jacsshiftpilot.com');
  console.log('   Password: Admin123!');
  console.log('\n👤 Sample Volunteer Accounts (all use password: Volunteer123!):');
  console.log('   • john.smith@email.com       (Houston - Healthcare)');
  console.log('   • sarah.jones@email.com      (Houston - Event Planning)');
  console.log('   • mike.brown@email.com       (Houston - Multi-skilled)');
  console.log('   • emily.davis@email.com      (Houston - Education)');
  console.log('   • maria.rodriguez@email.com  (Houston - Nursing)');
  console.log('   • james.martinez@email.com   (Houston - Construction)');
  console.log('   • chris.austin@email.com     (Austin - Tech)');
  console.log('   • michael.dallas@email.com   (Dallas - Events)');
  console.log('   • alex.california@email.com  (LA - Creative)');
  console.log('   • newbie.volunteer@email.com (Houston - New volunteer)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🎯 DEMO FEATURES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Past events with complete volunteer history');
  console.log('✅ Future events ready for volunteer matching');
  console.log('✅ Volunteers from multiple cities (distance testing)');
  console.log('✅ Diverse skill sets and proficiency levels');
  console.log('✅ Complete assignments (confirmed, pending, completed)');
  console.log('✅ Performance ratings and feedback');
  console.log('✅ Notifications for various scenarios');
  console.log('✅ Perfect for algorithm testing and demos!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
