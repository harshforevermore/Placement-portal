import bcrypt from "bcryptjs";
import crypto from "crypto";
import Student from "../../models/student/student.js";
import Institution from "../../models/institution/institution.js";
import { generateTokenPair, getDeviceInfo } from "../../utils/tokenUtils.js";
import { sendEmail } from "../../utils/emailService.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../utils/tokenUtils.js";
import RefreshToken from "../../models/refreshToken.js";

// ==================== STUDENT LOGIN ====================
export const studentLogin = async (req, res) => {
  try {
    const { email, institutionId, password } = req.body;

    console.log("Line 1");

    const student = await Student.findOne({
      email,
      institutionId,
      role: "student",
      isActive: true,
    }).select("+password");

    console.log("Line 2");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // fetch institution
    const institution = await Institution.findOne({
      institutionId,
    });

    if (!institution) {
      return res.status(401).json({
        success: false,
        message: "No institution associated with this account",
      });
    }

    console.log("Line 3");

    if (institution.status !== "approved") {
      return res.status(401).json({
        success: false,
        message:
          "Your institution is not approved yet. Please contact your institution administrator.",
        institutionStatus: institution.status,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("Line 4");

    student.lastLogin = new Date();
    await student.save();

    console.log("Line 5");

    const data = {
      id: student.id,
      role: student.role,
      email: student.email,
    };
    const { accessToken, refreshToken } = generateTokenPair(data);

    console.log("Line 6");

    // Step 7: Save refresh token
    await RefreshToken.create({
      token: refreshToken,
      userId: student._id,
      email: student.email,
      userModel: "Student",
      userRole: "student",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: getDeviceInfo(req),
    });

    console.log("Line 7");

    // Step 8: Logging
    console.log(
      `👨‍🎓 Student login: ${student.email} (${student.studentProfile?.rollNumber}) at ${new Date().toISOString()}`
    );

    // Step 9: Set cookies
    res.cookie("accT", accessToken, accessTokenCookieOptions);
    res.cookie("refT", refreshToken, refreshTokenCookieOptions);

    // Step 10: Response
    res.json({
      success: true,
      message: "Student login successful",
      data: {
        user: {
          name: student.firstName + " " + student.lastName,
          email: student.email,
          role: student.role,
        },
      },
    });
  } catch (error) {
    console.error("❌ Student login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during student login",
    });
  }
};


// ==================== STUDENT REGISTER ====================
export const studentRegister = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      institutionId,
      rollNumber,
      course,
      branch,
      year,
      phone,
      dateOfBirth,
    } = req.body;
    console.log("line 1");
    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this email already exists",
      });
    }
    console.log("line 2");

    // Check if roll number exists in the same institution
    const existingRollNumber = await Student.findOne({
      "academicInfo.rollNumber": rollNumber,
      institutionId: institutionId,
    });
    if (existingRollNumber) {
      return res.status(400).json({
        success: false,
        message: "Roll number already registered for this institution",
      });
    }
    console.log("line 3");

    // Verify institution exists and is approved
    const institution = await Institution.findOne({ institutionId });
    if (!institution) {
      return res.status(400).json({
        success: false,
        message: "Institution not found",
      });
    }

    console.log("line 4");
    if (institution.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Institution is not approved yet. Cannot register students.",
        institutionStatus: institution.status,
      });
    }

    console.log("line 5");
    // Validate email domain (optional - if institution requires specific domain)
    const emailDomain = email.split("@")[1];
    const institutionEmail = institution.email;
    const institutionDomain = institutionEmail.split("@")[1];

    // enforce institutional email domains
    if (emailDomain !== institutionDomain) {
      return res.status(400).json({
        success: false,
        message: `Please use your institutional email domain (@${institutionDomain})`,
      });
    }
    console.log("line 6");

    // Create student user
    const student = new Student({
      firstName,
      lastName,
      email,
      password,
      role: "student",
      institutionId,
      academicInfo: {
        rollNumber,
        course,
        branch,
        year,
      },
      personalInfo: {
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
    });

    console.log("line 6.5");

    await student.save();

    console.log("line 7");
    // Generate email verification token using the schema method
    const verificationToken = student.generateVerificationToken();
    await student.save();

    // Send verification email
    try {
      await sendEmail({
        email: student.email,
        subject: "Verify Your Student Account",
        message: `
          Welcome to the Placement Portal!
          
          Please verify your student account by clicking the link below:
          ${process.env.CLIENT_URL}/verify-email/${verificationToken}
          
          Student Details:
          Name: ${firstName} ${lastName}
          Roll Number: ${rollNumber}
          Institution: ${institution.institutionName}
          Course: ${course} - ${branch}
          Year: ${year}
          
          This link will expire in 24 hours.
        `,
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Continue with registration even if email fails
    }

    // Log student registration
    console.log(
      `👨‍🎓 New student registered: ${rollNumber} (${email}) at ${
        institution.name
      } - ${new Date().toISOString()}`
    );

    res.status(201).json({
      success: true,
      message:
        "Student registration successful. Please check your email for verification.",
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
    console.error("❌ Student registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during student registration",
    });
  }
};

// ==================== STUDENT FORGOT PASSWORD ====================
export const studentForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email, role: "student" }).populate(
      "institutionId"
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found with this email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    student.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    student.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await student.save({ validateBeforeSave: false });

    // Send reset email
    try {
      await sendEmail({
        email: student.email,
        subject: "Student Password Reset Request",
        message: `
          Hello ${student.name},
          
          You requested a password reset for your student account.
          
          Student Details:
          Roll Number: ${student.studentProfile.rollNumber}
          Institution: ${student.institutionId.name}
          
          You can reset your password by clicking the link below:
          ${process.env.CLIENT_URL}/student/reset-password/${resetToken}
          
          This link will expire in 10 minutes.
          
          If you didn't request this, please ignore this email.
        `,
      });

      // Log password reset request
      console.log(
        `🔑 Student password reset requested: ${student.email} (${
          student.studentProfile.rollNumber
        }) at ${new Date().toISOString()}`
      );

      res.json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      student.passwordResetToken = undefined;
      student.passwordResetExpire = undefined;
      await student.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    console.error("❌ Student forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

// ==================== STUDENT RESET PASSWORD ====================
export const studentResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token and find student
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const student = await Student.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
      role: "student",
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password
    student.password = password;
    student.passwordResetToken = undefined;
    student.passwordResetExpire = undefined;

    await student.save();

    // Log password reset
    console.log(
      `🔐 Student password reset completed: ${student.email} (${
        student.studentProfile.rollNumber
      }) at ${new Date().toISOString()}`
    );

    res.json({
      success: true,
      message: "Student password reset successful",
    });
  } catch (error) {
    console.error("❌ Student reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

// ==================== UPDATE STUDENT PROFILE ====================
export const updateStudentProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      dateOfBirth,
      course,
      branch,
      year,
      cgpa,
      skills,
      address,
    } = req.body;
    const userId = req.user._id;

    const user = await Student.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
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
      message: "Student profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentProfile: user.studentProfile,
        },
      },
    });
  } catch (error) {
    console.error("❌ Student profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during profile update",
    });
  }
};

// ==================== STUDENT CHANGE PASSWORD ====================
export const studentChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const student = await Student.findById(userId).select("+password");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      student.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Set new password
    student.password = newPassword;
    await student.save();

    // Log password change
    console.log(
      `🔐 Student password changed: ${student.email} (${
        student.studentProfile.rollNumber
      }) at ${new Date().toISOString()}`
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("❌ Student change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password change",
    });
  }
};

// ==================== GET STUDENT DASHBOARD DATA ====================
export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await Student.findById(userId).populate("institutionId");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
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
        isVerified: user.isVerified,
      },
      institution: {
        name: user.institutionId.name,
        type: user.institutionId.type,
        status: user.institutionId.status,
      },
      profile: {
        completeness: calculateProfileCompleteness(user.studentProfile),
        missingFields: getMissingProfileFields(user.studentProfile),
      },
      // These would be populated from other collections in a real app
      stats: {
        applicationsSubmitted: 0,
        interviewsScheduled: 0,
        placementOffers: 0,
        profileViews: 0,
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("❌ Student dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
};

// ==================== HELPER FUNCTIONS ====================
const calculateProfileCompleteness = (profile) => {
  const fields = [
    "rollNumber",
    "course",
    "branch",
    "year",
    "phone",
    "dateOfBirth",
    "cgpa",
    "skills",
    "address",
  ];
  const completedFields = fields.filter((field) => {
    const value = profile[field];
    return value !== undefined && value !== null && value !== "";
  });

  return Math.round((completedFields.length / fields.length) * 100);
};

const getMissingProfileFields = (profile) => {
  const fieldLabels = {
    phone: "Phone Number",
    dateOfBirth: "Date of Birth",
    cgpa: "CGPA",
    skills: "Skills",
    address: "Address",
    resume: "Resume",
    profilePicture: "Profile Picture",
  };

  const missingFields = [];
  Object.keys(fieldLabels).forEach((field) => {
    const value = profile[field];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      missingFields.push(fieldLabels[field]);
    }
  });

  return missingFields;
};
