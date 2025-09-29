import bcrypt from "bcryptjs";
import crypto from "crypto";
// import User from '../../models/institution/institutionAdmin.js';
import Institution from "../../models/institution/institution.js";
import { generateTokenPair } from "../../utils/tokenUtils.js";
import { sendEmail } from "../../utils/emailService.js";

// ==================== INSTITUTION LOGIN ====================
export const institutionLogin = async (req, res) => {
  //More to do in this function
  try {
    const { email, password } = req.body;

    // Find institution admin user
    const institution = await Institution.findOne({
      email,
    })
      .select("+password")
      .populate("institutionId");

    if (!institution) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
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
        message: "Invalid credentials",
      });
    }

    // Update last login
    institution.lastLogin = new Date();
    await institution.save();

    // Generate tokens
    const data = {
      role: "institution",
      email: institution.email,
    };
    const { accessToken, refreshToken } = generateTokenPair(data);

    // Log institution login
    console.log(
      `🏫 Institution login: ${institution.email} (${
        institution.institutionName
      }) at ${new Date().toISOString()}`
    );

    res.json({
      success: true,
      message: "Institution login successful",
      data: {
        user: {
          role: "institution",
          name: institution.institutionName,
          email: institution.email,
          status: institution.status,
          type: institution.institutionType,
          lastLogin: institution.lastLogin,
        },
        accessToken,
        refreshToken,
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
    contactInfo,
    address,
    establishedYear,
    description,
  } = req.body;
  try {

    console.log("Line 1");
    // Check if institution already exists
    const existingInstitution = await Institution.findOne({
      $or: [{ email: email }, { institutionName: institutionName }],
    });

    console.log("Line 2");
    if (existingInstitution) {
      return res.status(400).json({
        success: false,
        message: "Institution with this name or email already exists",
      });
    }
    
    
    console.log("Line 3");
    // Create institution with session
    const institution = new Institution({
      institutionName: institutionName,
      institutionType: institutionType,
      email: email,
      emailDomain: emailDomain,
      password: password,
      contactInfo: contactInfo,
      address: address,
      establishedYear: establishedYear,
      description: description,
      status: "pending",
    });
    
    // Generate email verification token using the schema method
    const verificationToken = institution.generateVerificationToken();
    console.log("verificationToken: ", verificationToken);

    console.log("Line 4");
    await institution.save();

    console.log("Line 5");

    console.log("Line 6");
    await institution.save();

    console.log("Line 7");
    // Send verification email
    console.log("env check: ");
    console.log("FRONTEND_URL: ", process.env.FRONTEND_URL);

    try {
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
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail the transaction for email errors
    }

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
      console.log(`🧹 Auto-cleanup performed for failed registration: ${email}`);
    } catch (error) {
      console.log("Error occured while cleaning up the institution: ", error.message);
    };

    console.error("❌ Institution registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during institution registration",
    });
  }
};

// ==================== INSTITUTION EMAIL VERIFICATION ====================
export const verifyInstitutionEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const institution = await Institution.findOne({
      VerificationToken: token,
      VerificationExpires: { $gt: Date.now() },
    });

    if (!institution) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Verify institution email
    institution.institutionEmailVerification = true;
    institution.verificationToken = undefined;
    institution.verificationExpires = undefined;

    await user.save();

    // Log email verification
    console.log(
      `✅ Institution email verified: ${
        institution.email
      } at ${new Date().toISOString()}`
    );

    try {
      await sendEmail({
        to: institution.email,
        subject: "Email Verification",
        message: `
          Welcome to the Placement Portal!
          
          Your Institution email has been verified successfully.
          
          Institution: ${institution.institutionName}
          Status: Pending Admin Approval
          
          Your institution will be reviewed by our admin team. Lookout for any further emails.
        `,
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail the transaction for email errors
    }

    res.json({
      success: true,
      message:
        "Email verification successful. Your institution is now pending admin approval.",
      data: {
        isVerified: true,
        pendingApproval: true,
      },
    });
  } catch (error) {
    console.error("❌ Institution email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification",
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
