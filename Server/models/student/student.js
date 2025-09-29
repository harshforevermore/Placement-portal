import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'Institution ID is required']
  },
  role: {
    type: String,
    default: 'student',
    immutable: true
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true,
    maxlength: [20, 'Student ID cannot exceed 20 characters']
  },
  academicInfo: {
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Academic year is required'],
      min: [1, 'Year must be at least 1'],
      max: [6, 'Year cannot exceed 6']
    },
    semester: {
      type: Number,
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8']
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10']
    },
    graduationYear: {
      type: Number,
      min: [new Date().getFullYear(), 'Graduation year cannot be in the past']
    }
  },
  personalInfo: {
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    phone: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'India'
      }
    }
  },
  profileInfo: {
    profilePicture: {
      type: String // URL to profile picture
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    skills: [{
      type: String,
      trim: true
    }],
    interests: [{
      type: String,
      trim: true
    }],
    resumeUrl: {
      type: String // URL to resume file
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  verificationExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  placementStatus: {
    type: String,
    enum: ['seeking', 'placed', 'not_seeking'],
    default: 'seeking'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    placement: {
      type: Boolean,
      default: true
    },
    updates: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
studentSchema.virtual('age').get(function() {
  if (!this.personalInfo.dateOfBirth) return null;
  return Math.floor((new Date() - this.personalInfo.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

// Account lock virtual
studentSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Validate email domain matches institution
studentSchema.pre('save', async function(next) {
  if (this.isModified('email') || this.isModified('institutionId')) {
    try {
      const Institution = mongoose.model('Institution');
      const institution = await Institution.findById(this.institutionId);
      
      if (!institution) {
        return next(new Error('Institution not found'));
      }
      
      const emailDomain = this.email.split('@')[1];
      if (emailDomain !== institution.domain) {
        return next(new Error('Email domain must match institution domain'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Ensure unique student ID per institution
studentSchema.pre('save', async function(next) {
  if (this.isModified('studentId') || this.isModified('institutionId')) {
    try {
      const existingStudent = await mongoose.model('Student').findOne({
        studentId: this.studentId,
        institutionId: this.institutionId,
        _id: { $ne: this._id }
      });
      
      if (existingStudent) {
        return next(new Error('Student ID already exists in this institution'));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Handle failed login attempts
studentSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + (15 * 60 * 1000) }; // 15 minutes lock
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
studentSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Generate verification token
studentSchema.methods.generateVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.verificationToken = token;
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Indexes
studentSchema.index({ email: 1 });
studentSchema.index({ institutionId: 1 });
studentSchema.index({ studentId: 1, institutionId: 1 }, { unique: true });
studentSchema.index({ isActive: 1, isVerified: 1 });
studentSchema.index({ placementStatus: 1 });
studentSchema.index({ 'academicInfo.course': 1, 'academicInfo.year': 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;