const prisma = require('../database/prisma');
const NotificationService = require('./notificationService');

/**
 * Attendance Service
 * Business logic for volunteer check-in/check-out and attendance tracking
 */
class AttendanceService {
  /**
   * Volunteer checks in to an event
   */
  async checkIn(eventId, volunteerId, options = {}) {
    // Verify event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event has started (allow check-in 30 minutes before)
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const earlyCheckInWindow = new Date(eventStart.getTime() - 30 * 60 * 1000); // 30 minutes before

    if (now < earlyCheckInWindow) {
      throw new Error('Cannot check in more than 30 minutes before event starts');
    }

    if (now > new Date(event.endDate)) {
      throw new Error('Cannot check in after event has ended');
    }

    // Verify volunteer is assigned to this event
    const assignment = await prisma.assignment.findFirst({
      where: {
        eventId,
        volunteerId,
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    });

    if (!assignment) {
      throw new Error('You are not assigned to this event');
    }

    // Check if already checked in
    const existingRecord = await prisma.volunteerHistory.findFirst({
      where: {
        eventId,
        volunteerId
      }
    });

    if (existingRecord && existingRecord.status === 'COMPLETED') {
      throw new Error('You have already checked out from this event');
    }

    // Create or update history record
    const historyRecord = await prisma.volunteerHistory.upsert({
      where: {
        volunteerId_eventId: {
          volunteerId,
          eventId
        }
      },
      update: {
        status: 'CONFIRMED',
        attendance: 'PRESENT',
        participationDate: now
      },
      create: {
        volunteerId,
        eventId,
        assignmentId: assignment.id,
        status: 'CONFIRMED',
        attendance: 'PRESENT',
        hoursWorked: 0,
        participationDate: now
      },
      include: {
        event: true,
        volunteer: {
          include: { profile: true }
        }
      }
    });

    return {
      historyRecord,
      checkInTime: now,
      message: 'Successfully checked in'
    };
  }

  /**
   * Volunteer checks out from an event
   */
  async checkOut(eventId, volunteerId, options = {}) {
    // Find check-in record
    const historyRecord = await prisma.volunteerHistory.findFirst({
      where: {
        eventId,
        volunteerId
      },
      include: {
        event: true
      }
    });

    if (!historyRecord) {
      throw new Error('No check-in record found. Please check in first.');
    }

    if (historyRecord.status === 'COMPLETED') {
      throw new Error('You have already checked out from this event');
    }

    if (historyRecord.attendance !== 'PRESENT' && historyRecord.attendance !== 'LATE') {
      throw new Error('Cannot check out - attendance status is not valid');
    }

    // Calculate hours worked
    const checkInTime = new Date(historyRecord.participationDate);
    const checkOutTime = new Date();
    const hoursWorked = this.calculateHoursWorked(checkInTime, checkOutTime);

    // Update history record
    const updatedRecord = await prisma.volunteerHistory.update({
      where: { id: historyRecord.id },
      data: {
        status: 'COMPLETED',
        completionDate: checkOutTime,
        hoursWorked,
        feedback: options.feedback || historyRecord.feedback
      },
      include: {
        event: true,
        volunteer: {
          include: { profile: true }
        }
      }
    });

    return {
      historyRecord: updatedRecord,
      checkOutTime,
      hoursWorked,
      message: `Successfully checked out. Hours worked: ${hoursWorked}`
    };
  }

  /**
   * Get attendance status for a volunteer at an event
   */
  async getAttendanceStatus(eventId, volunteerId) {
    const assignment = await prisma.assignment.findFirst({
      where: {
        eventId,
        volunteerId
      },
      include: {
        event: true
      }
    });

    if (!assignment) {
      return {
        assigned: false,
        message: 'Not assigned to this event'
      };
    }

    const historyRecord = await prisma.volunteerHistory.findFirst({
      where: {
        eventId,
        volunteerId
      }
    });

    const now = new Date();
    const eventStart = new Date(assignment.event.startDate);
    const eventEnd = new Date(assignment.event.endDate);
    const earlyCheckInWindow = new Date(eventStart.getTime() - 30 * 60 * 1000);

    return {
      assigned: true,
      canCheckIn: now >= earlyCheckInWindow && now <= eventEnd && (!historyRecord || historyRecord.status !== 'COMPLETED'),
      canCheckOut: historyRecord && historyRecord.status === 'CONFIRMED' && historyRecord.attendance === 'PRESENT',
      checkedIn: !!historyRecord,
      checkedOut: historyRecord?.status === 'COMPLETED',
      checkInTime: historyRecord?.participationDate,
      checkOutTime: historyRecord?.completionDate,
      hoursWorked: historyRecord?.hoursWorked || 0,
      attendance: historyRecord?.attendance || 'PENDING',
      status: historyRecord?.status || 'REGISTERED'
    };
  }

  /**
   * Get event roster with all volunteers and their attendance status (admin only)
   */
  async getEventRoster(eventId) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        assignments: {
          include: {
            volunteer: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Get all history records for this event
    const historyRecords = await prisma.volunteerHistory.findMany({
      where: { eventId }
    });

    // Build roster with attendance status
    const roster = event.assignments.map(assignment => {
      const history = historyRecords.find(h => h.volunteerId === assignment.volunteerId);

      return {
        volunteerId: assignment.volunteerId,
        volunteerName: `${assignment.volunteer.profile.firstName} ${assignment.volunteer.profile.lastName}`,
        email: assignment.volunteer.email,
        phone: assignment.volunteer.profile.phone,
        assignmentStatus: assignment.status,
        attendance: history?.attendance || 'PENDING',
        participationStatus: history?.status || 'REGISTERED',
        checkedIn: !!history?.participationDate,
        checkedOut: !!history?.completionDate,
        checkInTime: history?.participationDate,
        checkOutTime: history?.completionDate,
        hoursWorked: history?.hoursWorked || 0,
        performanceRating: history?.performanceRating,
        feedback: history?.feedback,
        adminNotes: history?.adminNotes,
        historyId: history?.id
      };
    });

    return {
      event: {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status
      },
      roster,
      summary: {
        total: roster.length,
        present: roster.filter(r => r.attendance === 'PRESENT').length,
        late: roster.filter(r => r.attendance === 'LATE').length,
        absent: roster.filter(r => r.attendance === 'ABSENT').length,
        noShow: roster.filter(r => r.participationStatus === 'NO_SHOW').length,
        checkedIn: roster.filter(r => r.checkedIn).length,
        checkedOut: roster.filter(r => r.checkedOut).length
      }
    };
  }

  /**
   * Update volunteer attendance (admin only)
   */
  async updateAttendance(eventId, volunteerId, updateData, adminId) {
    // Verify assignment exists
    const assignment = await prisma.assignment.findFirst({
      where: {
        eventId,
        volunteerId
      }
    });

    if (!assignment) {
      throw new Error('Volunteer is not assigned to this event');
    }

    // Prepare update data
    const data = {
      recordedBy: adminId
    };

    if (updateData.attendance) {
      data.attendance = updateData.attendance;
    }

    if (updateData.status) {
      data.status = updateData.status;
    }

    if (updateData.hoursWorked !== undefined) {
      data.hoursWorked = updateData.hoursWorked;
      // Auto-set status to COMPLETED when hours are recorded
      if (updateData.hoursWorked > 0 && !updateData.status) {
        data.status = 'COMPLETED';
        data.completionDate = new Date();
      }
    }

    if (updateData.performanceRating !== undefined) {
      data.performanceRating = updateData.performanceRating;
    }

    if (updateData.feedback) {
      data.feedback = updateData.feedback;
    }

    if (updateData.adminNotes) {
      data.adminNotes = updateData.adminNotes;
    }

    if (updateData.skillsUtilized) {
      data.skillsUtilized = updateData.skillsUtilized;
    }

    // Create or update history record
    const historyRecord = await prisma.volunteerHistory.upsert({
      where: {
        volunteerId_eventId: {
          volunteerId,
          eventId
        }
      },
      update: data,
      create: {
        volunteerId,
        eventId,
        assignmentId: assignment.id,
        status: data.status || 'REGISTERED',
        attendance: data.attendance || 'PENDING',
        hoursWorked: data.hoursWorked || 0,
        participationDate: new Date(),
        ...data
      },
      include: {
        volunteer: {
          include: { profile: true }
        },
        event: true
      }
    });

    return historyRecord;
  }

  /**
   * Bulk update attendance for multiple volunteers
   */
  async bulkUpdateAttendance(eventId, updates, adminId) {
    const results = [];
    let updated = 0;
    let failed = 0;

    for (const update of updates) {
      try {
        const result = await this.updateAttendance(
          eventId,
          update.volunteerId,
          update.data || update,
          adminId
        );
        results.push({ volunteerId: update.volunteerId, success: true, data: result });
        updated++;
      } catch (error) {
        results.push({ volunteerId: update.volunteerId, success: false, error: error.message });
        failed++;
      }
    }

    return {
      updated,
      failed,
      results
    };
  }

  /**
   * Finalize event attendance (mark event as completed, auto-checkout volunteers)
   */
  async finalizeEventAttendance(eventId, adminId) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        assignments: {
          include: {
            volunteer: {
              include: { profile: true }
            }
          }
        }
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Get all history records
    const historyRecords = await prisma.volunteerHistory.findMany({
      where: { eventId }
    });

    const updates = [];

    // Process each assignment
    for (const assignment of event.assignments) {
      const history = historyRecords.find(h => h.volunteerId === assignment.volunteerId);

      if (!history) {
        // No check-in record - mark as NO_SHOW
        const newRecord = await prisma.volunteerHistory.create({
          data: {
            volunteerId: assignment.volunteerId,
            eventId,
            assignmentId: assignment.id,
            status: 'NO_SHOW',
            attendance: 'ABSENT',
            hoursWorked: 0,
            participationDate: event.startDate,
            recordedBy: adminId
          }
        });
        updates.push({ volunteerId: assignment.volunteerId, action: 'marked_no_show', record: newRecord });
      } else if (history.status === 'CONFIRMED' && history.attendance === 'PRESENT') {
        // Checked in but not checked out - auto checkout
        const eventEnd = new Date(event.endDate);
        const checkInTime = new Date(history.participationDate);
        const hoursWorked = this.calculateHoursWorked(checkInTime, eventEnd);

        const updatedRecord = await prisma.volunteerHistory.update({
          where: { id: history.id },
          data: {
            status: 'COMPLETED',
            completionDate: eventEnd,
            hoursWorked,
            recordedBy: adminId,
            adminNotes: history.adminNotes
              ? `${history.adminNotes}\nAuto-checked out at event end.`
              : 'Auto-checked out at event end.'
          }
        });
        updates.push({ volunteerId: assignment.volunteerId, action: 'auto_checkout', record: updatedRecord });
      }
    }

    // Mark event as completed
    await prisma.event.update({
      where: { id: eventId },
      data: { status: 'COMPLETED' }
    });

    return {
      eventId,
      status: 'finalized',
      updates,
      summary: {
        totalVolunteers: event.assignments.length,
        autoCheckedOut: updates.filter(u => u.action === 'auto_checkout').length,
        markedNoShow: updates.filter(u => u.action === 'marked_no_show').length
      }
    };
  }

  /**
   * Mark volunteer as no-show
   */
  async markNoShow(eventId, volunteerId, adminId, options = {}) {
    const assignment = await prisma.assignment.findFirst({
      where: {
        eventId,
        volunteerId
      },
      include: {
        volunteer: {
          include: { profile: true }
        },
        event: true
      }
    });

    if (!assignment) {
      throw new Error('Volunteer is not assigned to this event');
    }

    // Create or update history record as NO_SHOW
    const historyRecord = await prisma.volunteerHistory.upsert({
      where: {
        volunteerId_eventId: {
          volunteerId,
          eventId
        }
      },
      update: {
        status: 'NO_SHOW',
        attendance: 'ABSENT',
        hoursWorked: 0,
        recordedBy: adminId,
        adminNotes: options.adminNotes
      },
      create: {
        volunteerId,
        eventId,
        assignmentId: assignment.id,
        status: 'NO_SHOW',
        attendance: 'ABSENT',
        hoursWorked: 0,
        participationDate: assignment.event.startDate,
        recordedBy: adminId,
        adminNotes: options.adminNotes
      }
    });

    // Send notification if requested
    if (options.sendNotification) {
      try {
        await NotificationService.createNotification({
          recipientId: volunteerId,
          type: 'SYSTEM',
          priority: 'HIGH',
          title: 'Marked as No-Show',
          message: `You were marked as a no-show for the event "${assignment.event.title}". Please contact us if this was an error.`,
          eventId
        });
      } catch (error) {
        console.error('Failed to send no-show notification:', error);
      }
    }

    return historyRecord;
  }

  /**
   * Calculate hours worked between two timestamps
   */
  calculateHoursWorked(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return Math.max(0, Math.round(hours * 100) / 100); // Round to 2 decimal places
  }
}

module.exports = new AttendanceService();
