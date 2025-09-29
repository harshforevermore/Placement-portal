import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../../models/admin/admin.js';
import { generateTokenPair } from '../../utils/tokenUtils.js';
import { sendEmail } from '../../utils/emailService.js';
import { validateAdminCode } from '../../utils/validation.js';
import Admin from '../../models/admin/admin.js';

dotenv.config();

// ==================== ADMIN LOGIN ====================
export const adminLogin = async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;

    // Verify admin code
    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin code'
      });
    }

    // Find admin user
    const user = await User.findOne({ 
      email, 
      role: 'admin',
      isActive: true 
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
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

    // Log admin login activity
    console.log(`🔐 Admin login: ${user.email} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          adminProfile: user.adminProfile,
          lastLogin: user.lastLogin
        },
        accessToken,
        refreshToken
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
    const { firstName, lastName, email, password, adminCode, adminLevel = 'standard' } = req.body;

    // Validate required fields using your validation utils
    if (!adminCode) {
      return res.status(400).json({
        success: false,
        message: 'Admin code is required'
      });
    }

    // Validate admin code format
    if (!validateAdminCode(adminCode)) {
      return res.status(400).json({
        success: false,
        message: 'Admin code must be 6 alphanumeric characters'
      });
    }

    // Check if admin already exists
    console.log("line 1");
    const existingAdmin = await Admin.findOne({ email }); // Use Admin model, not User
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }
    console.log("line 2");
    
    // Determine permissions based on admin level
    const permissions = adminLevel === 'super' 
      ? ['user_management', 'institution_approval', 'system_settings', 'reports']
      : ['user_management', 'institution_approval'];
      
    console.log("line 3");
    
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
    console.log("line 4");
    
    await adminUser.save();

    // Generate tokens
    const data = {
      id: adminUser.id,
      role: 'admin', // Set role for JWT
      email: adminUser.email
    };
    console.log("line 5");
    const { accessToken, refreshToken } = generateTokenPair(data);
    
    console.log("line 6");
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
        },
        accessToken,
        refreshToken
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
// export const adminRegister = async (req, res) => {
//   console.log("Admin Register Executed");
//   try {
//     const { firstName, lastName, email, password, adminLevel = 'standard' } = req.body;

//     // Check if admin already exists
//     console.log("line 1");
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'Admin with this email already exists'
//       });
//     }
//     console.log("line 2");
    
//     // Determine permissions based on admin level
//     const permissions = adminLevel === 'super' 
//       ? ['user_management', 'institution_approval', 'system_settings', 'reports']
//       : ['user_management', 'institution_approval'];
      
//       console.log("line 3");
//       // Create admin user
//       const adminUser = new User({
//       firstName,
//       lastName,
//       email,
//       password,
//       role: 'admin',
//       isVerified: true, // Admins are auto-verified
//       adminProfile: {
//         adminLevel,
//         permissions
//       }
//     });
//     console.log("line 4");
    
//     await adminUser.save();

//     // Generate tokens
//     const data = {
//       id: adminUser.id,
//       role: adminUser.role,
//       email: adminUser.email
//     };
//     console.log("line 5");
//     const { accessToken, refreshToken } = generateTokenPair(data);
    
//     console.log("line 6");
//     // Log admin creation
//     console.log(`👤 New admin created: ${adminUser.email} (${adminLevel}) at ${new Date().toISOString()}`);

//     res.status(201).json({
//       success: true,
//       message: 'Admin registration successful',
//       data: {
//         user: {
//           id: adminUser._id,
//           firstName: adminUser.firstName,
//           lastName: adminUser.lastName,
//           email: adminUser.email,
//           role: adminUser.role,
//           adminProfile: adminUser.adminProfile
//         },
//         accessToken,
//         refreshToken
//       }
//     });

//   } catch (error) {
//     console.error('❌ Admin registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during admin registration'
//     });
//   }
// };

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