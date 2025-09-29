import nodemailer from 'nodemailer';
import { generateVerificationToken, generatePasswordResetToken } from './tokenUtils.js';

// Lazy loading functions - only execute when called
const getEmailConfig = () => ({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const getEmailSettings = () => ({
  from: {
    name: process.env.APP_NAME || 'Placement Portal',
    address: process.env.EMAIL_USER || process.env.EMAIL_FROM || "NONE"
  },
  baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
});

// Create transporter
let transporter;

/**
 * Initialize email transporter
 */
const initializeTransporter = () => {
  try {
    // Get config when actually needed
    const emailConfig = getEmailConfig();
    
    console.log('=== EMAIL DEBUG ===');
    console.log('EMAIL_USER:', emailConfig.auth.user);
    console.log('EMAIL_PASSWORD:', emailConfig.auth.pass ? 'SET' : 'UNDEFINED');
    console.log('EMAIL_SERVICE:', emailConfig.service);
    console.log('===================');
    
    transporter = nodemailer.createTransport(emailConfig);
    console.log('Email service initialized successfully');
  } catch (error) {
    console.error('Email service initialization failed:', error);
    throw error;
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async () => {
  try {
    if (!transporter) initializeTransporter();
    
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return { success: true, message: 'Email service is ready' };
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send basic email utility
 * @param {Object} options - Email options
 * @returns {Promise<Object>} Send result
 */
export const sendEmail = async (options) => {
  try {
    if (!transporter) initializeTransporter();

    // Get settings when actually needed
    const emailSettings = getEmailSettings();
    
    const mailOptions = {
      from: emailSettings.from.address,
      to: options.to,
      subject: options.subject,
      text: options.message || options.text,
      html: options.html
    };

    console.log(`
  email_user: ${process.env.EMAIL_USER},
  email_password: ${process.env.EMAIL_PASSWORD ? 'SET' : 'UNDEFINED'},
  email_settings.from.name: ${emailSettings.from.name},
  email_settings.from.address: ${emailSettings.from.address},
  email_settings.base_url: ${emailSettings.baseUrl},
  email_settings.support_email: ${emailSettings.supportEmail},
`);

    console.log(`
      mailoptions.from: ${mailOptions.from},
      option.to: ${mailOptions.to},
      option.subject: ${mailOptions.subject},
      option.text: ${mailOptions.text},
    `);

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
    
    return { 
      success: true, 
      messageId: result.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Generate verification link
 * @param {String} token - Verification token
 * @param {String} userType - 'admin', 'institution', 'student'
 * @returns {String} Verification URL
 */
const generateVerificationLink = (token, userType) => {
  const emailSettings = getEmailSettings(); // Use lazy loading
  return `${emailSettings.baseUrl}/verify-email?token=${token}&type=${userType}`;
};

/**
 * Generate password reset link
 * @param {String} token - Reset token
 * @param {String} userType - 'admin', 'institution', 'student'
 * @returns {String} Reset URL
 */
const generatePasswordResetLink = (token, userType) => {
  const emailSettings = getEmailSettings(); // Use lazy loading
  return `${emailSettings.baseUrl}/reset-password?token=${token}&type=${userType}`;
};

/**
 * Send admin welcome email
 * @param {Object} admin - Admin user object
 * @returns {Promise<Object>} Send result
 */
export const sendAdminWelcomeEmail = async (admin) => {
  const emailSettings = getEmailSettings(); // Get settings when needed
  const subject = 'Welcome to Placement Portal - Admin Access Granted';
  
  const text = `
Hello ${admin.fullName},

Welcome to the Placement Portal Admin Panel! Your administrator account has been created successfully.

Admin Details:
- Name: ${admin.fullName}
- Email: ${admin.email}
- Role: Platform Administrator
- Status: Active

Login URL: ${emailSettings.baseUrl}/admin/login

Security Guidelines:
- Never share your admin credentials
- Use strong passwords
- Log out from shared devices
- Monitor system activity regularly

Best regards,
Placement Portal Team
  `;

  return await sendEmail({
    to: admin.email,
    subject,
    text
  });
};

/**
 * Send institution registration confirmation
 * @param {Object} institution - Institution object
 * @param {Object} institutionAdmin - Institution admin object
 * @returns {Promise<Object>} Send result
 */
export const sendInstitutionRegistrationEmail = async (institution, institutionAdmin) => {
  const emailSettings = getEmailSettings(); // Get settings when needed
  const subject = 'Registration Submitted - Pending Admin Approval';
  
  const text = `
Dear ${institutionAdmin.fullName},

Thank you for registering ${institution.name} with Placement Portal.

Registration Details:
- Institution: ${institution.name}
- Type: ${institution.type}
- Domain: ${institution.domain}
- Admin: ${institutionAdmin.fullName}
- Position: ${institutionAdmin.position}
- Status: PENDING APPROVAL

What's Next:
1. Our team will review your institution details
2. You'll receive approval confirmation via email
3. Once approved, students can register with ${institution.domain} emails
4. Login access will be granted after approval

Review typically takes 2-3 business days.

Best regards,
Placement Portal Team

Support: ${emailSettings.supportEmail}
  `;

  return await sendEmail({
    to: institutionAdmin.email,
    subject,
    text
  });
};

/**
 * Send institution approval email
 * @param {Object} institution - Institution object
 * @param {Object} institutionAdmin - Institution admin object
 * @returns {Promise<Object>} Send result
 */
export const sendInstitutionApprovalEmail = async (institution, institutionAdmin) => {
  const emailSettings = getEmailSettings(); // Get settings when needed
  const subject = '🎉 Institution Approved - Welcome to Placement Portal!';
  
  const text = `
Dear ${institutionAdmin.fullName},

Congratulations! ${institution.name} has been APPROVED for Placement Portal.

You can now:
- Login to your admin dashboard
- Manage student registrations
- Post placement opportunities  
- Track applications and placements
- Generate reports

Login URL: ${emailSettings.baseUrl}/institution/login

Student Registration:
Students can now register using ${institution.domain} email addresses.

Welcome aboard!
Placement Portal Team

Admin Guide: ${emailSettings.baseUrl}/help/admin-guide
Support: ${emailSettings.supportEmail}
  `;

  return await sendEmail({
    to: institutionAdmin.email,
    subject,
    text
  });
};

/**
 * Send institution rejection email
 * @param {Object} institution - Institution object
 * @param {Object} institutionAdmin - Institution admin object
 * @param {String} reason - Rejection reason
 * @returns {Promise<Object>} Send result
 */
export const sendInstitutionRejectionEmail = async (institution, institutionAdmin, reason) => {
  const emailSettings = getEmailSettings(); // Get settings when needed
  const subject = 'Institution Registration - Additional Information Required';
  
  const text = `
Dear ${institutionAdmin.fullName},

Thank you for your interest in Placement Portal. We need additional information for ${institution.name} before approval.

Reason: ${reason}

Next Steps:
1. Review the reason above
2. Gather required information/documentation
3. Contact support with updated information
4. We'll review your resubmission promptly

This is standard verification to ensure platform security.

Contact Support: ${emailSettings.supportEmail}
Subject: Re-submission for ${institution.name}

Best regards,
Placement Portal Team
  `;

  return await sendEmail({
    to: institutionAdmin.email,
    subject,
    text
  });
};

/**
 * Send student verification email
 * @param {Object} student - Student object
 * @param {String} verificationToken - Email verification token
 * @returns {Promise<Object>} Send result
 */
export const sendStudentVerificationEmail = async (student, verificationToken) => {
  const verificationLink = generateVerificationLink(verificationToken, 'student');
  const subject = 'Welcome to Placement Portal - Verify Your Email';
  
  const text = `
Hello ${student.fullName},

Welcome to Placement Portal! Please verify your email to complete registration.

Student Details:
- Name: ${student.fullName}
- Email: ${student.email}
- Student ID: ${student.studentId}
- Course: ${student.academicInfo.course}

Verify Email: ${verificationLink}

This link expires in 24 hours.

After verification, you can:
- Complete your profile
- Browse placement opportunities
- Submit applications
- Track application status

Best regards,
Placement Portal Team

Note: This link expires in 24 hours. Contact support if you need a new link.
  `;

  return await sendEmail({
    to: student.email,
    subject,
    text
  });
};

/**
 * Send institution admin verification email
 * @param {Object} institutionAdmin - Institution admin object
 * @param {String} verificationToken - Email verification token
 * @returns {Promise<Object>} Send result
 */
export const sendInstitutionAdminVerificationEmail = async (institutionAdmin, verificationToken) => {
  const verificationLink = generateVerificationLink(verificationToken, 'institution');
  const subject = 'Verify Your Email - Institution Admin Account';
  
  const text = `
Hello ${institutionAdmin.fullName},

Please verify your email address for your Institution Admin account.

Verification Link: ${verificationLink}

This link expires in 24 hours.

Note: Your institution must be approved by platform admin before you can access the dashboard.

Best regards,
Placement Portal Team
  `;

  return await sendEmail({
    to: institutionAdmin.email,
    subject,
    text
  });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {String} resetToken - Password reset token
 * @param {String} userType - 'admin', 'institution', 'student'
 * @returns {Promise<Object>} Send result
 */
export const sendPasswordResetEmail = async (user, resetToken, userType) => {
  const emailSettings = getEmailSettings(); // Get settings when needed
  const resetLink = generatePasswordResetLink(resetToken, userType);
  const subject = 'Password Reset Request - Placement Portal';
  
  const text = `
Hello ${user.fullName},

You requested a password reset for your Placement Portal account.

Reset Password: ${resetLink}

This link expires in 1 hour for security.

If you didn't request this reset, please ignore this email.

Best regards,
Placement Portal Team

Support: ${emailSettings.supportEmail}
  `;

  return await sendEmail({
    to: user.email,
    subject,
    text
  });
};

/**
 * Send notification email
 * @param {String} to - Recipient email
 * @param {String} subject - Email subject
 * @param {String} message - Email message
 * @param {Object} data - Additional data for template
 * @returns {Promise<Object>} Send result
 */
export const sendNotificationEmail = async (to, subject, message, data = {}) => {
  const emailSettings = getEmailSettings(); // Get settings when needed
  
  const text = `
${message}

${data.additionalInfo ? `Additional Information:\n${data.additionalInfo}` : ''}

Best regards,
Placement Portal Team

${data.actionUrl ? `Action Required: ${data.actionUrl}` : ''}
${data.supportNote ? `Support: ${emailSettings.supportEmail}` : ''}
  `;

  return await sendEmail({
    to,
    subject,
    text
  });
};

/**
 * Send placement notification to students
 * @param {Array} studentEmails - Array of student emails
 * @param {Object} placement - Placement opportunity object
 * @returns {Promise<Array>} Array of send results
 */
export const sendPlacementNotification = async (studentEmails, placement) => {
  const emailSettings = getEmailSettings(); // Get settings when needed
  const subject = `New Placement Opportunity: ${placement.title}`;
  
  const text = `
New Placement Opportunity Available!

Position: ${placement.title}
Company: ${placement.company}
Location: ${placement.location}
Deadline: ${new Date(placement.deadline).toLocaleDateString()}

View Details: ${emailSettings.baseUrl}/student/placements/${placement._id}

Don't miss this opportunity! Apply before the deadline.

Best regards,
Placement Portal Team
  `;

  const results = [];
  
  for (const email of studentEmails) {
    try {
      const result = await sendEmail({
        to: email,
        subject,
        text
      });
      results.push({ email, ...result });
    } catch (error) {
      results.push({ email, success: false, error: error.message });
    }
  }
  
  return results;
};

/**
 * Send bulk emails with rate limiting
 * @param {Array} emailList - Array of email objects { to, subject, text }
 * @param {Number} delay - Delay between emails in ms (default: 1000)
 * @returns {Promise<Array>} Array of send results
 */
export const sendBulkEmails = async (emailList, delay = 1000) => {
  const results = [];
  
  for (let i = 0; i < emailList.length; i++) {
    try {
      const result = await sendEmail(emailList[i]);
      results.push({ index: i, ...result });
      
      // Add delay to avoid rate limiting
      if (i < emailList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      results.push({ 
        index: i, 
        success: false, 
        error: error.message,
        email: emailList[i].to 
      });
    }
  }
  
  return results;
};

// Export getter function instead of constant
export const getEmailSettingsForExport = getEmailSettings;