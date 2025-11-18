/**
 * Tests for Email Service
 */

// Mock nodemailer before requiring emailService
const mockSendMail = jest.fn();
const mockTransporter = {
  sendMail: mockSendMail,
  verify: jest.fn().mockResolvedValue(true)
};

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransporter),
  createTestAccount: jest.fn(),
  getTestMessageUrl: jest.fn()
}));

jest.mock('mailgun.js', () => jest.fn());
jest.mock('form-data', () => jest.fn());

process.env.EMAIL_PROVIDER = 'gmail';
process.env.EMAIL_USER = 'test@gmail.com';
process.env.EMAIL_PASSWORD = 'password';
process.env.APP_NAME = 'JACS ShiftPilot Test';
process.env.FRONTEND_URL = 'http://localhost:5173';

const emailService = require('../../src/services/emailService');

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Manually set service as initialized for testing
    emailService.initialized = true;
    emailService.transporter = mockTransporter;
    emailService.emailProvider = 'gmail';
    mockSendMail.mockResolvedValue({ messageId: 'test-id' });
  });

  describe('getEmailTemplate', () => {
    it('should generate HTML template with content', () => {
      const content = '<p>Test content</p>';
      const result = emailService.getEmailTemplate(content);

      expect(result).toContain(content);
      expect(result).toContain('JACS ShiftPilot');
      expect(result).toContain('Helping hands, smarter shifts');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      await emailService.sendWelcomeEmail('user@example.com', 'John Doe');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Welcome')
        })
      );
    });
  });

  describe('sendEventRegistrationEmail', () => {
    it('should send event registration email', async () => {
      const eventDetails = {
        title: 'Test Event',
        date: '2025-12-01',
        time: '10:00 AM',
        location: '123 Main St'
      };

      await emailService.sendEventRegistrationEmail(
        'user@example.com',
        'John Doe',
        eventDetails
      );

      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  describe('sendEventReminderEmail', () => {
    it('should send event reminder email', async () => {
      const eventDetails = {
        title: 'Test Event',
        date: '2025-12-01',
        time: '10:00 AM',
        location: '123 Main St'
      };

      await emailService.sendEventReminderEmail(
        'user@example.com',
        'John Doe',
        eventDetails
      );

      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      await emailService.sendPasswordResetEmail(
        'user@example.com',
        'John Doe',
        'reset-token-123'
      );

      expect(mockSendMail).toHaveBeenCalled();
      const call = mockSendMail.mock.calls[0][0];
      expect(call.html).toContain('reset-token-123');
    });
  });

  describe('sendCheckInConfirmationEmail', () => {
    it('should send check-in confirmation email', async () => {
      const eventDetails = {
        title: 'Test Event',
        location: '123 Main St'
      };
      const checkInTime = new Date();

      await emailService.sendCheckInConfirmationEmail(
        'user@example.com',
        'John Doe',
        eventDetails,
        checkInTime
      );

      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  describe('sendCheckOutConfirmationEmail', () => {
    it('should send check-out confirmation email', async () => {
      const eventDetails = {
        title: 'Test Event',
        location: '123 Main St'
      };
      const checkInTime = new Date('2025-12-01T10:00:00');
      const checkOutTime = new Date('2025-12-01T14:00:00');

      await emailService.sendCheckOutConfirmationEmail(
        'user@example.com',
        'John Doe',
        eventDetails,
        checkInTime,
        checkOutTime,
        4
      );

      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  describe('sendNoShowNotificationEmail', () => {
    it('should send no-show notification email', async () => {
      const eventDetails = {
        title: 'Test Event',
        date: '2025-12-01',
        time: '10:00 AM',
        location: '123 Main St'
      };

      await emailService.sendNoShowNotificationEmail(
        'user@example.com',
        'John Doe',
        eventDetails,
        'Admin notes'
      );

      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  describe('sendNotificationEmail', () => {
    it('should send notification email', async () => {
      const notification = {
        subject: 'Test Notification',
        message: 'Test message',
        actionUrl: 'http://test.com',
        actionText: 'Click here'
      };

      await emailService.sendNotificationEmail(
        'user@example.com',
        'John Doe',
        notification
      );

      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test body',
        html: '<p>Test</p>'
      });

      expect(result.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalled();
    });

    it('should handle send errors', async () => {
      mockSendMail.mockRejectedValue(new Error('Send failed'));

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Send failed');
    });

    it('should auto-initialize if not initialized', async () => {
      emailService.initialized = false;
      emailService.transporter = null;
      mockSendMail.mockResolvedValue({ messageId: 'test' });

      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Test'
      });

      // Should initialize and then send
      expect(mockSendMail).toHaveBeenCalled();
    });

    it('should use html fallback when html not provided', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test' });

      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Text body'
      });

      const call = mockSendMail.mock.calls[0][0];
      expect(call.html).toBe('Text body');
    });
  });

  describe('Brand colors and template', () => {
    it('should have correct brand colors', () => {
      expect(emailService.brandColors.primary).toBe('#4f46e5');
      expect(emailService.brandColors.secondary).toBe('#7c3aed');
    });

    it('should include responsive styles in template', () => {
      const template = emailService.getEmailTemplate('<p>Test</p>');
      expect(template).toContain('@media only screen');
      expect(template).toContain('max-width: 600px');
    });

    it('should include footer links in template', () => {
      const template = emailService.getEmailTemplate('<p>Test</p>');
      expect(template).toContain('dashboard');
      expect(template).toContain('events');
      expect(template).toContain('profile');
    });
  });
});
