/**
 * Email Service Test Script
 * Run with: node test-email.js
 */

require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmails() {
  console.log('🧪 Testing Email Service...\n');
  console.log('Provider:', process.env.EMAIL_PROVIDER || 'ethereal');
  console.log('─'.repeat(50));

  try {
    // Test 1: Welcome Email
    console.log('\n📧 Test 1: Welcome Email');
    const result1 = await emailService.sendWelcomeEmail(
      'test@example.com',
      'John Doe'
    );
    console.log('Status:', result1.success ? '✅ Success' : '❌ Failed');
    if (result1.previewUrl) {
      console.log('Preview:', result1.previewUrl);
    }
    if (!result1.success) {
      console.log('Error:', result1.error);
    }

    // Test 2: Event Registration
    console.log('\n📧 Test 2: Event Registration Email');
    const eventDetails = {
      title: 'Community Food Drive',
      date: 'Saturday, October 15, 2025',
      time: '9:00 AM - 12:00 PM',
      location: '123 Main Street, Your City, State 12345',
      description: 'Help us collect food for local families in need. We\'ll be accepting non-perishable items.'
    };
    const result2 = await emailService.sendEventRegistrationEmail(
      'volunteer@example.com',
      'Jane Smith',
      eventDetails
    );
    console.log('Status:', result2.success ? '✅ Success' : '❌ Failed');
    if (result2.previewUrl) {
      console.log('Preview:', result2.previewUrl);
    }

    // Test 3: Event Reminder
    console.log('\n📧 Test 3: Event Reminder Email');
    const reminderDetails = {
      title: 'Community Food Drive',
      date: 'Tomorrow, October 15',
      time: '9:00 AM',
      location: '123 Main Street'
    };
    const result3 = await emailService.sendEventReminderEmail(
      'volunteer@example.com',
      'Jane Smith',
      reminderDetails
    );
    console.log('Status:', result3.success ? '✅ Success' : '❌ Failed');
    if (result3.previewUrl) {
      console.log('Preview:', result3.previewUrl);
    }

    // Test 4: Password Reset
    console.log('\n📧 Test 4: Password Reset Email');
    const resetToken = 'abc123xyz789token';
    const result4 = await emailService.sendPasswordResetEmail(
      'user@example.com',
      'John Doe',
      resetToken
    );
    console.log('Status:', result4.success ? '✅ Success' : '❌ Failed');
    if (result4.previewUrl) {
      console.log('Preview:', result4.previewUrl);
    }

    // Test 5: Custom Notification
    console.log('\n📧 Test 5: Custom Notification Email');
    const notification = {
      subject: 'New Volunteer Opportunity',
      message: 'A new volunteer event matching your interests has been posted! Click below to view details and register.',
      actionUrl: 'http://localhost:5173/dashboard/events',
      actionText: 'View Event'
    };
    const result5 = await emailService.sendNotificationEmail(
      'volunteer@example.com',
      'Jane Smith',
      notification
    );
    console.log('Status:', result5.success ? '✅ Success' : '❌ Failed');
    if (result5.previewUrl) {
      console.log('Preview:', result5.previewUrl);
    }

    // Test 6: Custom Email
    console.log('\n📧 Test 6: Custom Email');
    const result6 = await emailService.sendEmail({
      to: 'custom@example.com',
      subject: 'Test Custom Email',
      text: 'This is a plain text custom email.',
      html: '<h2>Custom Email</h2><p>This is a <strong>custom HTML</strong> email.</p>'
    });
    console.log('Status:', result6.success ? '✅ Success' : '❌ Failed');
    if (result6.previewUrl) {
      console.log('Preview:', result6.previewUrl);
    }

    console.log('\n' + '─'.repeat(50));
    console.log('✅ All email tests completed!\n');

    if (process.env.EMAIL_PROVIDER === 'ethereal') {
      console.log('💡 Using Ethereal Email (test mode)');
      console.log('   Emails are not actually sent - use preview URLs to view them\n');
    }

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    console.error('\nFull error:', error);
  }
}

// Run tests
testEmails().catch(console.error);
