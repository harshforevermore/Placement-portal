import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const institutionSchema = new mongoose.Schema(
  {
    institutionId: {
      type: String,
      unique: true,
    },
    institutionName: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
      maxlength: [200, "Institution name cannot exceed 200 characters"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Institution email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    emailDomain: {
      type: String,
      required: [true, "Email domain is required"],
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid domain"],
    },
    institutionType: {
      type: String,
      required: [true, "Institution type is required"],
      enum: [
        "University",
        "College",
        "Technical Institute",
        "School",
        "Training Center",
        "Other",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, "Zip code is required"],
        trim: true,
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
        default: "India",
      },
    },
    contactInfo: {
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^[6-9]\d{9}$/, "Please enter a valid phone number"],
      },
      website: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, "Please enter a valid website URL"],
      },
      alternateEmail: {
        type: String,
        lowercase: true,
        trim: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid alternate email",
        ],
      },
    },
    role: {
      type: String,
      default: "institution",
      immutable: true,
    },
    accreditation: {
      isAccredited: {
        type: Boolean,
        default: false,
      },
      accreditingBody: {
        type: String,
        trim: true,
      },
      accreditationNumber: {
        type: String,
        trim: true,
      },
      validUntil: {
        type: Date,
      },
    },
    establishedYear: {
      type: Number,
      min: [1800, "Established year cannot be before 1800"],
      max: [
        new Date().getFullYear(),
        "Established year cannot be in the future",
      ],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      trim: true,
    },
    logo: {
      type: String, // URL to logo image
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    approvalDetails: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
      approvedAt: {
        type: Date,
      },
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
      rejectedAt: {
        type: Date,
      },
      rejectionReason: {
        type: String,
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
      },
    },
    settings: {
      allowStudentRegistration: {
        type: Boolean,
        default: true,
      },
      requireEmailVerification: {
        type: Boolean,
        default: true,
      },
      maxStudents: {
        type: Number,
        default: 10000,
      },
    },
    statistics: {
      totalStudents: {
        type: Number,
        default: 0,
      },
      activePlacements: {
        type: Number,
        default: 0,
      },
      successfulPlacements: {
        type: Number,
        default: 0,
      },
      lastLogin: {
        type: Date,
      },
      loginAttempts: {
        type: Number,
        default: 0,
      },
    },
    emailVerification: {
      emailVerified: {
        type: Boolean,
        default: false,
      },
      verificationToken: {
        type: String,
      },
      verificationExpires: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full address
institutionSchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for approval status
institutionSchema.virtual("isApproved").get(function () {
  return this.status === "approved";
});

// Pre-save middleware to extract domain from email and hash password
institutionSchema.pre("save", async function (next) {
  if (this.isModified("email")) {
    this.domain = this.email.split("@")[1];
  }
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
institutionSchema.methods.comparePassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

//Generate Verification Token
institutionSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerification.verificationToken = token;
  this.emailVerification.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return token;
};

// Indexes
institutionSchema.index({ email: 1 });
institutionSchema.index({ domain: 1 });
institutionSchema.index({ status: 1 });
institutionSchema.index({ name: "text", description: "text" });

const Institution = mongoose.model("Institution", institutionSchema);

export default Institution;
