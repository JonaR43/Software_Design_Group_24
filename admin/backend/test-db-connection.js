/**
 * Test Database Connection and Verify Data
 */

const prisma = require('./src/database/prisma');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test 1: Count users
    const userCount = await prisma.user.count();
    console.log(`✅ Users: ${userCount}`);

    // Test 2: Count profiles
    const profileCount = await prisma.profile.count();
    console.log(`✅ Profiles: ${profileCount}`);

    // Test 3: Count skills
    const skillCount = await prisma.skill.count();
    console.log(`✅ Skills: ${skillCount}`);

    // Test 4: Count events
    const eventCount = await prisma.event.count();
    console.log(`✅ Events: ${eventCount}`);

    // Test 5: Count states
    const stateCount = await prisma.state.count();
    console.log(`✅ States: ${stateCount}`);

    // Test 6: Fetch a sample user with profile
    const sampleUser = await prisma.user.findFirst({
      include: {
        profile: {
          include: {
            skills: {
              include: {
                skill: true
              }
            },
            availability: true
          }
        }
      }
    });

    console.log('\n📋 Sample User Data:');
    console.log(`   Username: ${sampleUser.username}`);
    console.log(`   Email: ${sampleUser.email}`);
    console.log(`   Role: ${sampleUser.role}`);
    if (sampleUser.profile) {
      console.log(`   Profile: ${sampleUser.profile.firstName} ${sampleUser.profile.lastName}`);
      console.log(`   Skills: ${sampleUser.profile.skills.length}`);
      console.log(`   Availability slots: ${sampleUser.profile.availability.length}`);
    }

    console.log('\n✨ Database is fully set up and populated!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
