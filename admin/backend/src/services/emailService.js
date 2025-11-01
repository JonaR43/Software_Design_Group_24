/**
 * Email Service Module
 * Provides email notification functionality using Nodemailer
 * Supports Gmail, Outlook, and custom SMTP configurations
 * Professional templates matching JACS ShiftPilot brand design
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;

    // JACS ShiftPilot Brand Colors (matching frontend)
    this.brandColors = {
      primary: '#4f46e5',      // indigo-600
      primaryDark: '#4338ca',  // indigo-700
      secondary: '#7c3aed',    // violet-600
      secondaryDark: '#6d28d9',// violet-700
      accent: '#0284c7',       // sky-600
      accentAlt: '#c026d3',    // fuchsia-600
      textPrimary: '#1e293b',  // slate-800
      textSecondary: '#475569',// slate-600
      border: '#e0e7ff',       // indigo-100
      background: '#f8fafc',   // slate-50
      white: '#ffffff'
    };
  }

  /**
   * Get professional email template base
   */
  getEmailTemplate(content) {
    const { primary, primaryDark, secondary, accent, textPrimary, textSecondary, border, background, white } = this.brandColors;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JACS ShiftPilot</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: ${textPrimary};
      background: linear-gradient(to bottom, #e0e7ff, #ddd6fe, #f1f5f9);
      padding: 0;
      margin: 0;
    }
    .email-wrapper {
      width: 100%;
      background: linear-gradient(to bottom, #e0e7ff, #ddd6fe, #f1f5f9);
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: ${white};
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .email-header {
      background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo-container {
      margin-bottom: 20px;
    }
    .logo {
      width: 64px;
      height: 64px;
      background: ${white};
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      color: ${primary};
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    .header-title {
      font-size: 28px;
      font-weight: 700;
      color: ${white};
      margin: 0;
      letter-spacing: -0.025em;
    }
    .header-tagline {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 8px;
    }
    .email-body {
      padding: 40px 30px;
    }
    .content-section {
      margin-bottom: 24px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: ${textPrimary};
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      color: ${textSecondary};
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, ${primary} 0%, ${primaryDark} 50%, ${accent} 100%);
      color: ${white};
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .info-card {
      background: ${background};
      border: 1px solid ${border};
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .info-card-title {
      font-size: 20px;
      font-weight: 700;
      color: ${primary};
      margin-bottom: 16px;
    }
    .info-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid ${border};
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: ${textPrimary};
      min-width: 100px;
      margin-right: 16px;
    }
    .info-value {
      color: ${textSecondary};
      flex: 1;
    }
    .alert-card {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
    }
    .alert-card .info-card-title {
      color: #f59e0b;
    }
    .list {
      margin: 16px 0;
      padding-left: 20px;
    }
    .list-item {
      color: ${textSecondary};
      margin-bottom: 8px;
    }
    .divider {
      height: 1px;
      background: ${border};
      margin: 32px 0;
    }
    .email-footer {
      background: ${background};
      padding: 30px;
      text-align: center;
      border-top: 1px solid ${border};
    }
    .footer-text {
      font-size: 14px;
      color: ${textSecondary};
      margin-bottom: 16px;
    }
    .footer-links {
      margin: 16px 0;
    }
    .footer-link {
      color: ${primary};
      text-decoration: none;
      margin: 0 12px;
      font-size: 14px;
    }
    .footer-link:hover {
      text-decoration: underline;
    }
    .copyright {
      font-size: 12px;
      color: ${textSecondary};
      margin-top: 16px;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .email-body {
        padding: 30px 20px;
      }
      .email-header {
        padding: 30px 20px;
      }
      .header-title {
        font-size: 24px;
      }
      .info-row {
        flex-direction: column;
      }
      .info-label {
        margin-bottom: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="email-header">
        <div class="logo-container">
          <div class="logo">🛡️</div>
        </div>
        <h1 class="header-title">JACS ShiftPilot</h1>
        <p class="header-tagline">Helping hands, smarter shifts</p>
      </div>

      <!-- Body Content -->
      <div class="email-body">
        ${content}
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p class="footer-text">
          <strong>JACS ShiftPilot</strong><br>
          Volunteer Management System
        </p>
        <div class="footer-links">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="footer-link">Dashboard</a>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/events" class="footer-link">Events</a>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/profile" class="footer-link">Profile</a>
        </div>
        <p class="copyright">
          © ${new Date().getFullYear()} JACS ShiftPilot. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Initialize the email service with configuration from environment variables
   */
  async initialize() {
    try {
      const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';

      // Configuration based on provider
      let transportConfig = {};

      if (emailProvider === 'gmail') {
        // Gmail configuration
        transportConfig = {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
          }
        };
      } else if (emailProvider === 'outlook') {
        // Outlook/Hotmail configuration
        transportConfig = {
          service: 'hotmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        };
      } else if (emailProvider === 'custom') {
        // Custom SMTP configuration
        transportConfig = {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        };
      } else if (emailProvider === 'ethereal') {
        // Ethereal (testing) - auto-generates credentials
        const testAccount = await nodemailer.createTestAccount();
        transportConfig = {
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        };
        console.log('📧 Ethereal Email Test Account Created:');
        console.log('   User:', testAccount.user);
        console.log('   Pass:', testAccount.pass);
      }

      this.transporter = nodemailer.createTransport(transportConfig);

      // Verify connection
      if (emailProvider !== 'ethereal') {
        await this.transporter.verify();
        console.log('✅ Email service initialized successfully');
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Send a plain text email
   */
  async sendEmail({ to, subject, text, html }) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.transporter) {
      throw new Error('Email service not initialized');
    }

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'JACS ShiftPilot'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      // For Ethereal, log preview URL
      if (process.env.EMAIL_PROVIDER === 'ethereal') {
        console.log('📧 Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send welcome email to new volunteers
   */
  async sendWelcomeEmail(userEmail, userName) {
    const subject = `Welcome to ${process.env.APP_NAME || 'JACS ShiftPilot'}! 🎉`;

    const text = `Hi ${userName},\n\nWelcome to JACS ShiftPilot! We're excited to have you join our volunteer community.\n\nYou can now:\n- Browse volunteer opportunities\n- Register for events\n- Track your volunteer hours\n- Connect with other volunteers\n\nLog in to your dashboard to get started: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard\n\nBest regards,\nThe JACS ShiftPilot Team`;

    const content = `
      <div class="content-section">
        <h2 class="greeting">Welcome, ${userName}! 🎉</h2>
        <p class="text">
          We're thrilled to have you join our volunteer community at JACS ShiftPilot. Your commitment to making a difference is what makes our community special.
        </p>
      </div>

      <div class="info-card">
        <h3 class="info-card-title">Get Started with ShiftPilot</h3>
        <p class="text" style="margin-bottom: 12px;">Here's what you can do now:</p>
        <ul class="list">
          <li class="list-item"><strong>Browse Events:</strong> Discover volunteer opportunities that match your interests</li>
          <li class="list-item"><strong>Register for Activities:</strong> Sign up for events with just one click</li>
          <li class="list-item"><strong>Track Your Impact:</strong> Monitor your volunteer hours and contributions</li>
          <li class="list-item"><strong>Build Your Profile:</strong> Customize your volunteer profile and preferences</li>
          <li class="list-item"><strong>Connect:</strong> Meet and collaborate with other volunteers</li>
        </ul>
      </div>

      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
          Go to Your Dashboard
        </a>
      </div>

      <div class="content-section">
        <p class="text">
          If you have any questions or need assistance, don't hesitate to reach out. We're here to help you make the most of your volunteer experience!
        </p>
        <p class="text" style="margin-top: 24px;">
          <strong>Happy volunteering!</strong><br>
          The JACS ShiftPilot Team
        </p>
      </div>
    `;

    const html = this.getEmailTemplate(content);
    return this.sendEmail({ to: userEmail, subject, text, html });
  }

  /**
   * Send event registration confirmation
   */
  async sendEventRegistrationEmail(userEmail, userName, eventDetails) {
    const subject = `✅ Event Registration Confirmed: ${eventDetails.title}`;

    const text = `Hi ${userName},\n\nYou've successfully registered for: ${eventDetails.title}\n\nEvent Details:\nDate: ${eventDetails.date}\nTime: ${eventDetails.time}\nLocation: ${eventDetails.location}\n\nWe look forward to seeing you there!\n\nBest regards,\nThe JACS ShiftPilot Team`;

    const content = `
      <div class="content-section">
        <h2 class="greeting">Registration Confirmed! ✅</h2>
        <p class="text">
          Hi ${userName},
        </p>
        <p class="text">
          Great news! You've successfully registered for the volunteer event below. We're excited to have you join us!
        </p>
      </div>

      <div class="info-card">
        <h3 class="info-card-title">${eventDetails.title}</h3>
        <div class="info-row">
          <span class="info-label">📅 Date:</span>
          <span class="info-value">${eventDetails.date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Time:</span>
          <span class="info-value">${eventDetails.time}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📍 Location:</span>
          <span class="info-value">${eventDetails.location}</span>
        </div>
        ${eventDetails.description ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e0e7ff;">
          <p class="text" style="margin-bottom: 8px;"><strong>About this event:</strong></p>
          <p class="text">${eventDetails.description}</p>
        </div>
        ` : ''}
      </div>

      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/schedule" class="button">
          View My Schedule
        </a>
      </div>

      <div class="content-section">
        <p class="text">
          <strong>What to bring:</strong> Please arrive 10 minutes early. We'll provide all necessary materials and equipment.
        </p>
        <p class="text">
          If you need to cancel or have any questions, please update your registration through your dashboard or contact us directly.
        </p>
        <p class="text" style="margin-top: 24px;">
          Thank you for volunteering with us!<br>
          The JACS ShiftPilot Team
        </p>
      </div>
    `;

    const html = this.getEmailTemplate(content);
    return this.sendEmail({ to: userEmail, subject, text, html });
  }

  /**
   * Send event reminder email
   */
  async sendEventReminderEmail(userEmail, userName, eventDetails) {
    const subject = `⏰ Reminder: ${eventDetails.title} - Coming Up Soon!`;

    const text = `Hi ${userName},\n\nThis is a friendly reminder that you're registered for: ${eventDetails.title}\n\nEvent Details:\nDate: ${eventDetails.date}\nTime: ${eventDetails.time}\nLocation: ${eventDetails.location}\n\nSee you soon!\n\nBest regards,\nThe JACS ShiftPilot Team`;

    const content = `
      <div class="content-section">
        <h2 class="greeting">Event Reminder ⏰</h2>
        <p class="text">
          Hi ${userName},
        </p>
        <p class="text">
          This is a friendly reminder that you're registered for an upcoming volunteer event. We're looking forward to seeing you there!
        </p>
      </div>

      <div class="alert-card">
        <h3 class="info-card-title">${eventDetails.title}</h3>
        <div class="info-row">
          <span class="info-label">📅 Date:</span>
          <span class="info-value">${eventDetails.date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Time:</span>
          <span class="info-value">${eventDetails.time}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📍 Location:</span>
          <span class="info-value">${eventDetails.location}</span>
        </div>
      </div>

      <div class="content-section">
        <p class="text">
          <strong>Quick reminders:</strong>
        </p>
        <ul class="list">
          <li class="list-item">Please arrive 10 minutes before the start time</li>
          <li class="list-item">Wear comfortable clothing appropriate for the activity</li>
          <li class="list-item">Bring water and any personal items you may need</li>
          <li class="list-item">Check your dashboard for any last-minute updates</li>
        </ul>
      </div>

      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/schedule" class="button">
          View Event Details
        </a>
      </div>

      <div class="content-section">
        <p class="text">
          If you can no longer attend, please cancel through your dashboard as soon as possible so we can offer your spot to another volunteer.
        </p>
        <p class="text" style="margin-top: 24px;">
          See you soon!<br>
          The JACS ShiftPilot Team
        </p>
      </div>
    `;

    const html = this.getEmailTemplate(content);
    return this.sendEmail({ to: userEmail, subject, text, html });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const subject = '🔐 Password Reset Request - JACS ShiftPilot';

    const text = `Hi ${userName},\n\nWe received a request to reset your password for your JACS ShiftPilot account.\n\nClick here to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request this password reset, please ignore this email and your password will remain unchanged.\n\nBest regards,\nThe JACS ShiftPilot Team`;

    const content = `
      <div class="content-section">
        <h2 class="greeting">Password Reset Request 🔐</h2>
        <p class="text">
          Hi ${userName},
        </p>
        <p class="text">
          We received a request to reset the password for your JACS ShiftPilot account. If you made this request, click the button below to create a new password.
        </p>
      </div>

      <div class="button-container">
        <a href="${resetUrl}" class="button">
          Reset Your Password
        </a>
      </div>

      <div class="info-card">
        <h3 class="info-card-title">Security Information</h3>
        <p class="text" style="margin-bottom: 12px;">Please note:</p>
        <ul class="list">
          <li class="list-item"><strong>Expires in 1 hour:</strong> This link is valid for only 60 minutes</li>
          <li class="list-item"><strong>One-time use:</strong> The link can only be used once</li>
          <li class="list-item"><strong>Secure connection:</strong> Always verify you're on the official JACS ShiftPilot website</li>
        </ul>
      </div>

      <div class="content-section">
        <p class="text">
          <strong>Didn't request this?</strong> If you didn't ask to reset your password, you can safely ignore this email. Your password will not be changed.
        </p>
        <p class="text" style="margin-top: 16px; padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <strong>Alternative link:</strong> If the button doesn't work, copy and paste this URL into your browser:<br>
          <span style="word-break: break-all; font-size: 13px; color: #475569;">${resetUrl}</span>
        </p>
        <p class="text" style="margin-top: 24px;">
          Stay safe,<br>
          The JACS ShiftPilot Security Team
        </p>
      </div>
    `;

    const html = this.getEmailTemplate(content);
    return this.sendEmail({ to: userEmail, subject, text, html });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(userEmail, userName, notification) {
    const subject = notification.subject || '📬 New Notification - JACS ShiftPilot';

    const text = `Hi ${userName},\n\n${notification.message}\n\n${notification.actionUrl ? `View details: ${notification.actionUrl}\n\n` : ''}Best regards,\nThe JACS ShiftPilot Team`;

    const content = `
      <div class="content-section">
        <h2 class="greeting">Hi ${userName}! 👋</h2>
        <p class="text">
          ${notification.message}
        </p>
      </div>

      ${notification.actionUrl ? `
      <div class="button-container">
        <a href="${notification.actionUrl}" class="button">
          ${notification.actionText || 'View Details'}
        </a>
      </div>
      ` : ''}

      ${notification.additionalInfo ? `
      <div class="info-card">
        <p class="text">${notification.additionalInfo}</p>
      </div>
      ` : ''}

      <div class="content-section">
        <p class="text" style="margin-top: 24px;">
          Thank you for being part of our volunteer community!<br>
          The JACS ShiftPilot Team
        </p>
      </div>
    `;

    const html = this.getEmailTemplate(content);
    return this.sendEmail({ to: userEmail, subject, text, html });
  }
}

// Export singleton instance
module.exports = new EmailService();
