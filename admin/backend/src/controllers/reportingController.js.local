
const reportingService = require('../services/reportingService');

class ReportingController {
  async getVolunteerReport(req, res, next) {
    try {
      const { format = 'json' } = req.query;
      const data = await reportingService.getVolunteerReportData();

      switch (format.toLowerCase()) {
        case 'csv':
          const csv = await reportingService.generateVolunteerCsv(data);
          res.header('Content-Type', 'text/csv');
          res.attachment('volunteer-report.csv');
          res.send(csv);
          break;
        case 'pdf':
          res.header('Content-Type', 'application/pdf');
          res.attachment('volunteer-report.pdf');
          await reportingService.generateVolunteerPdf(data, res);
          break;
        default:
          res.json(data);
      }
    } catch (error) {
      next(error);
    }
  }

  async getEventReport(req, res, next) {
    try {
      const { format = 'json' } = req.query;
      const data = await reportingService.getEventReportData();

      switch (format.toLowerCase()) {
        case 'csv':
          const csv = await reportingService.generateEventCsv(data);
          res.header('Content-Type', 'text/csv');
          res.attachment('event-report.csv');
          res.send(csv);
          break;
        case 'pdf':
          res.header('Content-Type', 'application/pdf');
          res.attachment('event-report.pdf');
          await reportingService.generateEventPdf(data, res);
          break;
        default:
          res.json(data);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportingController();
