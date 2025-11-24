
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
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      bufferPages: true
    });
    doc.pipe(res);

    // Define colors (matching app's indigo/violet theme)
    const primaryColor = '#4f46e5'; // Indigo-600
    const secondaryColor = '#7c3aed'; // Violet-600
    const textColor = '#1e293b'; // Slate-800
    const lightGray = '#f1f5f9'; // Slate-100
    const darkGray = '#64748b'; // Slate-500

    // Header background with gradient effect
    doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

    // Logo placeholder / Company name
    doc
      .fillColor('#ffffff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('JACS ShiftPilot', 40, 35, { align: 'left' });

    doc
      .fillColor('#ffffff')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Volunteer Participation Report', 40, 70);

    // Date and info
    doc
      .fillColor('#e0e7ff')
      .fontSize(11)
      .font('Helvetica')
      .text(`Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 40, 95);

    doc.moveDown(3);

    // Summary box
    const totalVolunteers = data.length;
    const totalParticipation = data.reduce((sum, item) => sum + item.history.length, 0);
    const totalHours = data.reduce((sum, item) =>
      sum + item.history.reduce((hSum, h) => hSum + (h.hoursWorked || 0), 0), 0
    );

    const summaryY = 140;
    const boxWidth = (doc.page.width - 120) / 3;

    // Summary cards
    [
      { label: 'Total Volunteers', value: totalVolunteers, color: primaryColor },
      { label: 'Total Participations', value: totalParticipation, color: secondaryColor },
      { label: 'Total Hours', value: totalHours.toFixed(1), color: '#10b981' } // Green-500
    ].forEach((stat, index) => {
      const x = 40 + (boxWidth + 10) * index;

      // Card background
      doc.roundedRect(x, summaryY, boxWidth, 60, 5).fill(lightGray);

      // Value
      doc
        .fillColor(stat.color)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(stat.value.toString(), x + 10, summaryY + 10, { width: boxWidth - 20, align: 'center' });

      // Label
      doc
        .fillColor(darkGray)
        .fontSize(10)
        .font('Helvetica')
        .text(stat.label, x + 10, summaryY + 40, { width: boxWidth - 20, align: 'center' });
    });

    doc.moveDown(6);

    // Table title
    doc
      .fillColor(textColor)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Detailed Participation Records', 40, doc.y + 20);

    doc.moveDown(2);

    // Table data
    const tableData = {
      headers: ["Volunteer", "Email", "Event", "Status", "Hours"],
      rows: [],
    };

    data.forEach(item => {
      if (item.history.length > 0) {
        item.history.forEach(historyItem => {
          tableData.rows.push([
            `${item.profile?.firstName || ''} ${item.profile?.lastName || ''}`.trim() || item.volunteer.username,
            item.volunteer.email,
            historyItem.event ? historyItem.event.title : 'N/A',
            historyItem.status,
            (historyItem.hoursWorked || 0).toString()
          ]);
        });
      } else {
        tableData.rows.push([
          `${item.profile?.firstName || ''} ${item.profile?.lastName || ''}`.trim() || item.volunteer.username,
          item.volunteer.email,
          'No events',
          '-',
          '0'
        ]);
      }
    });

    await doc.table(tableData, {
      width: doc.page.width - 80,
      prepareHeader: () => {
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff');
      },
      prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font('Helvetica').fontSize(9).fillColor('#1e293b');
        // Alternating row background
        if (indexRow % 2 === 0) {
          doc.addBackground(rectRow, '#f8fafc');
        }
      }
    });

    // Footer on all pages
    const range = doc.bufferedPageRange();
    const pageCount = range.count;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      // Footer line
      doc.strokeColor('#e2e8f0').lineWidth(1)
        .moveTo(40, doc.page.height - 60)
        .lineTo(doc.page.width - 40, doc.page.height - 60)
        .stroke();

      // Footer text
      doc.fillColor('#64748b').fontSize(9).font('Helvetica')
        .text(
          `JACS ShiftPilot Volunteer Management System`,
          40,
          doc.page.height - 45,
          { align: 'left', width: doc.page.width - 80 }
        );

      doc.fillColor('#64748b').fontSize(9)
        .text(
          `Page ${i + 1} of ${pageCount}`,
          40,
          doc.page.height - 45,
          { align: 'right', width: doc.page.width - 80 }
        );
    }

    doc.end();
  }

  async generateEventPdf(data, res) {
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      bufferPages: true
    });
    doc.pipe(res);

    // Define colors
    const primaryColor = '#4f46e5';
    const secondaryColor = '#7c3aed';
    const textColor = '#1e293b';
    const lightGray = '#f1f5f9';
    const darkGray = '#64748b';

    // Header background
    doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

    // Logo / Company name
    doc
      .fillColor('#ffffff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('JACS ShiftPilot', 40, 35, { align: 'left' });

    doc
      .fillColor('#ffffff')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Event Assignment Report', 40, 70);

    // Date
    doc
      .fillColor('#e0e7ff')
      .fontSize(11)
      .font('Helvetica')
      .text(`Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 40, 95);

    doc.moveDown(3);

    // Summary
    const totalEvents = data.length;
    const totalAssignments = data.reduce((sum, item) => sum + item.assignments.length, 0);
    const publishedEvents = data.filter(item => item.event.status === 'published').length;

    const summaryY = 140;
    const boxWidth = (doc.page.width - 120) / 3;

    [
      { label: 'Total Events', value: totalEvents, color: primaryColor },
      { label: 'Total Assignments', value: totalAssignments, color: secondaryColor },
      { label: 'Published Events', value: publishedEvents, color: '#10b981' }
    ].forEach((stat, index) => {
      const x = 40 + (boxWidth + 10) * index;

      doc.roundedRect(x, summaryY, boxWidth, 60, 5).fill(lightGray);

      doc
        .fillColor(stat.color)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(stat.value.toString(), x + 10, summaryY + 10, { width: boxWidth - 20, align: 'center' });

      doc
        .fillColor(darkGray)
        .fontSize(10)
        .font('Helvetica')
        .text(stat.label, x + 10, summaryY + 40, { width: boxWidth - 20, align: 'center' });
    });

    doc.moveDown(6);

    // Table title
    doc
      .fillColor(textColor)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Event Assignment Details', 40, doc.y + 20);

    doc.moveDown(2);

    // Table
    const tableData = {
      headers: ["Event", "Date", "Status", "Volunteer", "Assignment"],
      rows: [],
    };

    data.forEach(item => {
      if (item.assignments.length > 0) {
        item.assignments.forEach(assignment => {
          tableData.rows.push([
            item.event.title,
            new Date(item.event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            item.event.status,
            assignment.volunteer ? assignment.volunteer.username : 'N/A',
            assignment.status
          ]);
        });
      } else {
        tableData.rows.push([
          item.event.title,
          new Date(item.event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          item.event.status,
          'No volunteers',
          '-'
        ]);
      }
    });

    await doc.table(tableData, {
      width: doc.page.width - 80,
      prepareHeader: () => {
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff');
      },
      prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font('Helvetica').fontSize(9).fillColor('#1e293b');
        // Alternating row background
        if (indexRow % 2 === 0) {
          doc.addBackground(rectRow, '#f8fafc');
        }
      }
    });

    // Footer
    const range = doc.bufferedPageRange();
    const pageCount = range.count;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      doc.strokeColor('#e2e8f0').lineWidth(1)
        .moveTo(40, doc.page.height - 60)
        .lineTo(doc.page.width - 40, doc.page.height - 60)
        .stroke();

      doc.fillColor('#64748b').fontSize(9).font('Helvetica')
        .text(
          `JACS ShiftPilot Volunteer Management System`,
          40,
          doc.page.height - 45,
          { align: 'left', width: doc.page.width - 80 }
        );

      doc.fillColor('#64748b').fontSize(9)
        .text(
          `Page ${i + 1} of ${pageCount}`,
          40,
          doc.page.height - 45,
          { align: 'right', width: doc.page.width - 80 }
        );
    }

    doc.end();
  }
}

module.exports = new ReportingService();
