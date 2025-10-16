
const userRepository = require('../database/repositories/userRepository');
const eventRepository = require('../database/repositories/eventRepository');
const historyRepository = require('../database/repositories/historyRepository');
const papaparse = require('papaparse');
const PDFDocument = require('pdfkit-table');

class ReportingService {
  async getVolunteerReportData() {
    const users = await userRepository.findAll();
    const volunteers = users.filter(user => user.role.toLowerCase() === 'volunteer');
    const reportData = [];

    for (const volunteer of volunteers) {
      const profile = await userRepository.getProfile(volunteer.id);
      const history = await historyRepository.getVolunteerHistory(volunteer.id);
      reportData.push({
        volunteer,
        profile,
        history,
      });
    }

    return reportData;
  }

  async getEventReportData() {
    const { events } = await eventRepository.findAll();
    const reportData = [];

    for (const event of events) {
      const assignments = await eventRepository.getAssignments(event.id);
      reportData.push({
        event,
        assignments,
      });
    }

    return reportData;
  }

  async generateVolunteerCsv(data) {
    const csvData = [];
    data.forEach(item => {
      if (item.history.length > 0) {
        item.history.forEach(historyItem => {
          csvData.push({
            'Volunteer ID': item.volunteer.id,
            'Username': item.volunteer.username,
            'Email': item.volunteer.email,
            'First Name': item.profile ? item.profile.firstName : '',
            'Last Name': item.profile ? item.profile.lastName : '',
            'Event ID': historyItem.eventId,
            'Event Title': historyItem.event ? historyItem.event.title : 'N/A',
            'Participation Status': historyItem.status,
            'Hours Worked': historyItem.hoursWorked,
          });
        });
      } else {
        csvData.push({
          'Volunteer ID': item.volunteer.id,
          'Username': item.volunteer.username,
          'Email': item.volunteer.email,
          'First Name': item.profile ? item.profile.firstName : '',
          'Last Name': item.profile ? item.profile.lastName : '',
          'Event ID': 'N/A',
          'Event Title': 'N/A',
          'Participation Status': 'N/A',
          'Hours Worked': 'N/A',
        });
      }
    });

    return papaparse.unparse(csvData);
  }

  async generateEventCsv(data) {
    const csvData = [];
    data.forEach(item => {
      if (item.assignments.length > 0) {
        item.assignments.forEach(assignment => {
          csvData.push({
            'Event ID': item.event.id,
            'Event Title': item.event.title,
            'Start Date': item.event.startDate,
            'End Date': item.event.endDate,
            'Status': item.event.status,
            'Volunteer ID': assignment.volunteerId,
            'Volunteer Username': assignment.volunteer ? assignment.volunteer.username : 'N/A',
            'Assignment Status': assignment.status,
          });
        });
      } else {
        csvData.push({
            'Event ID': item.event.id,
            'Event Title': item.event.title,
            'Start Date': item.event.startDate,
            'End Date': item.event.endDate,
            'Status': item.event.status,
            'Volunteer ID': 'N/A',
            'Volunteer Username': 'N/A',
            'Assignment Status': 'N/A',
        });
      }
    });

    return papaparse.unparse(csvData);
  }

  async generateVolunteerPdf(data, res) {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .text('Volunteer Participation Report', { align: 'center' });
    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleDateString()}`)

    doc.moveDown(2);

    // Summary
    const totalVolunteers = data.length;
    const totalParticipation = data.reduce((sum, item) => sum + item.history.length, 0);

    doc
      .fontSize(12)
      .text(`Total Volunteers: ${totalVolunteers}`)
      .text(`Total Participations: ${totalParticipation}`)

    doc.moveDown(2);

    // Content
    const tableData = {
      title: "Volunteer Participation",
      headers: ["Volunteer", "Email", "Event Title", "Status", "Hours Worked"],
      rows: [],
    };

    data.forEach(item => {
      if (item.history.length > 0) {
        item.history.forEach(historyItem => {
          tableData.rows.push([
            `${item.profile?.firstName || ''} ${item.profile?.lastName || ''} (${item.volunteer.username})`,
            item.volunteer.email,
            historyItem.event ? historyItem.event.title : 'N/A',
            historyItem.status,
            historyItem.hoursWorked,
          ]);
        });
      } else {
        tableData.rows.push([
          `${item.profile?.firstName || ''} ${item.profile?.lastName || ''} (${item.volunteer.username})`,
          item.volunteer.email,
          'N/A',
          'N/A',
          'N/A',
        ]);
      }
    });

    doc.table(tableData, { 
      width: 500,
      prepareHeader: () => doc.font('Helvetica-Bold'),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(10)
    });

    // Footer
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 50, { align: 'center' });
    }

    doc.end();
  }

  async generateEventPdf(data, res) {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .text('Event Volunteer Assignment Report', { align: 'center' });
    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleDateString()}`)

    doc.moveDown(2);

    // Summary
    const totalEvents = data.length;
    const totalAssignments = data.reduce((sum, item) => sum + item.assignments.length, 0);

    doc
      .fontSize(12)
      .text(`Total Events: ${totalEvents}`)
      .text(`Total Assignments: ${totalAssignments}`)

    doc.moveDown(2);

    // Content
    const tableData = {
      title: "Event Assignments",
      headers: ["Event Title", "Date", "Status", "Volunteer", "Assignment Status"],
      rows: [],
    };

    data.forEach(item => {
      if (item.assignments.length > 0) {
        item.assignments.forEach(assignment => {
          tableData.rows.push([
            item.event.title,
            new Date(item.event.startDate).toLocaleDateString(),
            item.event.status,
            assignment.volunteer ? assignment.volunteer.username : 'N/A',
            assignment.status,
          ]);
        });
      } else {
        tableData.rows.push([
          item.event.title,
          new Date(item.event.startDate).toLocaleDateString(),
          item.event.status,
          'N/A',
          'N/A',
        ]);
      }
    });

    doc.table(tableData, { 
      width: 500,
      prepareHeader: () => doc.font('Helvetica-Bold'),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(10)
    });

    // Footer
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 50, { align: 'center' });
    }

    doc.end();
  }
}

module.exports = new ReportingService();
