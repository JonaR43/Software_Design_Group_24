/**
 * Event Repository
 * Handles all database operations for events and assignments
 */

const prisma = require('../prisma');

class EventRepository {
  /**
   * Find event by ID
   */
  async findById(eventId) {
    return await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        requirements: {
          include: {
            skill: true
          }
        },
        assignments: {
          include: {
            volunteer: {
              select: {
                id: true,
                username: true,
                email: true,
                profile: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get all events with filters and pagination
   */
  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = {};

    if (filters.status) {
      where.status = filters.status.toUpperCase().replace('-', '_');
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.urgencyLevel) {
      where.urgencyLevel = filters.urgencyLevel.toUpperCase();
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          requirements: {
            include: {
              skill: true
            }
          },
          _count: {
            select: {
              assignments: true
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      }),
      prisma.event.count({ where })
    ]);

    return { events, total };
  }

  /**
   * Create new event
   */
  async create(eventData) {
    const requiredSkills = eventData.requiredSkills || [];
    delete eventData.requiredSkills;

    return await prisma.event.create({
      data: {
        ...eventData,
        status: eventData.status ? eventData.status.toUpperCase() : 'DRAFT',
        urgencyLevel: eventData.urgencyLevel ? eventData.urgencyLevel.toUpperCase() : 'MEDIUM',
        requirements: {
          create: requiredSkills.map(skill => ({
            skillId: skill.skillId,
            minLevel: skill.minLevel.toUpperCase(),
            isRequired: skill.isRequired !== false
          }))
        }
      },
      include: {
        creator: true,
        requirements: {
          include: {
            skill: true
          }
        }
      }
    });
  }

  /**
   * Update event
   */
  async update(eventId, updateData) {
    const requiredSkills = updateData.requiredSkills;
    delete updateData.requiredSkills;

    // Prepare update data
    const data = { ...updateData };
    if (data.status) {
      data.status = data.status.toUpperCase().replace('-', '_');
    }
    if (data.urgencyLevel) {
      data.urgencyLevel = data.urgencyLevel.toUpperCase();
    }

    // If required skills are being updated, delete old ones and create new ones
    if (requiredSkills) {
      await prisma.eventRequirement.deleteMany({
        where: { eventId }
      });

      data.requirements = {
        create: requiredSkills.map(skill => ({
          skillId: skill.skillId,
          minLevel: skill.minLevel.toUpperCase(),
          isRequired: skill.isRequired !== false
        }))
      };
    }

    return await prisma.event.update({
      where: { id: eventId },
      data,
      include: {
        creator: true,
        requirements: {
          include: {
            skill: true
          }
        }
      }
    });
  }

  /**
   * Delete event
   */
  async delete(eventId) {
    return await prisma.event.delete({
      where: { id: eventId }
    });
  }

  /**
   * Get event assignments
   */
  async getAssignments(eventId) {
    return await prisma.assignment.findMany({
      where: { eventId },
      include: {
        volunteer: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });
  }

  /**
   * Get volunteer assignments
   */
  async getVolunteerAssignments(volunteerId) {
    return await prisma.assignment.findMany({
      where: { volunteerId },
      include: {
        event: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            requirements: {
              include: {
                skill: true
              }
            }
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });
  }

  /**
   * Create assignment
   */
  async createAssignment(assignmentData) {
    // Update event volunteer count
    await prisma.event.update({
      where: { id: assignmentData.eventId },
      data: {
        currentVolunteers: {
          increment: 1
        }
      }
    });

    return await prisma.assignment.create({
      data: {
        eventId: assignmentData.eventId,
        volunteerId: assignmentData.volunteerId,
        status: assignmentData.status ? assignmentData.status.toUpperCase() : 'PENDING',
        matchScore: assignmentData.matchScore || 0,
        notes: assignmentData.notes || null
      },
      include: {
        event: true,
        volunteer: {
          include: {
            profile: true
          }
        }
      }
    });
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(assignmentId, status, notes = null) {
    const data = {
      status: status.toUpperCase(),
      updatedAt: new Date()
    };

    if (notes) {
      data.notes = notes;
    }

    if (status.toUpperCase() === 'CONFIRMED') {
      data.confirmedAt = new Date();
    }

    return await prisma.assignment.update({
      where: { id: assignmentId },
      data,
      include: {
        event: true,
        volunteer: true
      }
    });
  }

  /**
   * Find assignment by ID
   */
  async findAssignmentById(assignmentId) {
    return await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        event: true,
        volunteer: {
          include: {
            profile: true
          }
        }
      }
    });
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(assignmentId) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (assignment) {
      // Decrement event volunteer count
      await prisma.event.update({
        where: { id: assignment.eventId },
        data: {
          currentVolunteers: {
            decrement: 1
          }
        }
      });

      return await prisma.assignment.delete({
        where: { id: assignmentId }
      });
    }

    return null;
  }

  /**
   * Get events that need volunteers (published events with available spots)
   */
  async getEventsNeedingVolunteers() {
    // Get published events where currentVolunteers < maxVolunteers
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        requirements: {
          include: {
            skill: true
          }
        }
      }
    });

    // Filter for events needing volunteers
    return events.filter(event => event.currentVolunteers < event.maxVolunteers);
  }

  /**
   * Get event statistics
   */
  async getEventStats() {
    const [total, published, inProgress, completed, draft, cancelled] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.event.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.event.count({ where: { status: 'COMPLETED' } }),
      prisma.event.count({ where: { status: 'DRAFT' } }),
      prisma.event.count({ where: { status: 'CANCELLED' } })
    ]);

    return {
      total,
      byStatus: {
        published,
        inProgress,
        completed,
        draft,
        cancelled
      }
    };
  }
}

module.exports = new EventRepository();
