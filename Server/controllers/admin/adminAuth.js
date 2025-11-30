import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
// import User from '../../models/admin/admin.js';
import { generateTokenPair, getDeviceInfo } from '../../utils/tokenUtils.js';
import { sendEmail } from '../../utils/emailService.js';
import { validateAdminCode } from '../../utils/validation.js';
import Admin from '../../models/admin/admin.js';
import RefreshToken from '../../models/refreshToken.js';
import { accessTokenCookieOptions, refreshTokenCookieOptions } from '../../utils/tokenUtils.js';

dotenv.config();

// ==================== ADMIN LOGIN ====================
export const adminLogin = async (req, res) => {
  console.log("adminLogin Executed");
  try {
    const { email, password, adminCode } = req.body;

    // Find admin user
    const admin = await Admin.findOne({ 
      email,
      adminCode,
      isActive: true 
    }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate tokens
    const data = {
      role: admin.role,
      email: admin.email
    };
    const { accessToken, refreshToken } = generateTokenPair(data);

    //save refresh token to database
    await RefreshToken.create({
      token: refreshToken,
      userId: admin._id,
      userModel: 'Admin',
      userRole: 'admin',
      email: admin.email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      deviceInfo: getDeviceInfo(req)
    });

    // Log admin login activity
    console.log(`🔐 Admin login: ${admin.email} at ${new Date().toISOString()}`);

    //send access and refresh tokens as cookies
    res.cookie('accT', accessToken, accessTokenCookieOptions);
    res.cookie('refT', refreshToken, refreshTokenCookieOptions);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          adminProfile: admin.adminProfile,
          lastLogin: admin.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
};

// ==================== ADMIN REGISTER ====================
export const adminRegister = async (req, res) => {
  console.log("Admin Register Executed");
  try {
    console.log("line 1");
    const { firstName, lastName, email, password, adminCode, adminLevel = 'standard' } = req.body;
    
    console.log("Req.body: ", req.body);
    
    // Validate required fields using your validation utils
    if (!adminCode) {
      return res.status(400).json({
        success: false,
        message: 'Admin code is required'
      });
    }
    console.log("line 2");
    
    // Validate admin code format
    if (!validateAdminCode(adminCode)) {
      return res.status(400).json({
        success: false,
        message: 'Admin code must be 6 alphanumeric characters'
      });
    }
    console.log("line 3");
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email }); // Use Admin model, not User
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }
    console.log("line 4");
    
    // Determine permissions based on admin level
    const permissions = adminLevel === 'super' 
      ? ['user_management', 'institution_approval', 'system_settings', 'reports']
      : ['user_management', 'institution_approval'];
      
    
    // Create admin user with Admin model
    const adminUser = new Admin({
      firstName,
      lastName,
      email,
      password,
      adminCode, // Include the adminCode
      adminLevel,
      permissions,
      isVerified: true // Admins are auto-verified
    });
    console.log("line 4.5");
    
    await adminUser.save();

    // Log admin creation
    console.log(`👤 New admin created: ${adminUser.email} (${adminLevel}) at ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Admin registration successful',
      data: {
        user: {
          id: adminUser._id,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          email: adminUser.email,
          role: 'admin',
          adminLevel: adminUser.adminLevel,
          permissions: adminUser.permissions
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin registration'
    });
  }
};

// ==================== ADMIN PASSWORD RESET ====================
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found with this email'
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
        subject: 'Admin Password Reset Request',
        message: `You can reset your admin password by clicking: ${process.env.CLIENT_URL}/admin/reset-password/${resetToken}`
      });

      // Log password reset request
      console.log(`🔑 Admin password reset requested: ${user.email} at ${new Date().toISOString()}`);

      res.json({
        success: true,
        message: 'Password reset email sent to admin'
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
    console.error('❌ Admin forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// ==================== ADMIN RESET PASSWORD ====================
export const adminResetPassword = async (req, res) => {
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
      role: 'admin'
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
    console.log(`🔐 Admin password reset completed: ${user.email} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Admin password reset successful'
    });

  } catch (error) {
    console.error('❌ Admin reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// ==================== ADMIN PROFILE UPDATE ====================
export const updateAdminProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const adminId = req.user._id;

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update basic profile information
    if (name) admin.name = name;
    
    await admin.save();

    res.json({
      success: true,
      message: 'Admin profile updated successfully',
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          adminProfile: admin.adminProfile
        }
      }
    });

  } catch (error) {
    console.error('❌ Admin profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// ==================== ADMIN CHANGE PASSWORD ====================
export const adminChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user._id;

    const admin = await User.findById(adminId).select('+password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password
    admin.password = newPassword;
    await admin.save();

    // Log password change
    console.log(`🔐 Admin password changed: ${admin.email} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Admin change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};