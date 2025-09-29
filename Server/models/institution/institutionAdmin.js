import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const institutionAdminSchema = new mongoose.Schema({
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
    default: 'institution_admin',
    immutable: true
  },
  position: {
    type: String,
    required: [true, 'Position/title is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  contactInfo: {
    phone: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    extension: {
      type: String,
      trim: true
    }
  },
  permissions: {
    type: [String],
    default: ['manage_students', 'manage_placements', 'view_applications', 'manage_departments']
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin' // Platform admin who approved the institution
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
institutionAdminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Account lock virtual
institutionAdminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
institutionAdminSchema.pre('save', async function(next) {
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
institutionAdminSchema.pre('save', async function(next) {
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

// Compare password method
institutionAdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Handle failed login attempts
institutionAdminSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + (30 * 60 * 1000) }; // 30 minutes lock
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
institutionAdminSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Generate verification token
institutionAdminSchema.methods.generateVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.verificationToken = token;
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Indexes
institutionAdminSchema.index({ email: 1 });
institutionAdminSchema.index({ institutionId: 1 });
institutionAdminSchema.index({ isActive: 1, isVerified: 1 });

const InstitutionAdmin = mongoose.model('InstitutionAdmin', institutionAdminSchema);

export default InstitutionAdmin;