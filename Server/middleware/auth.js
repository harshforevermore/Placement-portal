import jwt from 'jsonwebtoken';
import Admin from '../models/admin/admin.js';
import InstitutionAdmin from '../models/institution/institutionAdmin.js';
import Student from '../models/student/student.js';
import Institution from '../models/institution/institution.js';

// Helper function to get user model based on role
const getUserModel = (role) => {
  switch (role) {
    case 'admin':
      return Admin;
    case 'institution':
      return Institution;
    case 'institutionAdmin':
      return InstitutionAdmin;
    case 'student':
      return Student;
    default:
      return null;
  }
};

// Helper function to find user by ID and role
const findUserByIdAndRole = async (userId, role) => {
  const UserModel = getUserModel(role);
  if (!UserModel) return null;
  
  let user = await UserModel.findById(userId).select('-password');
  
  // Populate institution data for institution admins and students
  if (role === 'institution_admin' || role === 'student') {
    user = await user.populate('institutionId');
  }
  
  return user;
};

// Authenticate user with JWT token
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token - need both userId and role
    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }

    // Find user based on role
    const user = await findUserByIdAndRole(decoded.userId, decoded.role);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if user account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to too many failed login attempts. Try again later.'
      });
    }

    // Add user to req object
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

// Admin-only authorization
export const adminOnly = authorize('admin');

// Institution-only authorization  
export const institutionOnly = authorize('institution_admin');

// Student-only authorization
export const studentOnly = authorize('student');

// Admin and Institution authorization
export const adminOrInstitution = authorize('admin', 'institution_admin');

// Institution and Student authorization
export const institutionOrStudent = authorize('institution_admin', 'student');

// All roles authorization (authenticated users)
export const authenticated = authenticate;

// Optional authentication (for public routes that can show different content for logged in users)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.userId && decoded.role) {
        const user = await findUserByIdAndRole(decoded.userId, decoded.role);
        
        if (user && user.isActive && !user.isLocked) {
          req.user = user;
        } else {
          req.user = null;
        }
      } else {
        req.user = null;
      }
    } catch (tokenError) {
      // Invalid token, continue without user
      req.user = null;
    }

    next();

  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};

// Check if user owns resource or is admin
export const ownerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const userId = req.user._id.toString();
    const ownerId = typeof resourceUserId === 'function' 
      ? resourceUserId(req).toString() 
      : resourceUserId.toString();

    if (userId !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Check if user belongs to the same institution or is admin
export const sameInstitutionOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate first.'
    });
  }

  // Admin can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Institution admin can access their institution's data
  if (req.user.role === 'institution_admin') {
    return next();
  }

  // Students can only access their own institution's data
  if (req.user.role === 'student') {
    return next();
  }

  res.status(403).json({
    success: false,
    message: 'Access denied.'
  });
};

// Verify institution admin permissions
export const verifyInstitutionAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    // Admin has access to everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Institution admin can only access their own institution
    if (req.user.role === 'institution_admin') {
      const institutionId = req.params.institutionId || req.body.institutionId || req.user.institutionId;
      
      if (req.user.institutionId._id.toString() !== institutionId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own institution data.'
        });
      }
      return next();
    }

    // Students can only access their own institution's data
    if (req.user.role === 'student') {
      const institutionId = req.params.institutionId || req.body.institutionId;
      
      if (institutionId && req.user.institutionId._id.toString() !== institutionId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own institution data.'
        });
      }
      return next();
    }

    res.status(403).json({
      success: false,
      message: 'Access denied. Invalid role.'
    });

  } catch (error) {
    console.error('Institution access verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during access verification'
    });
  }
};

// Check if user is verified
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate first.'
    });
  }

  // Admin doesn't require email verification
  if (req.user.role === 'admin') {
    return next();
  }

  // Check verification for institution admins and students
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account not verified. Please check your email for verification instructions.'
    });
  }

  next();
};

// Check if institution is approved (for institution users)
export const requireApprovedInstitution = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    // Admin doesn't need institution approval
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has institution
    if (!req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'No institution associated with this account.'
      });
    }

    // Check institution status (institutionId should already be populated)
    const institution = req.user.institutionId;
    
    if (institution.status !== 'approved') {
      const statusMessages = {
        'pending': 'Institution approval is pending. Please wait for admin approval.',
        'rejected': 'Institution has been rejected. Please contact support.',
        'suspended': 'Institution has been suspended. Please contact support.'
      };
      
      return res.status(403).json({
        success: false,
        message: statusMessages[institution.status] || `Institution is ${institution.status}. Access denied.`
      });
    }

    next();

  } catch (error) {
    console.error('Institution approval check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during institution approval check'
    });
  }
};

// Check if institution admin has specific permissions
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has the required permission
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`
      });
    }

    next();
  };
};

// Combine multiple middleware
export const requireAuthAndVerification = [authenticate, requireVerification];
export const requireAuthVerificationAndApproval = [authenticate, requireVerification, requireApprovedInstitution];

// Institution-specific middleware combinations
export const requireInstitutionAuth = [authenticate, requireVerification, requireApprovedInstitution];
export const requireInstitutionAuthWithPermission = (permission) => [
  authenticate, 
  requireVerification, 
  requireApprovedInstitution, 
  requirePermission(permission)
];

// Student-specific middleware combinations  
export const requireStudentAuth = [authenticate, requireVerification, requireApprovedInstitution];

// Admin-specific middleware
export const requireAdminAuth = [authenticate, adminOnly];