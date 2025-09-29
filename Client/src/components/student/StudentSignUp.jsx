import { useState } from 'react';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, Phone, Calendar, BookOpen, Award, FileText, CheckCircle } from 'lucide-react';

const StudentSignup = ({ onClose, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Step 2: Academic Information
    institutionName: '',
    course: '',
    branch: '',
    yearOfStudy: '',
    rollNumber: '',
    cgpa: '',
    
    // Step 3: Account & Skills
    password: '',
    confirmPassword: '',
    skills: '',
    resume: null,
    agreedToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const courseOptions = [
    'Bachelor of Technology (B.Tech)',
    'Bachelor of Engineering (B.E.)',
    'Bachelor of Computer Applications (BCA)',
    'Bachelor of Science (B.Sc)',
    'Bachelor of Commerce (B.Com)',
    'Bachelor of Business Administration (BBA)',
    'Master of Technology (M.Tech)',
    'Master of Business Administration (MBA)',
    'Master of Computer Applications (MCA)',
    'Other'
  ];

  const branchOptions = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Aerospace Engineering',
    'Other'
  ];

  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'];

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 16 || age > 40) {
          newErrors.dateOfBirth = 'Age must be between 16 and 40 years';
        }
      }
      if (!formData.gender) newErrors.gender = 'Please select gender';
    }

    if (step === 2) {
      if (!formData.institutionName) newErrors.institutionName = 'Institution name is required';
      if (!formData.course) newErrors.course = 'Please select your course';
      if (!formData.branch) newErrors.branch = 'Please select your branch/specialization';
      if (!formData.yearOfStudy) newErrors.yearOfStudy = 'Please select year of study';
      if (!formData.rollNumber) newErrors.rollNumber = 'Roll number is required';
      if (!formData.cgpa) {
        newErrors.cgpa = 'CGPA is required';
      } else if (formData.cgpa < 0 || formData.cgpa > 10) {
        newErrors.cgpa = 'CGPA must be between 0 and 10';
      }
    }

    if (step === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.agreedToTerms) {
        newErrors.agreedToTerms = 'You must agree to the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Student registration:', formData);
      // Handle successful registration
      onClose();
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
      </div>

      {/* First Name & Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            First Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="John"
            />
          </div>
          {errors.firstName && (
            <p className="text-red-400 text-sm">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Last Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Doe"
            />
          </div>
          {errors.lastName && (
            <p className="text-red-400 text-sm">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="john.doe@university.edu"
          />
        </div>
        {errors.email && (
          <p className="text-red-400 text-sm">{errors.email}</p>
        )}
      </div>

      {/* Phone & Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="9876543210"
            />
          </div>
          {errors.phone && (
            <p className="text-red-400 text-sm">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Date of Birth *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          {errors.dateOfBirth && (
            <p className="text-red-400 text-sm">{errors.dateOfBirth}</p>
          )}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Gender *
        </label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select gender</option>
          {genderOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {errors.gender && (
          <p className="text-red-400 text-sm">{errors.gender}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Academic Information</h3>
      </div>

      {/* Institution Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Institution Name *
        </label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
          <input
            type="text"
            name="institutionName"
            value={formData.institutionName}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="ABC University"
          />
        </div>
        {errors.institutionName && (
          <p className="text-red-400 text-sm">{errors.institutionName}</p>
        )}
      </div>

      {/* Course & Branch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Course *
          </label>
          <select
            name="course"
            value={formData.course}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select course</option>
            {courseOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.course && (
            <p className="text-red-400 text-sm">{errors.course}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Branch/Specialization *
          </label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select branch</option>
            {branchOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.branch && (
            <p className="text-red-400 text-sm">{errors.branch}</p>
          )}
        </div>
      </div>

      {/* Year of Study & Roll Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Year of Study *
          </label>
          <select
            name="yearOfStudy"
            value={formData.yearOfStudy}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select year</option>
            {yearOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.yearOfStudy && (
            <p className="text-red-400 text-sm">{errors.yearOfStudy}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Roll Number *
          </label>
          <input
            type="text"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="CS2021001"
          />
          {errors.rollNumber && (
            <p className="text-red-400 text-sm">{errors.rollNumber}</p>
          )}
        </div>
      </div>

      {/* CGPA */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          CGPA *
        </label>
        <div className="relative">
          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
          <input
            type="number"
            name="cgpa"
            value={formData.cgpa}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            max="10"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="8.5"
          />
        </div>
        {errors.cgpa && (
          <p className="text-red-400 text-sm">{errors.cgpa}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Account Setup & Additional Details</h3>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 pr-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-green-400 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-400 text-sm">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Confirm Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 pr-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-green-400 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Skills (Optional)
        </label>
        <textarea
          name="skills"
          value={formData.skills}
          onChange={handleInputChange}
          rows="3"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          placeholder="e.g., JavaScript, Python, React, Machine Learning, etc."
        />
      </div>

      {/* Resume Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Resume (Optional)
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
          <input
            type="file"
            name="resume"
            onChange={handleInputChange}
            accept=".pdf,.doc,.docx"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-slate-400">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
      </div>

      {/* Password Requirements */}
      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
        <h4 className="text-sm font-medium text-white mb-2">Password Requirements:</h4>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Contains uppercase and lowercase letters</li>
          <li>• Contains at least one number</li>
        </ul>
      </div>

      {/* Terms Agreement */}
      <div className="space-y-2">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleInputChange}
            className="mt-1 rounded border-slate-600 text-green-600 bg-slate-700 focus:ring-green-500 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-300">
            I agree to the{' '}
            <button type="button" className="text-green-400 hover:text-green-300 underline">
              Terms of Service
            </button>
            {' '}and{' '}
            <button type="button" className="text-green-400 hover:text-green-300 underline">
              Privacy Policy
            </button>
          </span>
        </label>
        {errors.agreedToTerms && (
          <p className="text-red-400 text-sm">{errors.agreedToTerms}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-800 p-8 rounded-lg w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="bg-green-600/20 p-3 rounded-full">
            <GraduationCap className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Student Registration</h2>
            <p className="text-slate-400 text-sm">Start your placement journey with us</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-600 text-slate-400'
                }`}
              >
                {step < currentStep ? <CheckCircle className="w-5 h-5" /> : <span className='absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'>{step}</span>}
              </div>
              {/* {step < 3 && (
                <div
                  className={`w-full h-1 mx-4 ${
                    step < currentStep ? 'bg-green-600' : 'bg-slate-600'
                  }`}
                />
              )} */}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Personal Info</span>
          <span>Academic Details</span>
          <span>Account & Skills</span>
        </div>
      </div>

      {/* Form Container */}
      <div>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 mt-6 border-t border-slate-600">
          <button
            type="button"
            onClick={currentStep === 1 ? onSwitchToLogin : handlePrevious}
            className="text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            {currentStep === 1 ? 'Already have an account?' : 'Previous'}
          </button>
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;