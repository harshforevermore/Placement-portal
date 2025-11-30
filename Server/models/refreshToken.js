// models/RefreshToken.js
import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Institution', 'Student']
  },
  userRole: {
    type: String,
    required: true,
    enum: ['admin', 'institution', 'student']
  },
  email: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    device: String,
    browser: String
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  revokedAt: {
    type: Date
  },
  revokedReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for user queries
refreshTokenSchema.index({ userId: 1, userModel: 1 });
refreshTokenSchema.index({ token: 1 });

// Method to check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return !this.isRevoked && this.expiresAt > new Date();
};

// Static method to cleanup expired tokens
refreshTokenSchema.statics.cleanupExpired = async function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllForUser = async function(userId, userModel, reason = 'User logout') {
  return this.updateMany(
    { userId, userModel, isRevoked: false },
    { 
      $set: { 
        isRevoked: true, 
        revokedAt: new Date(),
        revokedReason: reason
      } 
    }
  );
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;