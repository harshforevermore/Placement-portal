import express from 'express';
import { body } from 'express-validator';
import { adminRegister, adminLogin } from '../controllers/admin/adminAuth.js';
import { /*deleteInstitution,*/ institutionLogin, institutionRegister } from '../controllers/institution/institutionAuth.js';
import { studentLogin, studentRegister } from '../controllers/student/studentAuth.js';
import { validateRequest } from '../middleware/validation.js';
import { authenticate, isInstitutionEmailVerified, isStudentEmailVerified } from '../middleware/auth.js';
import { emailVerification, logout, logoutAllDevices, refreshToken, resendVerificationEmail, verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const adminLoginValidation = [
  ...loginValidation,
  body('adminCode')
    .notEmpty()
    .withMessage('Admin code is required')
];

const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const institutionRegisterValidation = [
  body('institutionName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Institution name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('emailDomain')
    .matches(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage('Please enter a valid domain'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('institutionType')
    .isIn(['University', 'College', 'Institute', 'School'])
    .withMessage('Invalid institution type'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid phone number'),
  body('street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('city')
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .notEmpty()
    .withMessage('State is required'),
  body('zipCode')
    .notEmpty()
    .withMessage('Zip code is required'),
  body('country')
    .notEmpty()
    .withMessage('Country is required')
];

const studentRegisterValidation = [
  ...registerValidation,
  body('institutionId')
    .notEmpty()
    .withMessage('Valid institution ID is required'),
  body('rollNumber')
    .trim()
    .notEmpty()
    .withMessage('Roll number is required'),
  body('course')
    .trim()
    .notEmpty()
    .withMessage('Course is required'),
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required'),
  body('year')
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6')
];

// ==================== ADMIN ROUTES ====================
// POST /api/auth/admin/login
router.post('/admin/login', 
  adminLoginValidation,
  validateRequest,
  adminLogin
);

// POST /api/auth/admin/register  
router.post('/admin/register',
  registerValidation,
  validateRequest,
  adminRegister
);

// ==================== INSTITUTION ROUTES ====================
// POST /api/auth/institution/login
router.post('/institution/login',
  loginValidation,
  validateRequest,
  isInstitutionEmailVerified,
  institutionLogin
);

// POST /api/auth/institution/register
router.post('/institution/register',
  institutionRegisterValidation,
  validateRequest,
  institutionRegister
);

// router.post('/institution/cleanup/:email',
//   deleteInstitution
// );

// ==================== STUDENT ROUTES ====================
// POST /api/auth/student/login
router.post('/student/login',
  loginValidation,
  validateRequest,
  isStudentEmailVerified,
  studentLogin
);

// POST /api/auth/student/register
router.post('/student/register',
  studentRegisterValidation,
  validateRequest,
  studentRegister
);

// ==================== TOKEN MANAGEMENT ====================
// GET /api/auth/verify
router.get('/verify', authenticate, verifyToken);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// ==================== EMAIL VERIFICATION ====================

//POST /api/auth/resend-verification
router.post('/resend-verification', resendVerificationEmail);

//POST /api/auth/verify-email/:userType/:token
router.post('/verify-email/:userType/:token', emailVerification);


// ==================== COMMON ROUTES ====================

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// POST /api/auth/logout-all
router.post('/logout-all', authenticate, logoutAllDevices);

// POST /api/auth/forgot-password
// router.post('/forgot-password',
//   body('email').isEmail().normalizeEmail(),
//   validateRequest,
//   forgotPassword
// );

// POST /api/auth/reset-password
// router.post('/reset-password',
//   [
//     body('token').notEmpty().withMessage('Reset token is required'),
//     body('password')
//       .isLength({ min: 6 })
//       .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
//       .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
//   ],
//   validateRequest,
//   resetPassword
// );

// GET /api/auth/me - Get current user info
router.get('/me', authenticate, async (req, res) => {
  try {
    // User info is already attached by authenticate middleware
    res.json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        institutionId: req.user.institutionId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
