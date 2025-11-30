import Institution from "../models/institution/institution.js";
import RefreshToken from "../models/refreshToken.js";
import Student from "../models/student/student.js";
import { sendEmail } from "../utils/emailService.js";
import { generateAccessToken } from "../utils/tokenUtils.js";

// Verify Token
export const verifyToken = async (req, res) => {
  console.log("Verify Token");
  try {
    // console.log("Line 1");
    res.json({
      success: true,
      user: req.user,
    });
    console.log("Verified");
  } catch (error) {
    console.log("Line 3");
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  console.log("Resend Verification Email:");
  try {
    const { email, userType } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (userType === "institution") {
      // Find institution by email
      const institution = await Institution.findOne({ email });

      if (!institution) {
        return res.status(404).json({
          success: false,
          message: "No account found with this email",
        });
      }

      if (institution.emailVerification.emailVerified) {
        return res.status(400).json({
          success: false,
          message: "Email is already verified",
        });
      }

      // Generate new verification token
      const verificationToken = institution.generateVerificationToken();
      await institution.save();

      // Send verification email
      await sendEmail({
        to: institution.email,
        subject: "Verify Your Institution Account",
        message: `
      Welcome to the Placement Portal!
      
      Please verify your institution account by clicking the link below:
        ${process.env.FRONTEND_URL}/verify-email/${userType}/${verificationToken}
        
        Institution: ${institution.institutionName}
        
        This link will expire in 24 hours.
        `,
      });

      res.json({
        success: true,
        message: "Verification email sent successfully",
      });
    }

    if (userType === "student") {
      // Find institution by email
      const student = await Student.findOne({ email });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "No account found with this email",
        });
      }

      if (student.emailVerification.emailVerified) {
        return res.status(400).json({
          success: false,
          message: "Email is already verified",
        });
      }

      // Generate new verification token
      const verificationToken = student.generateVerificationToken();
      await student.save();

      // Send verification email
      await sendEmail({
        to: student.email,
        subject: "Verify Your Student Account",
        message: `
      Welcome to the Placement Portal!
      
      Please verify your student account by clicking the link below:
        ${process.env.FRONTEND_URL}/verify-email/${userType}/${verificationToken}
        
        This link will expire in 24 hours.
        `,
      });

      res.json({
        success: true,
        message: "Verification email sent successfully",
      });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification email",
    });
  }
};

// ==================== EMAIL VERIFICATION ====================
export const emailVerification = async (req, res) => {
  console.log("Email Verification: ");
  try {
    const { token, userType } = req.params;
    // console.log(req);
    console.log("token: ", token, "   userType: ", userType);

    if (userType === "institution") {
      console.log("if => Institution");
      const institution = await Institution.findOne({
        "emailVerification.verificationToken": token,
      });

      if (!institution) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      }

      // Verify institution email
      institution.emailVerification.emailVerified = true;
      institution.emailVerification.verificationToken = undefined;
      institution.emailVerification.verificationExpires = undefined;

      await institution.save();

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
            
            Institution ID: ${institution.institutionId}
          Institution Name: ${institution.institutionName}
        `,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }

      res.json({
        success: true,
        message: "Email verification successful.",
      });
    } else if (userType === "student") {
      console.log("else if => student");
        const student = await Student.findOne({
          "emailVerification.verificationToken": token
        });
        if (!student) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired verification token",
          });
        }

        // Verify institution email
        student.emailVerification.emailVerified = true;
        student.emailVerification.verificationToken = undefined;
        student.emailVerification.verificationExpires = undefined;

        await student.save();

        // Log email verification
        console.log(
          `✅ Institution email verified: ${
            student.email
          } at ${new Date().toISOString()}`
        );

        try {
          await sendEmail({
            to: student.email,
            subject: "Email Verification",
            message: `
            Welcome to the Placement Portal!
            
            Your email has been verified successfully.
        `,
          });
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          // Don't fail the transaction for email errors
        }

        res.json({
          success: true,
          message: "Email verification successful.",
        });
      }
  } catch (error) {
    console.error("❌ Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: tokenValue } = req.cookies;

    if (!tokenValue) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: tokenValue });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (!storedToken.isValid()) {
      return res.status(401).json({
        success: false,
        message: storedToken.isRevoked
          ? "Token has been revoked"
          : "Token expired",
      });
    }

    storedToken.lastUsedAt = new Date();
    await storedToken.save();

    const newAccessToken = generateAccessToken({
      id: storedToken.userId,
      role: storedToken.userRole,
    });

    res.cookie("accT", newAccessToken, accessTokenCookieOptions);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        user: {
          id: storedToken.userId,
          role: storedToken.userRole,
        },
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const { refT: tokenValue } = req.cookies;

    if (tokenValue) {
      await RefreshToken.findOneAndUpdate(
        { token: tokenValue },
        {
          $set: {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: "User logout",
          },
        }
      );
    }

    res.clearCookie("accT", { path: "/" });
    res.clearCookie("refT", { path: "/" });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// Logout from all devices
export const logoutAllDevices = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const userModel =
      req.user.role === "admin"
        ? "Admin"
        : req.user.role === "institution"
        ? "Institution"
        : "Student";

    await RefreshToken.revokeAllForUser(
      userId,
      userModel,
      "Logout from all devices"
    );

    res.clearCookie("accT", { path: "/" });
    res.clearCookie("refT", { path: "/" });

    res.json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// Get active sessions
export const getActiveSessions = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const userModel =
      req.user.role === "admin"
        ? "Admin"
        : req.user.role === "institution"
        ? "Institution"
        : "Student";

    const sessions = await RefreshToken.find({
      userId,
      userModel,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .select("deviceInfo createdAt lastUsedAt")
      .sort({ lastUsedAt: -1 });

    res.json({
      success: true,
      data: {
        sessions,
        count: sessions.length,
      },
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
    });
  }
};
