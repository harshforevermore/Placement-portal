import mongoose from 'mongoose';

const placementDriveSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'Institution ID is required']
  },
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    logo: String,
    website: String,
    about: {
      type: String,
      maxlength: [1000, 'About section cannot exceed 1000 characters']
    }
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  jobDescription: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  package: {
    type: Number,
    required: [true, 'Package is required'],
    min: [0, 'Package cannot be negative']
  },
  packageBreakdown: {
    baseSalary: Number,
    bonus: Number,
    stocks: Number,
    other: Number
  },
  packageType: {
    type: String,
    enum: ['CTC', 'In-hand', 'Stipend'],
    default: 'CTC'
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Internship', 'Internship + PPO'],
    required: [true, 'Job type is required']
  },
  workMode: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  locations: [{
    type: String,
    trim: true
  }],
  eligibility: {
    branches: [{
      type: String,
      trim: true
    }],
    minCGPA: {
      type: Number,
      min: 0,
      max: 10
    },
    minPercentage: {
      type: Number,
      min: 0,
      max: 100
    },
    graduationYear: [Number],
    backlogs: {
      allowed: {
        type: Boolean,
        default: true
      },
      maxAllowed: {
        type: Number,
        default: 0
      }
    },
    otherCriteria: String
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  selectionProcess: [{
    roundName: {
      type: String,
      required: true
    },
    description: String,
    duration: String,
    date: Date
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'closing', 'closed', 'completed', 'cancelled'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invited'],
    default: 'public'
  },
  registrationRequired: {
    type: Boolean,
    default: true
  },
  maxApplicants: {
    type: Number,
    min: 1
  },
  applicants: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected', 'selected', 'withdrawn'],
      default: 'applied'
    },
    resume: String,
    coverLetter: String
  }],
  eventType: {
    type: String,
    enum: ['Pre-placement Talk', 'Campus Drive', 'Technical Round', 'HR Round', 'Final Round', 'Offer Announcement'],
    default: 'Campus Drive'
  },
  eventDate: Date,
  eventTime: String,
  contactPerson: {
    name: String,
    email: String,
    phone: String,
    designation: String
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  placedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  statistics: {
    totalApplications: {
      type: Number,
      default: 0
    },
    shortlisted: {
      type: Number,
      default: 0
    },
    selected: {
      type: Number,
      default: 0
    },
    rejected: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
placementDriveSchema.index({ institutionId: 1 });
placementDriveSchema.index({ status: 1 });
placementDriveSchema.index({ applicationDeadline: 1 });
placementDriveSchema.index({ 'company.name': 1 });
placementDriveSchema.index({ eventDate: 1 });

// Virtual for eligibility display
placementDriveSchema.virtual('eligibilityDisplay').get(function() {
  if (this.eligibility.branches && this.eligibility.branches.length > 0) {
    return this.eligibility.branches.join(', ');
  }
  return 'All Branches';
});

// Virtual for applicant count
placementDriveSchema.virtual('applicantCount').get(function() {
  return this.applicants ? this.applicants.length : 0;
});

// Pre-save middleware to update statistics
placementDriveSchema.pre('save', function(next) {
  if (this.applicants && this.isModified('applicants')) {
    this.statistics.totalApplications = this.applicants.length;
    this.statistics.shortlisted = this.applicants.filter(a => a.status === 'shortlisted').length;
    this.statistics.selected = this.applicants.filter(a => a.status === 'selected').length;
    this.statistics.rejected = this.applicants.filter(a => a.status === 'rejected').length;
  }
  
  // Auto-update status based on deadline
  if (this.applicationDeadline) {
    const now = new Date();
    const deadline = new Date(this.applicationDeadline);
    const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (deadline < now && this.status === 'active') {
      this.status = 'closed';
    } else if (daysUntilDeadline <= 3 && this.status === 'active') {
      this.status = 'closing';
    }
  }
  
  next();
});

// Method to check if student can apply
placementDriveSchema.methods.canApply = function(student) {
  // Check deadline
  if (new Date() > this.applicationDeadline) {
    return { allowed: false, reason: 'Application deadline passed' };
  }
  
  // Check status
  if (this.status !== 'active' && this.status !== 'closing') {
    return { allowed: false, reason: 'Drive is not active' };
  }
  
  // Check if already applied
  const hasApplied = this.applicants.some(a => a.studentId.toString() === student._id.toString());
  if (hasApplied) {
    return { allowed: false, reason: 'Already applied' };
  }
  
  // Check max applicants
  if (this.maxApplicants && this.applicants.length >= this.maxApplicants) {
    return { allowed: false, reason: 'Maximum applicants reached' };
  }
  
  // Check branch eligibility
  if (this.eligibility.branches && this.eligibility.branches.length > 0) {
    if (!this.eligibility.branches.includes(student.branch)) {
      return { allowed: false, reason: 'Branch not eligible' };
    }
  }
  
  // Check CGPA
  if (this.eligibility.minCGPA && student.academicInfo?.cgpa < this.eligibility.minCGPA) {
    return { allowed: false, reason: 'CGPA below minimum requirement' };
  }
  
  // Check backlogs
  if (!this.eligibility.backlogs.allowed && student.academicInfo?.backlogs > 0) {
    return { allowed: false, reason: 'Backlogs not allowed' };
  }
  
  if (this.eligibility.backlogs.maxAllowed !== undefined) {
    if (student.academicInfo?.backlogs > this.eligibility.backlogs.maxAllowed) {
      return { allowed: false, reason: `Maximum ${this.eligibility.backlogs.maxAllowed} backlogs allowed` };
    }
  }
  
  return { allowed: true, reason: 'Eligible' };
};

// Static method to get active drives for an institution
placementDriveSchema.statics.getActiveDrives = async function(institutionId) {
  return await this.find({
    institutionId: institutionId,
    status: { $in: ['active', 'closing'] },
    applicationDeadline: { $gte: new Date() }
  }).sort({ applicationDeadline: 1 });
};

// Static method to get drives by status
placementDriveSchema.statics.getDrivesByStatus = async function(institutionId, status) {
  return await this.find({
    institutionId: institutionId,
    status: status
  }).sort({ createdAt: -1 });
};

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);

export default PlacementDrive;