import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/refreshToken.js';

export const accessTokenCookieOptions = {
  httpOnly: true,      // Not accessible via JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',  // CSRF protection
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/'
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

export const getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  return {
    userAgent,
    ip: req.ip || req.connection.remoteAddress,
    device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
    browser: userAgent.split('/')[0]
  };
};

// Token configuration
const TOKEN_CONFIG = {
  // Access token expiration times
  ACCESS_TOKEN_EXPIRES: {
    admin: '24h',           // Admins get longer sessions
    institution_admin: '12h', // Institution admins get medium sessions
    student: '8h'           // Students get shorter sessions for security
  },
  
  // Refresh token expiration
  REFRESH_TOKEN_EXPIRES: '7d',
  
  // Verification token expiration
  VERIFICATION_TOKEN_EXPIRES: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  
  // Password reset token expiration
  RESET_TOKEN_EXPIRES: 60 * 60 * 1000, // 1 hour in milliseconds
};

/**
 * Generate JWT access token for user
 * @param {Object} userData - User object with _id, role, email
 * @param {String} customExpiry - Optional custom expiry time
 * @returns {String} JWT token
 */
export const generateAccessToken = (userData, customExpiry = null) => {
  try {
    const payload = {
      role: userData?.role,
      email: userData?.email,
      tokenType: 'access'
    };

    const options = {
      expiresIn: customExpiry || TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES[userData.role] || '8h',
      issuer: 'placement-portal',
      audience: userData.role
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Generate JWT refresh token for user
 * @param {Object} userData - User object with _id, role, email
 * @returns {String} JWT refresh token
 */
export const generateRefreshToken = (userData) => {
  try {
    const payload = {
      role: userData.role,
      tokenType: 'refresh',
      // Add random value to make each refresh token unique
      jti: crypto.randomBytes(16).toString('hex')
    };

    const options = {
      expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRES,
      issuer: 'placement-portal',
      audience: userData.role
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, options);
  } catch (error) {
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} userData - User object
 * @returns {Object} { accessToken, refreshToken, expiresIn }
 */
export const generateTokenPair = (userData) => {
  const accessToken = generateAccessToken(userData);
  const refreshToken = generateRefreshToken(userData);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES[userData.role] || '8h',
    tokenType: 'Bearer'
  };
};

export const cleanupExpiredTokens = async () => {
  try {
    const result = await RefreshToken.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { 
          isRevoked: true, 
          revokedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      ]
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} expired/old refresh tokens`);
    return result.deletedCount;
  } catch (error) {
    console.error('Token cleanup error:', error);
    throw error;
  }
};

export const initTokenCleanup = () => {
  cleanupExpiredTokens();
  setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);
  console.log('✅ Token cleanup scheduler initialized');
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @param {String} tokenType - 'access' or 'refresh'
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token, tokenType = 'access') => {
  try {
    const secret = tokenType === 'refresh' 
      ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
      : process.env.JWT_SECRET;

    const decoded = jwt.verify(token, secret);
    
    // Validate token type matches expected
    if (decoded.tokenType !== tokenType) {
      throw new Error(`Invalid token type. Expected: ${tokenType}, Got: ${decoded.tokenType}`);
    }

    return decoded;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'NotBeforeError') {
      throw new Error('Token not active');
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {String} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    throw new Error(`Token decode failed: ${error.message}`);
  }
};

/**
 * Check if token is expired
 * @param {String} token - JWT token to check
 * @returns {Boolean} True if expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {String} token - JWT token
 * @returns {Date|null} Expiration date
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Extracted token
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

/**
 * Generate verification token for email verification
 * @param {Object} user - User object
 * @returns {Object} { token, expiresAt }
 */
export const generateVerificationToken = (user) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_CONFIG.VERIFICATION_TOKEN_EXPIRES);
  
  return { token, expiresAt };
};

/**
 * Generate password reset token
 * @param {Object} user - User object
 * @returns {Object} { token, expiresAt }
 */
export const generatePasswordResetToken = (user) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_CONFIG.RESET_TOKEN_EXPIRES);
  
  return { token, expiresAt };
};

/**
 * Generate secure random token for general use
 * @param {Number} length - Token length in bytes (default: 32)
 * @returns {String} Random hex token
 */
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Create token response object
 * @param {Object} user - User object
 * @param {String} message - Success message
 * @returns {Object} Standardized token response
 */
export const createTokenResponse = (user, message = 'Authentication successful') => {
  const tokens = generateTokenPair(user);
  
  return {
    success: true,
    message,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        ...(user.institutionId && { 
          institution: {
            _id: user.institutionId._id,
            name: user.institutionId.name,
            domain: user.institutionId.domain
          }
        })
      },
      ...tokens
    }
  };
};

/**
 * Refresh access token using refresh token
 * @param {String} refreshToken - Valid refresh token
 * @param {Function} getUserById - Function to fetch user by ID and role
 * @returns {Object} New token pair
 */
export const refreshAccessToken = async (refreshToken, getUserById) => {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken, 'refresh');
    
    // Get user from database to ensure they're still active
    const user = await getUserById(decoded.userId, decoded.role);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }
    
    // Generate new access token (refresh token remains the same)
    const accessToken = generateAccessToken(user);
    
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES[user.role] || '8h',
        tokenType: 'Bearer'
      }
    };
    
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
};

/**
 * Validate token payload structure
 * @param {Object} payload - Decoded token payload
 * @returns {Boolean} True if valid
 */
export const validateTokenPayload = (payload) => {
  const requiredFields = ['userId', 'role', 'email', 'tokenType'];
  const validRoles = ['admin', 'institution_admin', 'student'];
  const validTokenTypes = ['access', 'refresh'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!payload[field]) {
      return false;
    }
  }
  
  // Validate role
  if (!validRoles.includes(payload.role)) {
    return false;
  }
  
  // Validate token type
  if (!validTokenTypes.includes(payload.tokenType)) {
    return false;
  }
  
  return true;
};

/**
 * Generate admin invitation token (for creating new admins)
 * @param {Object} adminData - Admin invitation data
 * @param {String} invitedBy - Admin ID who sent invitation
 * @returns {String} Invitation token
 */
export const generateAdminInvitationToken = (adminData, invitedBy) => {
  const payload = {
    email: adminData.email,
    firstName: adminData.firstName,
    lastName: adminData.lastName,
    invitedBy,
    tokenType: 'admin_invitation',
    iat: Math.floor(Date.now() / 1000)
  };
  
  const options = {
    expiresIn: '48h', // Admin invitations expire in 48 hours
    issuer: 'placement-portal',
    audience: 'admin'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Get token information for debugging
 * @param {String} token - JWT token
 * @returns {Object} Token information
 */
export const getTokenInfo = (token) => {
  try {
    const decoded = decodeToken(token);
    const payload = decoded.payload;
    
    return {
      header: decoded.header,
      payload: {
        userId: payload.userId,
        role: payload.role,
        email: payload.email,
        tokenType: payload.tokenType,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        issuer: payload.iss,
        audience: payload.aud
      },
      isExpired: isTokenExpired(token),
      timeUntilExpiry: payload.exp ? Math.max(0, payload.exp * 1000 - Date.now()) : 0
    };
  } catch (error) {
    return {
      error: error.message,
      isValid: false
    };
  }
};

// Export token configuration for use in other modules
export { TOKEN_CONFIG };