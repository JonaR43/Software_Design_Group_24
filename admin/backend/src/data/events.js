/**
 * Hardcoded Events Data for Assignment 3
 * Event management and assignment data
 */

const events = [
  {
    id: 'event_001',
    title: 'Community Food Drive',
    description: 'Help organize and distribute food to families in need during the holiday season. We need volunteers to help sort donations, pack bags, and distribute to local families.',
    location: '456 Community Center Drive, Houston, TX 77002',
    latitude: 29.7520,
    longitude: -95.3720,
    startDate: new Date('2024-12-15T09:00:00Z'),
    endDate: new Date('2024-12-15T17:00:00Z'),
    maxVolunteers: 20,
    currentVolunteers: 5,
    urgencyLevel: 'high',
    status: 'published',
    category: 'food',
    createdBy: 'user_001',
    createdAt: new Date('2024-11-01T10:00:00Z'),
    updatedAt: new Date('2024-11-15T14:30:00Z'),
    requiredSkills: [
      {
        skillId: 'skill_009',
        minLevel: 'beginner',
        required: true
      },
      {
        skillId: 'skill_001',
        minLevel: 'intermediate',
        required: false
      }
    ]
  },
  {
    id: 'event_002',
    title: 'Park Cleanup Initiative',
    description: 'Join us for a community park cleanup to beautify our local green spaces. Bring gloves and wear comfortable clothes. Tools will be provided.',
    location: '789 Memorial Park, Houston, TX 77007',
    latitude: 29.7633,
    longitude: -95.3903,
    startDate: new Date('2024-12-08T08:00:00Z'),
    endDate: new Date('2024-12-08T14:00:00Z'),
    maxVolunteers: 30,
    currentVolunteers: 12,
    urgencyLevel: 'normal',
    status: 'published',
    category: 'environmental',
    createdBy: 'user_001',
    createdAt: new Date('2024-10-20T09:15:00Z'),
    updatedAt: new Date('2024-11-10T16:45:00Z'),
    requiredSkills: [
      {
        skillId: 'skill_018',
        minLevel: 'beginner',
        required: true
      },
      {
        skillId: 'skill_008',
        minLevel: 'intermediate',
        required: false
      }
    ]
  },
  {
    id: 'event_003',
    title: 'Senior Center Technology Workshop',
    description: 'Teach elderly residents how to use smartphones and tablets. Help them connect with family and access online services safely.',
    location: '321 Senior Center Lane, Houston, TX 77003',
    latitude: 29.7410,
    longitude: -95.3380,
    startDate: new Date('2024-12-20T13:00:00Z'),
    endDate: new Date('2024-12-20T16:00:00Z'),
    maxVolunteers: 8,
    currentVolunteers: 3,
    urgencyLevel: 'normal',
    status: 'published',
    category: 'educational',
    createdBy: 'user_001',
    createdAt: new Date('2024-11-05T11:20:00Z'),
    updatedAt: new Date('2024-11-12T13:15:00Z'),
    requiredSkills: [
      {
        skillId: 'skill_016',
        minLevel: 'intermediate',
        required: true
      },
      {
        skillId: 'skill_007',
        minLevel: 'intermediate',
        required: true
      },
      {
        skillId: 'skill_019',
        minLevel: 'beginner',
        required: false
      }
    ]
  },
  {
    id: 'event_004',
    title: 'Emergency Shelter Support',
    description: 'Assist with emergency shelter operations during cold weather. Help with check-in, meal service, and general support for guests.',
    location: '654 Shelter Road, Houston, TX 77004',
    latitude: 29.7200,
    longitude: -95.3900,
    startDate: new Date('2024-12-01T18:00:00Z'),
    endDate: new Date('2024-12-02T08:00:00Z'),
    maxVolunteers: 15,
    currentVolunteers: 8,
    urgencyLevel: 'urgent',
    status: 'published',
    category: 'social',
    createdBy: 'user_001',
    createdAt: new Date('2024-11-20T15:30:00Z'),
    updatedAt: new Date('2024-11-25T10:00:00Z'),
    requiredSkills: [
      {
        skillId: 'skill_003',
        minLevel: 'intermediate',
        required: true
      },
      {
        skillId: 'skill_009',
        minLevel: 'beginner',
        required: false
      },
      {
        skillId: 'skill_004',
        minLevel: 'advanced',
        required: false
      }
    ]
  },
  {
    id: 'event_005',
    title: 'Youth After-School Program',
    description: 'Mentor middle school students with homework help and recreational activities. Create a safe and fun environment for learning.',
    location: '987 Youth Center Ave, Houston, TX 77005',
    latitude: 29.7180,
    longitude: -95.4020,
    startDate: new Date('2024-12-10T15:30:00Z'),
    endDate: new Date('2024-12-10T18:30:00Z'),
    maxVolunteers: 12,
    currentVolunteers: 6,
    urgencyLevel: 'normal',
    status: 'published',
    category: 'educational',
    createdBy: 'user_001',
    createdAt: new Date('2024-10-15T14:00:00Z'),
    updatedAt: new Date('2024-11-08T12:30:00Z'),
    requiredSkills: [
      {
        skillId: 'skill_020',
        minLevel: 'intermediate',
        required: true
      },
      {
        skillId: 'skill_007',
        minLevel: 'beginner',
        required: false
      },
      {
        skillId: 'skill_024',
        minLevel: 'intermediate',
        required: false
      }
    ]
  },
  {
    id: 'event_006',
    title: 'Disaster Relief Fundraiser',
    description: 'Help organize and run a fundraising event for recent disaster victims. Set up booths, manage registration, and coordinate activities.',
    location: '123 Convention Center, Houston, TX 77002',
    latitude: 29.7530,
    longitude: -95.3620,
    startDate: new Date('2024-12-22T10:00:00Z'),
    endDate: new Date('2024-12-22T20:00:00Z'),
    maxVolunteers: 25,
    currentVolunteers: 10,
    urgencyLevel: 'high',
    status: 'draft',
    category: 'fundraising',
    createdBy: 'user_001',
    createdAt: new Date('2024-11-18T16:45:00Z'),
    updatedAt: new Date('2024-11-22T09:20:00Z'),
    requiredSkills: [
      {
        skillId: 'skill_014',
        minLevel: 'intermediate',
        required: true
      },
      {
        skillId: 'skill_001',
        minLevel: 'advanced',
        required: true
      },
      {
        skillId: 'skill_003',
        minLevel: 'intermediate',
        required: false
      }
    ]
  }
];

// Event assignments (volunteer-to-event mappings)
const eventAssignments = [
  {
    id: 'assignment_001',
    eventId: 'event_001',
    volunteerId: 'user_002',
    status: 'confirmed',
    matchScore: 85,
    assignedAt: new Date('2024-11-16T10:30:00Z'),
    confirmedAt: new Date('2024-11-16T14:20:00Z'),
    notes: 'Experienced with food service operations'
  },
  {
    id: 'assignment_002',
    eventId: 'event_001',
    volunteerId: 'user_003',
    status: 'confirmed',
    matchScore: 78,
    assignedAt: new Date('2024-11-17T09:15:00Z'),
    confirmedAt: new Date('2024-11-17T11:30:00Z'),
    notes: 'Available for full event duration'
  },
  {
    id: 'assignment_003',
    eventId: 'event_002',
    volunteerId: 'user_002',
    status: 'confirmed',
    matchScore: 92,
    assignedAt: new Date('2024-11-11T15:45:00Z'),
    confirmedAt: new Date('2024-11-11T16:00:00Z'),
    notes: 'Very experienced with landscaping work'
  },
  {
    id: 'assignment_004',
    eventId: 'event_002',
    volunteerId: 'user_004',
    status: 'confirmed',
    matchScore: 88,
    assignedAt: new Date('2024-11-12T12:00:00Z'),
    confirmedAt: new Date('2024-11-12T14:30:00Z'),
    notes: 'Construction background helpful for cleanup'
  },
  {
    id: 'assignment_005',
    eventId: 'event_003',
    volunteerId: 'user_003',
    status: 'pending',
    matchScore: 75,
    assignedAt: new Date('2024-11-20T10:00:00Z'),
    confirmedAt: null,
    notes: 'Healthcare background useful for working with seniors'
  },
  {
    id: 'assignment_006',
    eventId: 'event_004',
    volunteerId: 'user_003',
    status: 'confirmed',
    matchScore: 95,
    assignedAt: new Date('2024-11-26T08:30:00Z'),
    confirmedAt: new Date('2024-11-26T09:15:00Z'),
    notes: 'Perfect match - healthcare experience and customer service skills'
  }
];

/**
 * Helper functions for event management
 */
const eventHelpers = {
  // Get all events
  getAllEvents: () => events,

  // Find event by ID
  findById: (id) => {
    return events.find(event => event.id === id);
  },

  // Get events by status
  getByStatus: (status) => {
    return events.filter(event => event.status === status);
  },

  // Get events by category
  getByCategory: (category) => {
    return events.filter(event => event.category === category);
  },

  // Get events by urgency level
  getByUrgency: (urgencyLevel) => {
    return events.filter(event => event.urgencyLevel === urgencyLevel);
  },

  // Get upcoming events
  getUpcomingEvents: () => {
    const now = new Date();
    return events.filter(event => new Date(event.startDate) > now);
  },

  // Get events needing volunteers
  getEventsNeedingVolunteers: () => {
    return events.filter(event =>
      event.currentVolunteers < event.maxVolunteers &&
      event.status === 'published'
    );
  },

  // Create new event
  createEvent: (eventData) => {
    const newEvent = {
      id: `event_${String(events.length + 1).padStart(3, '0')}`,
      ...eventData,
      currentVolunteers: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    events.push(newEvent);
    return newEvent;
  },

  // Update event
  updateEvent: (id, updateData) => {
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex !== -1) {
      events[eventIndex] = {
        ...events[eventIndex],
        ...updateData,
        updatedAt: new Date()
      };
      return events[eventIndex];
    }
    return null;
  },

  // Delete event
  deleteEvent: (id) => {
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex !== -1) {
      const deletedEvent = events.splice(eventIndex, 1)[0];
      // Also remove related assignments
      const assignmentIndices = [];
      for (let i = eventAssignments.length - 1; i >= 0; i--) {
        if (eventAssignments[i].eventId === id) {
          assignmentIndices.push(i);
        }
      }
      assignmentIndices.forEach(index => eventAssignments.splice(index, 1));
      return deletedEvent;
    }
    return null;
  },

  // Get event assignments
  getEventAssignments: (eventId) => {
    return eventAssignments.filter(assignment => assignment.eventId === eventId);
  },

  // Get volunteer assignments
  getVolunteerAssignments: (volunteerId) => {
    return eventAssignments.filter(assignment => assignment.volunteerId === volunteerId);
  },

  // Create event assignment
  createAssignment: (assignmentData) => {
    const newAssignment = {
      id: `assignment_${String(eventAssignments.length + 1).padStart(3, '0')}`,
      ...assignmentData,
      assignedAt: new Date()
    };
    eventAssignments.push(newAssignment);

    // Update event volunteer count
    const event = events.find(e => e.id === assignmentData.eventId);
    if (event) {
      event.currentVolunteers = eventAssignments.filter(a =>
        a.eventId === assignmentData.eventId &&
        a.status === 'confirmed'
      ).length;
    }

    return newAssignment;
  },

  // Update assignment status
  updateAssignmentStatus: (assignmentId, status, notes = '') => {
    const assignmentIndex = eventAssignments.findIndex(a => a.id === assignmentId);
    if (assignmentIndex !== -1) {
      eventAssignments[assignmentIndex].status = status;
      eventAssignments[assignmentIndex].notes = notes;

      if (status === 'confirmed') {
        eventAssignments[assignmentIndex].confirmedAt = new Date();
      }

      // Update event volunteer count
      const assignment = eventAssignments[assignmentIndex];
      const event = events.find(e => e.id === assignment.eventId);
      if (event) {
        event.currentVolunteers = eventAssignments.filter(a =>
          a.eventId === assignment.eventId &&
          a.status === 'confirmed'
        ).length;
      }

      return eventAssignments[assignmentIndex];
    }
    return null;
  },

  // Search events
  searchEvents: (query) => {
    const lowerQuery = query.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      event.location.toLowerCase().includes(lowerQuery) ||
      event.category.toLowerCase().includes(lowerQuery)
    );
  },

  // Filter events by criteria
  filterEvents: (filters) => {
    let filteredEvents = [...events];

    if (filters.status) {
      filteredEvents = filteredEvents.filter(event => event.status === filters.status);
    }

    if (filters.category) {
      filteredEvents = filteredEvents.filter(event => event.category === filters.category);
    }

    if (filters.urgencyLevel) {
      filteredEvents = filteredEvents.filter(event => event.urgencyLevel === filters.urgencyLevel);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredEvents = filteredEvents.filter(event => new Date(event.startDate) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredEvents = filteredEvents.filter(event => new Date(event.endDate) <= endDate);
    }

    if (filters.needsVolunteers) {
      filteredEvents = filteredEvents.filter(event =>
        event.currentVolunteers < event.maxVolunteers
      );
    }

    return filteredEvents;
  },

  // Get event statistics
  getEventStats: () => {
    const totalEvents = events.length;
    const publishedEvents = events.filter(e => e.status === 'published').length;
    const draftEvents = events.filter(e => e.status === 'draft').length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const upcomingEvents = eventHelpers.getUpcomingEvents().length;
    const eventsNeedingVolunteers = eventHelpers.getEventsNeedingVolunteers().length;

    const totalVolunteerSlots = events.reduce((sum, e) => sum + e.maxVolunteers, 0);
    const filledVolunteerSlots = events.reduce((sum, e) => sum + e.currentVolunteers, 0);
    const fillRate = totalVolunteerSlots > 0 ? Math.round((filledVolunteerSlots / totalVolunteerSlots) * 100) : 0;

    return {
      totalEvents,
      publishedEvents,
      draftEvents,
      completedEvents,
      upcomingEvents,
      eventsNeedingVolunteers,
      totalVolunteerSlots,
      filledVolunteerSlots,
      fillRate
    };
  }
};

// Event categories and urgency levels
const eventCategories = [
  { id: 'community', name: 'Community Service', description: 'General community assistance and improvement' },
  { id: 'environmental', name: 'Environmental', description: 'Environmental protection and sustainability' },
  { id: 'educational', name: 'Educational', description: 'Teaching, training, and educational support' },
  { id: 'healthcare', name: 'Healthcare', description: 'Medical and health-related assistance' },
  { id: 'food', name: 'Food Distribution', description: 'Food service and distribution to those in need' },
  { id: 'disaster', name: 'Disaster Relief', description: 'Emergency response and disaster assistance' },
  { id: 'fundraising', name: 'Fundraising', description: 'Fundraising events and activities' },
  { id: 'social', name: 'Social Services', description: 'Social support and community welfare' }
];

const urgencyLevels = [
  { id: 'low', name: 'Low', description: 'Standard priority, flexible timeline' },
  { id: 'normal', name: 'Normal', description: 'Regular priority, planned timeline' },
  { id: 'high', name: 'High', description: 'High priority, urgent need for volunteers' },
  { id: 'urgent', name: 'Urgent', description: 'Critical priority, immediate need for volunteers' }
];

const eventStatuses = [
  { id: 'draft', name: 'Draft', description: 'Event is being planned, not yet published' },
  { id: 'published', name: 'Published', description: 'Event is live and accepting volunteers' },
  { id: 'in-progress', name: 'In Progress', description: 'Event is currently happening' },
  { id: 'completed', name: 'Completed', description: 'Event has finished successfully' },
  { id: 'cancelled', name: 'Cancelled', description: 'Event has been cancelled' }
];

module.exports = {
  events,
  eventAssignments,
  eventHelpers,
  eventCategories,
  urgencyLevels,
  eventStatuses
};