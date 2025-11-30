import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'Institution ID is required']
  },
  driveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementDrive'
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  package: {
    type: Number,
    required: [true, 'Package is required'],
    min: [0, 'Package cannot be negative']
  },
  packageType: {
    type: String,
    enum: ['CTC', 'In-hand', 'Stipend'],
    default: 'CTC'
  },
  placementType: {
    type: String,
    enum: ['Full-time', 'Internship', 'PPO'],
    required: [true, 'Placement type is required']
  },
  location: {
    type: String,
    trim: true
  },
  jobType: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  status: {
    type: String,
    enum: ['offered', 'accepted', 'rejected', 'withdrawn'],
    default: 'offered'
  },
  offerDate: {
    type: Date,
    default: Date.now
  },
  placedDate: {
    type: Date
  },
  joiningDate: {
    type: Date
  },
  offerLetter: {
    url: String,
    uploadedAt: Date
  },
  selectionRounds: [{
    roundName: {
      type: String,
      enum: ['Aptitude', 'Technical', 'HR', 'Group Discussion', 'Case Study', 'Final'],
      required: true
    },
    date: Date,
    status: {
      type: String,
      enum: ['scheduled', 'cleared', 'rejected', 'pending'],
      default: 'scheduled'
    },
    feedback: String
  }],
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'addedByModel'
  },
  addedByModel: {
    type: String,
    enum: ['Admin', 'Institution']
  }
}, {
  timestamps: true
});

// Indexes for faster queries
placementSchema.index({ studentId: 1 });
placementSchema.index({ institutionId: 1 });
placementSchema.index({ driveId: 1 });
placementSchema.index({ company: 1 });
placementSchema.index({ status: 1 });
placementSchema.index({ placedDate: -1 });

// Set placedDate when status changes to accepted
placementSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'accepted' && !this.placedDate) {
    this.placedDate = new Date();
  }
  next();
});

// Virtual for package display
placementSchema.virtual('packageDisplay').get(function() {
  return `₹${this.package} LPA`;
});

// Method to check if placement is active
placementSchema.methods.isActive = function() {
  return this.status === 'offered' || this.status === 'accepted';
};

// Static method to get placement statistics for an institution
placementSchema.statics.getInstitutionStats = async function(institutionId) {
  const stats = await this.aggregate([
    {
      $match: {
        institutionId: mongoose.Types.ObjectId(institutionId),
        status: 'accepted'
      }
    },
    {
      $group: {
        _id: null,
        totalPlacements: { $sum: 1 },
        avgPackage: { $avg: '$package' },
        maxPackage: { $max: '$package' },
        minPackage: { $min: '$package' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalPlacements: 0,
    avgPackage: 0,
    maxPackage: 0,
    minPackage: 0
  };
};

// Static method to get company-wise placements
placementSchema.statics.getCompanyStats = async function(institutionId) {
  return await this.aggregate([
    {
      $match: {
        institutionId: mongoose.Types.ObjectId(institutionId),
        status: 'accepted'
      }
    },
    {
      $group: {
        _id: '$company',
        count: { $sum: 1 },
        avgPackage: { $avg: '$package' },
        positions: { $addToSet: '$position' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);
};

const Placement = mongoose.model('Placement', placementSchema);

export default Placement;