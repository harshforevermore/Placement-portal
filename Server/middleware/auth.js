import jwt from 'jsonwebtoken';
import { accessTokenCookieOptions, generateAccessToken } from '../utils/tokenUtils.js';
import RefreshToken from '../models/refreshToken.js';
import Institution from '../models/institution/institution.js';
import Student from '../models/student/student.js';

export const authenticate = async (req, res, next) => {
  console.log("Authenticate:");
  try {
    const accT = req.cookies.accT;
    const refT = req.cookies.refT;
    
    // Case 1: No tokens at all
    if (!accT && !refT) {
      console.log("No tokens available");
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }
    
    // Case 2: Access token exists - verify it
    if (accT) {
      console.log("Access token available");
      try {
        const decoded = jwt.verify(accT, process.env.JWT_SECRET);
        
        console.log("Line 1");
        // Token is valid - attach user and continue
        req.user = {
          id: decoded.id,
          role: decoded.role,
          email: decoded.email
        };
        console.log("Line 2");
        
        console.log('✅ Access token valid');
        return next();
        
      } catch (error) {
        // Access token invalid/expired
        if (error.name === 'TokenExpiredError') {
          console.log('⏰ Access token expired, attempting refresh...');
          // Continue to Case 3 (refresh token handling)
        } else {
          // Token is invalid (not just expired)
          return res.status(401).json({
            success: false,
            message: 'Invalid access token',
            code: 'INVALID_TOKEN'
          });
        }
      }
    }
    
    // Case 3: Access token missing/expired - try refresh token
    if (refT) {
      console.log("Access token missing, refresh token available");
      try {
        // Find refresh token in database
        const storedToken = await RefreshToken.findOne({ token: refT });
        console.log(storedToken);
        console.log("Line 1");
        if (!storedToken) {
          res.clearCookie("refT", {path: '/'});
          return res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
            code: 'INVALID_REFRESH_TOKEN'
          });
        }
        console.log("Line 2");
        
        // Check if token is valid
        if (!storedToken.isValid()) {
          return res.status(401).json({
            success: false,
            message: storedToken.isRevoked ? 'Token has been revoked' : 'Refresh token expired',
            code: 'REFRESH_TOKEN_EXPIRED'
          });
        }
        console.log("Line 3");
        
        // Update last used time
        storedToken.lastUsedAt = new Date();
        await storedToken.save();
        
        console.log("Line 4");
        // Generate new access token
        const newAccessToken = generateAccessToken({
          id: storedToken.userId,
          role: storedToken.userRole,
          email: storedToken.email
        });
        
        console.log("Line 5");
        // Set new access token cookie
        res.cookie('accT', newAccessToken, accessTokenCookieOptions);
        
        // Attach user to request
        req.user = {
          id: storedToken.userId,
          role: storedToken.userRole,
          email: storedToken.email
        };
        
        console.log('✅ Access token refreshed successfully');
        return next();
        
      } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(401).json({
          success: false,
          message: 'Failed to refresh token',
          code: 'REFRESH_FAILED'
        });
      }
    }
    
    // Case 4: Access token expired and no refresh token
    console.log("Session Expired");
    return res.status(401).json({
      success: false,
      message: 'Session expired, please login again',
      code: 'SESSION_EXPIRED'
    });
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};


export const isInstitutionEmailVerified = async (req, res, next) => {
  try {
    const { email, institutionId } = req.body;
    const institution = await Institution.findOne({
      email, institutionId
    }).select("emailVerification");

    if (!institution) {
      return res.status(401).json({
        success: false,
        message: "Institution not found",
      });
    }

    if(!institution.emailVerification.emailVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email",
        code: "EMAIL_NOT_VERIFIED"
      });
    }
    next();
  }
  catch(err) {
    console.log("Error: ", err);
  }
};

export const isStudentEmailVerified = async (req, res, next) => {
  try {
    const { email, institutionId } = req.body;
    console.log("request body: ");
    console.log("email: ", email);
    console.log("institutionId: ", institutionId);
    const student = await Student.findOne({
      email, institutionId
    }).select("emailVerification");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Student not found",
      });
    }

    if(!student.emailVerification.emailVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email",
        code: "EMAIL_NOT_VERIFIED"
      });
    }
    next();
  }
  catch(err) {
    console.log("Error: ", err);
  }
};