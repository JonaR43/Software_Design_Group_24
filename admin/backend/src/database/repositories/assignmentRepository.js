/**
 * Assignment Repository
 * Handles all database operations for assignments
 */

const prisma = require('../prisma');

class AssignmentRepository {
  /**
   * Find assignment by ID
   */
  async findById(assignmentId) {
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
   * Create new assignment
   */
  async create(assignmentData) {
    return await prisma.assignment.create({
      data: {
        eventId: assignmentData.eventId,
        volunteerId: assignmentData.volunteerId,
        status: assignmentData.status || 'PENDING',
        matchScore: assignmentData.matchScore || 0,
        notes: assignmentData.notes || '',
        confirmedAt: assignmentData.status === 'CONFIRMED' ? new Date() : null
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
   * Update assignment
   */
  async update(assignmentId, updateData) {
    const dataToUpdate = {};

    if (updateData.status !== undefined) {
      dataToUpdate.status = updateData.status;
      if (updateData.status === 'CONFIRMED' && !updateData.confirmedAt) {
        dataToUpdate.confirmedAt = new Date();
      }
    }

    if (updateData.matchScore !== undefined) {
      dataToUpdate.matchScore = updateData.matchScore;
    }

    if (updateData.notes !== undefined) {
      dataToUpdate.notes = updateData.notes;
    }

    if (updateData.confirmedAt !== undefined) {
      dataToUpdate.confirmedAt = updateData.confirmedAt;
    }

    return await prisma.assignment.update({
      where: { id: assignmentId },
      data: dataToUpdate,
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
  async delete(assignmentId) {
    return await prisma.assignment.delete({
      where: { id: assignmentId }
    });
  }

  /**
   * Find all assignments for a volunteer
   */
  async findByVolunteer(volunteerId) {
    return await prisma.assignment.findMany({
      where: { volunteerId },
      include: {
        event: true
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });
  }

  /**
   * Find all assignments for an event
   */
  async findByEvent(eventId) {
    return await prisma.assignment.findMany({
      where: { eventId },
      include: {
        volunteer: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });
  }

  /**
   * Find assignment by event and volunteer
   */
  async findByEventAndVolunteer(eventId, volunteerId) {
    return await prisma.assignment.findUnique({
      where: {
        eventId_volunteerId: {
          eventId,
          volunteerId
        }
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
   * Count assignments by status
   */
  async countByStatus(status) {
    return await prisma.assignment.count({
      where: { status }
    });
  }

  /**
   * Get all assignments with filters
   */
  async findAll(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.eventId) {
      where.eventId = filters.eventId;
    }

    if (filters.volunteerId) {
      where.volunteerId = filters.volunteerId;
    }

    return await prisma.assignment.findMany({
      where,
      include: {
        event: true,
        volunteer: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });
  }
}

module.exports = new AssignmentRepository();
