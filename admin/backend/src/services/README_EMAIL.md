# Email Notification Module

A complete, free email notification system for JACS ShiftPilot using Nodemailer.

## 📦 What's Included

- **Email Service** (`emailService.js`) - Core email functionality
- **6 Pre-built Templates**:
  - Welcome emails
  - Event registration confirmations
  - Event reminders
  - Password reset
  - Custom notifications
  - Generic emails

## 🚀 Quick Start

### 1. Configuration

Edit `/admin/backend/.env`:

```env
# For testing (no setup required)
EMAIL_PROVIDER=ethereal

# For production with Gmail (free)
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 2. Usage

```javascript
const emailService = require('./services/emailService');

// Send welcome email
await emailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

## 🧪 Testing

Run the test script:

```bash
node test-email.js
```

This will send all 6 email types and display preview URLs.

## 📚 Documentation

- **Full Guide**: `/admin/backend/EMAIL_SERVICE_GUIDE.md`
- **Integration Examples**: `/admin/backend/EMAIL_INTEGRATION_EXAMPLES.md`
- **Test Script**: `/admin/backend/test-email.js`

## 💰 Cost

**$0** - Completely free!

- Uses Nodemailer (free library)
- Works with Gmail (500 emails/day free)
- Ethereal for testing (unlimited, free)

## ✨ Features

- Multiple email providers
- Beautiful HTML templates
- Responsive design
- Easy integration
- Non-blocking sends
- Test mode included

## 🔧 Available Methods

```javascript
// Welcome email
sendWelcomeEmail(email, name)

// Event registration
sendEventRegistrationEmail(email, name, eventDetails)

// Event reminder
sendEventReminderEmail(email, name, eventDetails)

// Password reset
sendPasswordResetEmail(email, name, resetToken)

// Custom notification
sendNotificationEmail(email, name, notification)

// Custom email
sendEmail({ to, subject, text, html })
```

## 📝 Example Integration

```javascript
// In authController.js
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
  // ... registration logic ...

  // Send welcome email (non-blocking)
  emailService.sendWelcomeEmail(
    user.email,
    `${user.firstName} ${user.lastName}`
  ).catch(console.error);

  res.json({ message: 'User registered' });
};
```

## 🛠️ Setup for Production

### Gmail Setup

1. Enable 2-Step Verification
2. Create App Password: https://myaccount.google.com/apppasswords
3. Update `.env` with credentials

### Other Providers

See `EMAIL_SERVICE_GUIDE.md` for Outlook, custom SMTP, SendGrid, etc.

## ⚡ Performance Tips

1. **Don't await** - Use `.catch()` instead
2. **Check preferences** - Respect user notification settings
3. **Use queues** - For bulk emails, implement a job queue
4. **Rate limits** - Be aware of provider daily limits

## 🐛 Troubleshooting

**Emails not sending?**
- Check `.env` configuration
- Verify email credentials
- Test with `EMAIL_PROVIDER=ethereal` first

**Gmail "Invalid login"?**
- Use App Password, not account password
- Enable 2-Step Verification

See full troubleshooting guide in `EMAIL_SERVICE_GUIDE.md`.

## 📖 Support

- Nodemailer docs: https://nodemailer.com/
- See `EMAIL_SERVICE_GUIDE.md` for detailed help

---

**Ready to use!** Just configure `.env` and start sending emails. 📧
