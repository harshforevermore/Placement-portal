import { useState } from 'react';
import { Building2, Mail, Lock, Eye, EyeOff, Shield, User, Phone, MapPin, FileText, CheckCircle } from 'lucide-react';

const InstitutionSignup = ({ onClose, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Institution Info
    institutionName: '',
    institutionType: '',
    establishedYear: '',
    website: '',
    
    // Step 2: Contact Information
    adminName: '',
    adminEmail: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Step 3: Account Setup
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const institutionTypes = [
    'University',
    'Engineering College',
    'Business School',
    'Medical College',
    'Arts & Science College',
    'Technical Institute',
    'Polytechnic',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      if (!formData.institutionName) newErrors.institutionName = 'Institution name is required';
      if (!formData.institutionType) newErrors.institutionType = 'Please select institution type';
      if (!formData.establishedYear) {
        newErrors.establishedYear = 'Established year is required';
      } else if (formData.establishedYear < 1800 || formData.establishedYear > new Date().getFullYear()) {
        newErrors.establishedYear = 'Please enter a valid year';
      }
      if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
        newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
      }
    }

    if (step === 2) {
      if (!formData.adminName) newErrors.adminName = 'Admin name is required';
      if (!formData.adminEmail) {
        newErrors.adminEmail = 'Admin email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
        newErrors.adminEmail = 'Please enter a valid email address';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.pincode) {
        newErrors.pincode = 'Pincode is required';
      } else if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Please enter a valid 6-digit pincode';
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
      console.log('Institution registration:', formData);
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
        <h3 className="text-lg font-semibold text-white mb-4">Basic Institution Information</h3>
      </div>

      {/* Institution Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Institution Name *
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
          <input
            type="text"
            name="institutionName"
            value={formData.institutionName}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="ABC University"
          />
        </div>
        {errors.institutionName && (
          <p className="text-red-400 text-sm">{errors.institutionName}</p>
        )}
      </div>

      {/* Institution Type & Established Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Institution Type *
          </label>
          <select
            name="institutionType"
            value={formData.institutionType}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select type</option>
            {institutionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.institutionType && (
            <p className="text-red-400 text-sm">{errors.institutionType}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Established Year *
          </label>
          <input
            type="number"
            name="establishedYear"
            value={formData.establishedYear}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="1990"
            min="1800"
            max={new Date().getFullYear()}
          />
          {errors.establishedYear && (
            <p className="text-red-400 text-sm">{errors.establishedYear}</p>
          )}
        </div>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Website (Optional)
        </label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="https://www.abcuniversity.edu"
        />
        {errors.website && (
          <p className="text-red-400 text-sm">{errors.website}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
      </div>

      {/* Admin Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Admin Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="text"
              name="adminName"
              value={formData.adminName}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
          {errors.adminName && (
            <p className="text-red-400 text-sm">{errors.adminName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Admin Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="admin@abcuniversity.edu"
            />
          </div>
          {errors.adminEmail && (
            <p className="text-red-400 text-sm">{errors.adminEmail}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="9876543210"
          />
        </div>
        {errors.phone && (
          <p className="text-red-400 text-sm">{errors.phone}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Address *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-4 text-purple-400 w-5 h-5" />
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows="3"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Enter complete address"
          />
        </div>
        {errors.address && (
          <p className="text-red-400 text-sm">{errors.address}</p>
        )}
      </div>

      {/* City, State, Pincode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Mumbai"
          />
          {errors.city && (
            <p className="text-red-400 text-sm">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            State *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Maharashtra"
          />
          {errors.state && (
            <p className="text-red-400 text-sm">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Pincode *
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="400001"
            maxLength="6"
          />
          {errors.pincode && (
            <p className="text-red-400 text-sm">{errors.pincode}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Account Setup</h3>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 pr-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
          >
            {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
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
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 pr-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
          >
            {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
        )}
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
            className="mt-1 rounded border-slate-600 text-purple-600 bg-slate-700 focus:ring-purple-500 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-300">
            I agree to the{' '}
            <button type="button" className="text-purple-400 hover:text-purple-300 underline">
              Terms of Service
            </button>
            {' '}and{' '}
            <button type="button" className="text-purple-400 hover:text-purple-300 underline">
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
    <div className="institution-signup-container bg-slate-800 p-8 rounded-lg w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="bg-purple-600/20 p-3 rounded-full">
            <Building2 className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Institution Registration</h2>
            <p className="text-slate-400 text-sm">Join our placement management platform</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="place-items-center place-content-center">
              <div
                className={`relative w-10 h-10 place-items-center place-content-center rounded-full font-semibold ${
                  step <= currentStep
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-600 text-slate-400'
                }`}
              >
                {step < currentStep ? <CheckCircle className="w-5 h-5" /> : <span className='absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'>{step}</span>}
              </div>
              {/* {step < 3 && (
                <div
                  className={`w-full h-1 mx-4 ${
                    step < currentStep ? 'bg-purple-600' : 'bg-slate-600'
                  }`}
                />
              )} */}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Basic Info</span>
          <span>Contact Details</span>
          <span>Account Setup</span>
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
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            {currentStep === 1 ? 'Already have an account?' : 'Previous'}
          </button>
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
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

export default InstitutionSignup;