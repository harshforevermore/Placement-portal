import bcrypt from "bcryptjs";
import crypto from "crypto";
// import User from '../../models/institution/institutionAdmin.js';
import Institution from "../../models/institution/institution.js";
import { generateTokenPair, getDeviceInfo } from "../../utils/tokenUtils.js";
import { sendEmail } from "../../utils/emailService.js";
import { createInstitutionId } from "../../utils/institutionUtil.js";
import RefreshToken from "../../models/refreshToken.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../../utils/tokenUtils.js";

// ==================== INSTITUTION LOGIN ====================
export const institutionLogin = async (req, res) => {
  //More to do in this function
  console.log("Institution login");
  try {
    const { email, password, institutionId } = req.body;
    // Find institution admin user
    const institution = await Institution.findOne({
      email,
      institutionId
    })
    .select("+password")
    .populate("institutionId");
    
    
    if (!institution) {
      return res.status(401).json({
        success: false,
        message: "Institution not found",
      });
    }
    
    if (institution.status !== "approved") {
      return res.status(401).json({
        success: false,
        message: `Institution is ${institution.status}. Please wait for admin approval.`,
        institutionStatus: institution.status,
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      institution.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    
    // Update last login
    institution.lastLogin = new Date();
    await institution.save();
    
    // Generate tokens
    const data = {
      role: institution.role,
      email: institution.email,
    };
    const { accessToken, refreshToken } = generateTokenPair(data);

    //save refresh token to database
    await RefreshToken.create({
      token: refreshToken,
      userId: institution._id,
      userModel: 'Institution',
      userRole: 'institution',
      email: institution.email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7 days
      deviceInfo: getDeviceInfo(req)
    });
    
    // Log institution login
    console.log(
      `🏫 Institution login: ${institution.email} (${
        institution.institutionName
      }) at ${new Date().toISOString()}`
    );

    // Set cookies
    res.cookie('accT', accessToken, accessTokenCookieOptions);
    res.cookie('refT', refreshToken, refreshTokenCookieOptions);

    res.json({
      success: true,
      message: "Institution login successful",
      data: {
        user: {
          name: institution.institutionName,
          email: institution.email,
          role: institution.role,
          status: institution.status,
          type: institution.institutionType,
          lastLogin: institution.lastLogin,
        }
      },
    });
  } catch (error) {
    console.error("❌ Institution login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during institution login",
    });
  }
};

// ==================== INSTITUTION REGISTER ====================
export const institutionRegister = async (req, res) => {
  console.log("institution Register");
  const {
    email,
    emailDomain,
    password,
    institutionName,
    institutionType,
    phone,
    website,
    street,
    city,
    state,
    zipCode,
    country,
    establishedYear,
  } = req.body;
  try {
    // Check if institution already exists
    const existingInstitution = await Institution.findOne({
      $or: [{ email: email }, { institutionName: institutionName }],
    });

    if (existingInstitution) {
      return res.status(400).json({
        success: false,
        message: "Institution with this name or email already exists",
      });
    }

    // Create institution with session
    const institution = new Institution({
      institutionName,
      institutionType,
      email,
      emailDomain,
      password,
      contactInfo: {
        phone,
        website
      },
      address: {
        street,
        city,
        state,
        zipCode,
        country
      },
      establishedYear,
      status: "pending",
    });

    // Generate email verification token using the schema method
    const verificationToken = institution.generateVerificationToken();

    //create institutionId
    const institutionId = await createInstitutionId(institution.institutionName);

    institution.institutionId = institutionId;
    await institution.save();

    // Send verification email
    await sendEmail({
      to: institution.email,
      subject: "Verify Your Institution Account",
      message: `
          Welcome to the Placement Portal!
          
          Please verify your institution account by clicking the link below:
          ${process.env.FRONTEND_URL}/verify-email/${verificationToken}
          
          Institution: ${institutionName}
          Status: Pending Admin Approval
          
          After email verification, your institution will be reviewed by our admin team.
          
          This link will expire in 24 hours.
        `,
    });

    // Log institution registration
    console.log(
      `🏫 New institution registered: ${institutionName} by ${email} at ${new Date().toISOString()}`
    );

    res.status(201).json({
      success: true,
      message:
        "Institution registration successful. Please check your email for verification and wait for admin approval.",
      data: {
        institutionId: institution._id,
        institutionName: institution.institutionName,
        institutionType: institution.institutionType,
        status: institution.status,
        verificationRequired: true,
      },
    });
  } catch (error) {
    // Rollback the transaction on any error
    try {
      await Institution.deleteOne({ email: email });
      console.log(
        `🧹 Auto-cleanup performed for failed registration: ${email}`
      );
    } catch (error) {
      console.log(
        "Error occured while cleaning up the institution: ",
        error.message
      );
    }

    console.error("❌ Institution registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during institution registration",
    });
  }
};

// ==================== INSTITUTION FORGOT PASSWORD ====================
export const institutionForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, role: "institution" });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Institution not found with this email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      await sendEmail({
        email: user.email,
        subject: "Institution Password Reset Request",
        message: `You can reset your institution password by clicking: ${process.env.CLIENT_URL}/institution/reset-password/${resetToken}`,
      });

      // Log password reset request
      console.log(
        `🔑 Institution password reset requested: ${
          user.email
        } at ${new Date().toISOString()}`
      );

      res.json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    console.error("❌ Institution forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

// ==================== INSTITUTION RESET PASSWORD ====================
export const institutionResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token and find user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
      role: "institution",
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save();

    // Log password reset
    console.log(
      `🔐 Institution password reset completed: ${
        user.email
      } at ${new Date().toISOString()}`
    );

    res.json({
      success: true,
      message: "Institution password reset successful",
    });
  } catch (error) {
    console.error("❌ Institution reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

// ==================== UPDATE INSTITUTION PROFILE ====================
export const updateInstitutionProfile = async (req, res) => {
  try {
    const { name, designation, department, phone } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Institution user not found",
      });
    }

    // Update basic profile information
    if (name) user.name = name;
    if (designation) user.institutionProfile.designation = designation;
    if (department) user.institutionProfile.department = department;
    if (phone) user.institutionProfile.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: "Institution profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          institutionProfile: user.institutionProfile,
        },
      },
    });
  } catch (error) {
    console.error("❌ Institution profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during profile update",
    });
  }
};
