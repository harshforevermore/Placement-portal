import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../../models/student/student.js';
import Institution from '../../models/institution/institution.js';
import { generateTokenPair } from '../../utils/tokenUtils.js';
import { sendEmail } from '../../utils/emailService.js';

// ==================== STUDENT LOGIN ====================
export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student user
    const user = await User.findOne({ 
      email, 
      role: 'student',
      isActive: true 
    }).select('+password').populate('institutionId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if institution exists and is approved
    if (!user.institutionId) {
      return res.status(401).json({
        success: false,
        message: 'No institution associated with this account'
      });
    }

    if (user.institutionId.status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Your institution is not approved yet. Please contact your institution administrator.',
        institutionStatus: user.institutionId.status
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const data = {
      id: user.id,
      role: user.role,
      email: user.email
    };
    const { accessToken, refreshToken } = generateTokenPair(data);

    // Log student login
    console.log(`👨‍🎓 Student login: ${user.email} (${user.studentProfile.rollNumber}) at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Student login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          institutionId: user.institutionId._id,
          institution: {
            name: user.institutionId.name,
            type: user.institutionId.type
          },
          studentProfile: user.studentProfile,
          lastLogin: user.lastLogin,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during student login'
    });
  }
};

// ==================== STUDENT REGISTER ====================
export const studentRegister = async (req, res) => {
  try {
    const { 
      name, email, password, 
      institutionId, rollNumber, course, branch, year,
      phone, dateOfBirth
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if roll number exists in the same institution
    const existingRollNumber = await User.findOne({ 
      'studentProfile.rollNumber': rollNumber,
      institutionId: institutionId
    });
    if (existingRollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Roll number already exists in this institution'
      });
    }

    // Verify institution exists and is approved
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(400).json({
        success: false,
        message: 'Institution not found'
      });
    }

    if (institution.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Institution is not approved yet. Cannot register students.',
        institutionStatus: institution.status
      });
    }

    // Validate email domain (optional - if institution requires specific domain)
    const emailDomain = email.split('@')[1];
    const institutionEmail = institution.email;
    const institutionDomain = institutionEmail.split('@')[1];

    // enforce institutional email domains
    if (emailDomain !== institutionDomain) {
      return res.status(400).json({
        success: false,
        message: `Please use your institutional email domain (@${institutionDomain})`
      });
    }

    // Create student user
    const studentUser = new User({
      name,
      email,
      password,
      role: 'student',
      institutionId,
      isVerified: false, // Requires email verification
      studentProfile: {
        rollNumber,
        course,
        branch,
        year,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
      }
    });

    await studentUser.save();

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    studentUser.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    studentUser.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await studentUser.save();

    // Send verification email
    try {
      await sendEmail({
        email: studentUser.email,
        subject: 'Verify Your Student Account',
        message: `
          Welcome to the Placement Portal!
          
          Please verify your student account by clicking the link below:
          ${process.env.CLIENT_URL}/verify-email/${verificationToken}
          
          Student Details:
          Name: ${name}
          Roll Number: ${rollNumber}
          Institution: ${institution.name}
          Course: ${course} - ${branch}
          Year: ${year}
          
          This link will expire in 24 hours.
        `
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue with registration even if email fails
    }

    // Log student registration
    console.log(`👨‍🎓 New student registered: ${rollNumber} (${email}) at ${institution.name} - ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Student registration successful. Please check your email for verification.',
      data: {
        userId: studentUser._id,
        institutionName: institution.name,
        rollNumber: studentUser.studentProfile.rollNumber,
        course: studentUser.studentProfile.course,
        branch: studentUser.studentProfile.branch,
        year: studentUser.studentProfile.year,
        verificationRequired: true
      }
    });

  } catch (error) {
    console.error('❌ Student registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during student registration'
    });
  }
};

// ==================== STUDENT EMAIL VERIFICATION ====================
export const verifyStudentEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash token and find user
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
      role: 'student'
    }).populate('institutionId');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Verify user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    // Log email verification
    console.log(`✅ Student email verified: ${user.email} (${user.studentProfile.rollNumber}) at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Email verification successful. You can now login to your account.',
      data: {
        isVerified: true,
        institutionName: user.institutionId.name,
        rollNumber: user.studentProfile.rollNumber
      }
    });

  } catch (error) {
    console.error('❌ Student email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// ==================== STUDENT FORGOT PASSWORD ====================
export const studentForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, role: 'student' }).populate('institutionId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Student Password Reset Request',
        message: `
          Hello ${user.name},
          
          You requested a password reset for your student account.
          
          Student Details:
          Roll Number: ${user.studentProfile.rollNumber}
          Institution: ${user.institutionId.name}
          
          You can reset your password by clicking the link below:
          ${process.env.CLIENT_URL}/student/reset-password/${resetToken}
          
          This link will expire in 10 minutes.
          
          If you didn't request this, please ignore this email.
        `
      });

      // Log password reset request
      console.log(`🔑 Student password reset requested: ${user.email} (${user.studentProfile.rollNumber}) at ${new Date().toISOString()}`);

      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }

  } catch (error) {
    console.error('❌ Student forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// ==================== STUDENT RESET PASSWORD ====================
export const studentResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token and find user
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
      role: 'student'
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save();

    // Log password reset
    console.log(`🔐 Student password reset completed: ${user.email} (${user.studentProfile.rollNumber}) at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Student password reset successful'
    });

  } catch (error) {
    console.error('❌ Student reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// ==================== UPDATE STUDENT PROFILE ====================
export const updateStudentProfile = async (req, res) => {
  try {
    const { 
      name, phone, dateOfBirth, 
      course, branch, year, cgpa, 
      skills, address 
    } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update basic profile information
    if (name) user.name = name;
    
    // Update student profile
    if (phone) user.studentProfile.phone = phone;
    if (dateOfBirth) user.studentProfile.dateOfBirth = new Date(dateOfBirth);
    if (course) user.studentProfile.course = course;
    if (branch) user.studentProfile.branch = branch;
    if (year) user.studentProfile.year = year;
    if (cgpa) user.studentProfile.cgpa = cgpa;
    if (skills) user.studentProfile.skills = skills;
    if (address) user.studentProfile.address = address;
    
    await user.save();

    res.json({
      success: true,
      message: 'Student profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentProfile: user.studentProfile
        }
      }
    });

  } catch (error) {
    console.error('❌ Student profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// ==================== STUDENT CHANGE PASSWORD ====================
export const studentChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const student = await User.findById(userId).select('+password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, student.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password
    student.password = newPassword;
    await student.save();

    // Log password change
    console.log(`🔐 Student password changed: ${student.email} (${student.studentProfile.rollNumber}) at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Student change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

// ==================== GET STUDENT DASHBOARD DATA ====================
export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('institutionId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get basic dashboard data (can be expanded later)
    const dashboardData = {
      student: {
        name: user.name,
        email: user.email,
        rollNumber: user.studentProfile.rollNumber,
        course: user.studentProfile.course,
        branch: user.studentProfile.branch,
        year: user.studentProfile.year,
        cgpa: user.studentProfile.cgpa,
        isVerified: user.isVerified
      },
      institution: {
        name: user.institutionId.name,
        type: user.institutionId.type,
        status: user.institutionId.status
      },
      profile: {
        completeness: calculateProfileCompleteness(user.studentProfile),
        missingFields: getMissingProfileFields(user.studentProfile)
      },
      // These would be populated from other collections in a real app
      stats: {
        applicationsSubmitted: 0,
        interviewsScheduled: 0,
        placementOffers: 0,
        profileViews: 0
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

// ==================== HELPER FUNCTIONS ====================
const calculateProfileCompleteness = (profile) => {
  const fields = ['rollNumber', 'course', 'branch', 'year', 'phone', 'dateOfBirth', 'cgpa', 'skills', 'address'];
  const completedFields = fields.filter(field => {
    const value = profile[field];
    return value !== undefined && value !== null && value !== '';
  });
  
  return Math.round((completedFields.length / fields.length) * 100);
};

const getMissingProfileFields = (profile) => {
  const fieldLabels = {
    phone: 'Phone Number',
    dateOfBirth: 'Date of Birth',
    cgpa: 'CGPA',
    skills: 'Skills',
    address: 'Address',
    resume: 'Resume',
    profilePicture: 'Profile Picture'
  };
  
  const missingFields = [];
  Object.keys(fieldLabels).forEach(field => {
    const value = profile[field];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      missingFields.push(fieldLabels[field]);
    }
  });
  
  return missingFields;
};