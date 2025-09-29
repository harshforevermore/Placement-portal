import { validationResult } from 'express-validator';

// Validation middleware to handle express-validator errors
export const validateRequest = (req, res, next) => {
  console.log()
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }

  next();
};

// Custom validation functions
export const validateObjectId = (id) => {
  const ObjectIdPattern = /^[0-9a-fA-F]{24}$/;
  return ObjectIdPattern.test(id);
};

export const validateEmail = (email) => {
  const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailPattern.test(email);
};

export const validatePhone = (phone) => {
  const phonePattern = /^[\d\s\+\-\(\)]+$/;
  return phonePattern.test(phone);
};

export const validatePassword = (password) => {
  // At least 6 characters, one uppercase, one lowercase, one number
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordPattern.test(password);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Sanitization functions
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  return email.toLowerCase().trim();
};

// File validation
export const validateFileType = (filename, allowedTypes) => {
  const fileExtension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(fileExtension);
};

export const validateFileSize = (fileSize, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};

// Custom middleware for specific validations
export const validateInstitutionData = (req, res, next) => {
  const { institutionName, institutionType, address } = req.body;

  const errors = [];

  if (!institutionName || institutionName.length < 2) {
    errors.push({
      field: 'institutionName',
      message: 'Institution name must be at least 2 characters long'
    });
  }

  if (!['University', 'College', 'Institute', 'School'].includes(institutionType)) {
    errors.push({
      field: 'institutionType',
      message: 'Invalid institution type'
    });
  }

  if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
    errors.push({
      field: 'address',
      message: 'Complete address is required'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateStudentData = (req, res, next) => {
  const { rollNumber, course, branch, year } = req.body;

  const errors = [];

  if (!rollNumber || rollNumber.trim().length === 0) {
    errors.push({
      field: 'rollNumber',
      message: 'Roll number is required'
    });
  }

  if (!course || course.trim().length === 0) {
    errors.push({
      field: 'course',
      message: 'Course is required'
    });
  }

  if (!branch || branch.trim().length === 0) {
    errors.push({
      field: 'branch',
      message: 'Branch is required'
    });
  }

  if (!year || year < 1 || year > 6) {
    errors.push({
      field: 'year',
      message: 'Year must be between 1 and 6'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Rate limiting validation
export const validateRequestRate = (maxRequests = 5, windowMs = 60000) => {
  const requestCounts = new Map();

  return (req, res, next) => {
    const identifier = req.ip + req.user?.id || req.ip;
    const currentTime = Date.now();
    
    if (!requestCounts.has(identifier)) {
      requestCounts.set(identifier, { count: 1, resetTime: currentTime + windowMs });
      return next();
    }

    const requestData = requestCounts.get(identifier);
    
    if (currentTime > requestData.resetTime) {
      requestCounts.set(identifier, { count: 1, resetTime: currentTime + windowMs });
      return next();
    }

    if (requestData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((requestData.resetTime - currentTime) / 1000)
      });
    }

    requestData.count++;
    next();
  };
};