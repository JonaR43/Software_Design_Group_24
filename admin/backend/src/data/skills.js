/**
 * Hardcoded Skills Data for Assignment 3
 * Available skills and categories for volunteer matching
 */

const skills = [
  {
    id: 'skill_001',
    name: 'Event Planning',
    category: 'administrative',
    description: 'Planning and organizing events, coordinating logistics'
  },
  {
    id: 'skill_002',
    name: 'Data Entry',
    category: 'administrative',
    description: 'Accurate data input and database management'
  },
  {
    id: 'skill_003',
    name: 'Customer Service',
    category: 'social',
    description: 'Interacting with clients and providing assistance'
  },
  {
    id: 'skill_004',
    name: 'First Aid/CPR',
    category: 'healthcare',
    description: 'Emergency medical response and basic healthcare'
  },
  {
    id: 'skill_005',
    name: 'Counseling',
    category: 'social',
    description: 'Providing emotional support and guidance'
  },
  {
    id: 'skill_006',
    name: 'Construction',
    category: 'manual_labor',
    description: 'Building, repair, and maintenance work'
  },
  {
    id: 'skill_007',
    name: 'Teaching/Tutoring',
    category: 'educational',
    description: 'Instructing and mentoring others'
  },
  {
    id: 'skill_008',
    name: 'Landscaping',
    category: 'manual_labor',
    description: 'Gardening, tree work, and outdoor maintenance'
  },
  {
    id: 'skill_009',
    name: 'Food Service',
    category: 'food_service',
    description: 'Food preparation, serving, and kitchen work'
  },
  {
    id: 'skill_010',
    name: 'Transportation',
    category: 'logistics',
    description: 'Driving and delivery services'
  },
  {
    id: 'skill_011',
    name: 'Photography',
    category: 'creative',
    description: 'Event photography and documentation'
  },
  {
    id: 'skill_012',
    name: 'Translation',
    category: 'educational',
    description: 'Language interpretation and translation services'
  },
  {
    id: 'skill_013',
    name: 'Social Media',
    category: 'technical',
    description: 'Managing social media accounts and content creation'
  },
  {
    id: 'skill_014',
    name: 'Fundraising',
    category: 'administrative',
    description: 'Organizing fundraising activities and campaigns'
  },
  {
    id: 'skill_015',
    name: 'Animal Care',
    category: 'specialized',
    description: 'Caring for animals in shelters or rescue situations'
  },
  {
    id: 'skill_016',
    name: 'Computer Skills',
    category: 'technical',
    description: 'Basic computer operation and software use'
  },
  {
    id: 'skill_017',
    name: 'Public Speaking',
    category: 'social',
    description: 'Presenting and speaking to groups'
  },
  {
    id: 'skill_018',
    name: 'Environmental Cleanup',
    category: 'environmental',
    description: 'Cleaning parks, beaches, and natural areas'
  },
  {
    id: 'skill_019',
    name: 'Elderly Care',
    category: 'healthcare',
    description: 'Assisting elderly individuals with daily activities'
  },
  {
    id: 'skill_020',
    name: 'Youth Mentoring',
    category: 'educational',
    description: 'Mentoring and guiding young people'
  },
  {
    id: 'skill_021',
    name: 'Marketing',
    category: 'creative',
    description: 'Promoting events and creating marketing materials'
  },
  {
    id: 'skill_022',
    name: 'Legal Assistance',
    category: 'specialized',
    description: 'Providing basic legal guidance and support'
  },
  {
    id: 'skill_023',
    name: 'Crisis Response',
    category: 'emergency',
    description: 'Responding to emergency situations and disasters'
  },
  {
    id: 'skill_024',
    name: 'Childcare',
    category: 'social',
    description: 'Supervising and caring for children'
  },
  {
    id: 'skill_025',
    name: 'Mechanical Repair',
    category: 'technical',
    description: 'Fixing and maintaining mechanical equipment'
  }
];

const skillCategories = [
  {
    id: 'administrative',
    name: 'Administrative',
    description: 'Office work, planning, and organizational tasks'
  },
  {
    id: 'manual_labor',
    name: 'Manual Labor',
    description: 'Physical work requiring strength and endurance'
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Technology, computer, and mechanical skills'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic, design, and creative expression skills'
  },
  {
    id: 'social',
    name: 'Social',
    description: 'People-focused skills involving interaction and support'
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Teaching, training, and knowledge sharing'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical and health-related assistance'
  },
  {
    id: 'food_service',
    name: 'Food Service',
    description: 'Food preparation, serving, and nutrition'
  },
  {
    id: 'environmental',
    name: 'Environmental',
    description: 'Environmental protection and sustainability'
  },
  {
    id: 'emergency',
    name: 'Emergency Response',
    description: 'Crisis management and emergency assistance'
  },
  {
    id: 'specialized',
    name: 'Specialized',
    description: 'Unique or specialized professional skills'
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Transportation, delivery, and coordination'
  }
];

/**
 * Helper functions for skills management
 */
const skillHelpers = {
  // Get all skills
  getAllSkills: () => skills,

  // Get skills by category
  getSkillsByCategory: (category) => {
    return skills.filter(skill => skill.category === category);
  },

  // Find skill by ID
  findById: (id) => {
    return skills.find(skill => skill.id === id);
  },

  // Find skills by IDs
  findByIds: (ids) => {
    return skills.filter(skill => ids.includes(skill.id));
  },

  // Get all categories
  getAllCategories: () => skillCategories,

  // Find category by ID
  findCategoryById: (id) => {
    return skillCategories.find(category => category.id === id);
  },

  // Search skills by name
  searchSkills: (query) => {
    const lowerQuery = query.toLowerCase();
    return skills.filter(skill =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery)
    );
  },

  // Validate skill proficiency level
  isValidProficiency: (level) => {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    return validLevels.includes(level);
  },

  // Get proficiency levels
  getProficiencyLevels: () => [
    { id: 'beginner', name: 'Beginner', value: 1, description: 'Basic knowledge or experience' },
    { id: 'intermediate', name: 'Intermediate', value: 2, description: 'Some experience and confidence' },
    { id: 'advanced', name: 'Advanced', value: 3, description: 'Significant experience and expertise' },
    { id: 'expert', name: 'Expert', value: 4, description: 'Professional level or extensive experience' }
  ],

  // Calculate skill match score
  calculateSkillMatch: (volunteerSkills, requiredSkills) => {
    if (!requiredSkills || requiredSkills.length === 0) return 100;
    if (!volunteerSkills || volunteerSkills.length === 0) return 0;

    let totalScore = 0;
    let maxPossibleScore = 0;

    const proficiencyValues = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4
    };

    for (const required of requiredSkills) {
      const requiredValue = proficiencyValues[required.minLevel] || 1;
      maxPossibleScore += requiredValue * (required.required ? 2 : 1); // Weight required skills more

      const volunteerSkill = volunteerSkills.find(vs => vs.skillId === required.skillId);

      if (volunteerSkill) {
        const volunteerValue = proficiencyValues[volunteerSkill.proficiency] || 1;
        const skillScore = Math.min(volunteerValue / requiredValue, 1) * requiredValue;
        totalScore += skillScore * (required.required ? 2 : 1);
      } else if (required.required) {
        // Penalty for missing required skills
        totalScore += 0;
      } else {
        // Partial credit for missing optional skills
        totalScore += requiredValue * 0.3;
      }
    }

    return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 100;
  }
};

module.exports = {
  skills,
  skillCategories,
  skillHelpers
};