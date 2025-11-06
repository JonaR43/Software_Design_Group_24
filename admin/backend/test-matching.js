const matcher = require('./src/utils/matchingAlgorithm');
const prisma = require('./src/database/prisma');

(async () => {
  try {
    // Get Health Fair event
    const event = await prisma.event.findFirst({
      where: { title: 'Community Health Fair' },
      include: { requirements: { include: { skill: true } } }
    });

    // Get all volunteers with profiles
    const volunteers = await prisma.user.findMany({
      where: { role: 'VOLUNTEER' },
      include: {
        profile: {
          include: {
            skills: { include: { skill: true } },
            availability: true
          }
        }
      }
    });

    console.log('Event: ' + event.title);
    console.log('Location: ' + event.city + ' - Lat: ' + event.latitude + ', Lon: ' + event.longitude);
    console.log('Date: ' + event.startDate.toISOString().split('T')[0]);
    console.log('Day: ' + event.startDate.toLocaleDateString('en-US', { weekday: 'long' }));
    console.log('Time: ' + event.startDate.toTimeString().split(' ')[0]);
    console.log('Required Skills: ' + event.requirements.map(r => r.skill.name + ' (' + r.minLevel + ')').join(', '));
    console.log('\nDEBUG - Event has requiredSkills?', !!event.requiredSkills);
    console.log('DEBUG - Event has requirements?', !!event.requirements);
    console.log('DEBUG - Event.requirements length:', event.requirements ? event.requirements.length : 0);
    console.log('\n=== VOLUNTEER MATCH BREAKDOWN ===\n');

    // Debug first volunteer
    if (volunteers.length > 0 && volunteers[0].profile) {
      console.log('DEBUG - Sample volunteer profile structure:');
      console.log('  Has latitude?', !!volunteers[0].profile.latitude);
      console.log('  Has longitude?', !!volunteers[0].profile.longitude);
      console.log('  Has skills array?', !!volunteers[0].profile.skills);
      console.log('  Skills count:', volunteers[0].profile.skills ? volunteers[0].profile.skills.length : 0);
      console.log('');
    }

    const matches = [];
    for (const volunteer of volunteers) {
      if (!volunteer.profile) continue;
      const match = matcher.calculateMatchScore(volunteer, event);
      matches.push({
        name: volunteer.profile.firstName + ' ' + volunteer.profile.lastName,
        city: volunteer.profile.city,
        total: match.totalScore,
        breakdown: match.scoreBreakdown
      });
    }

    // Sort by total score descending
    matches.sort((a, b) => b.total - a.total);

    for (const m of matches) {
      console.log(m.name + ' (' + m.city + '):');
      console.log('  Total Score: ' + m.total + '%');
      console.log('  - Location:     ' + m.breakdown.location + '%');
      console.log('  - Skills:       ' + m.breakdown.skills + '%');
      console.log('  - Availability: ' + m.breakdown.availability + '%');
      console.log('  - Preferences:  ' + m.breakdown.preferences + '%');
      console.log('  - Reliability:  ' + m.breakdown.reliability + '%');
      console.log('');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
