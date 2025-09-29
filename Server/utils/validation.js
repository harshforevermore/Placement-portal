// Validation utility functions for the placement portal

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation (10 digits)
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Name validation (only letters and spaces, 2-50 chars)
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Institution domain validation
export const validateInstitutionDomain = (domain) => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};

// Student email domain validation (must match institution domain)
export const validateStudentEmailDomain = (email, institutionDomain) => {
  if (!validateEmail(email)) return false;
  const emailDomain = email.split('@')[1].toLowerCase();
  return emailDomain === institutionDomain.toLowerCase();
};

// Admin code validation (6 alphanumeric characters)
export const validateAdminCode = (code) => {
  const codeRegex = /^[A-Z0-9]{6}$/;
  return codeRegex.test(code);
};

// Verification token validation (6 digits)
export const validateVerificationToken = (token) => {
  const tokenRegex = /^\d{6}$/;
  return tokenRegex.test(token);
};

// Password reset token validation (64 hex characters)
export const validatePasswordResetToken = (token) => {
  const tokenRegex = /^[a-f0-9]{64}$/;
  return tokenRegex.test(token);
};

// Institution registration number validation
export const validateRegistrationNumber = (regNumber) => {
  // Flexible validation for various formats (alphanumeric, 6-20 chars)
  const regRegex = /^[A-Z0-9]{6,20}$/;
  return regRegex.test(regNumber.toUpperCase());
};

// Year validation (current year or within reasonable range)
export const validateYear = (year) => {
  const currentYear = new Date().getFullYear();
  const numYear = parseInt(year);
  return numYear >= 1900 && numYear <= currentYear + 10;
};

// Course/Department validation
export const validateCourse = (course) => {
  const courseRegex = /^[a-zA-Z\s&-]{2,100}$/;
  return courseRegex.test(course.trim());
};

// Percentage/CGPA validation
export const validatePercentage = (percentage) => {
  const num = parseFloat(percentage);
  return !isNaN(num) && num >= 0 && num <= 100;
};

export const validateCGPA = (cgpa) => {
  const num = parseFloat(cgpa);
  return !isNaN(num) && num >= 0 && num <= 10;
};

// Website URL validation
export const validateWebsite = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Required field validation
export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim().length > 0;
};

// Comprehensive validation function for user registration
export const validateUserData = (userData, userType) => {
  const errors = {};

  // Common validations
  if (!validateRequired(userData.name)) {
    errors.name = 'Name is required';
  } else if (!validateName(userData.name)) {
    errors.name = 'Name must be 2-50 characters and contain only letters and spaces';
  }

  if (!validateRequired(userData.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!validateRequired(userData.password)) {
    errors.password = 'Password is required';
  } else if (!validatePassword(userData.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
  }

  if (userData.phone && !validatePhone(userData.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }

  // User type specific validations
  switch (userType) {
    case 'admin':
      if (!validateRequired(userData.adminCode)) {
        errors.adminCode = 'Admin code is required';
      } else if (!validateAdminCode(userData.adminCode)) {
        errors.adminCode = 'Admin code must be 6 alphanumeric characters';
      }
      break;

    case 'institution_admin':
      if (!validateRequired(userData.institutionId)) {
        errors.institutionId = 'Institution selection is required';
      }
      break;

    case 'student':
      if (!validateRequired(userData.institutionId)) {
        errors.institutionId = 'Institution selection is required';
      }
      if (userData.rollNumber && !validateRequired(userData.rollNumber)) {
        errors.rollNumber = 'Roll number is required';
      }
      if (userData.course && !validateCourse(userData.course)) {
        errors.course = 'Please enter a valid course name';
      }
      if (userData.year && !validateYear(userData.year)) {
        errors.year = 'Please enter a valid year';
      }
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};