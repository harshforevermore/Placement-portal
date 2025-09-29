import { useState } from 'react';
import { Building2, Mail, Lock, Eye, EyeOff, Shield, Users } from 'lucide-react';

const InstitutionLogin = ({ onClose, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    institutionEmail: '',
    password: '',
    institutionId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.institutionEmail) {
      newErrors.institutionEmail = 'Institution email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.institutionEmail)) {
      newErrors.institutionEmail = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.institutionId) {
      newErrors.institutionId = 'Institution ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Institution login:', formData);
      // Handle successful login
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-lg w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="bg-purple-600/20 p-3 rounded-full">
            <Building2 className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Institution Login</h2>
            <p className="text-slate-400 text-sm">Access your placement management dashboard</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Institution Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Institution Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="email"
              name="institutionEmail"
              value={formData.institutionEmail}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="admin@university.edu"
            />
          </div>
          {errors.institutionEmail && (
            <p className="text-red-400 text-sm">{errors.institutionEmail}</p>
          )}
        </div>

        {/* Institution ID */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Institution ID
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="text"
              name="institutionId"
              value={formData.institutionId}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="INST001"
            />
          </div>
          {errors.institutionId && (
            <p className="text-red-400 text-sm">{errors.institutionId}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-12 pr-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-slate-600 text-purple-600 bg-slate-700 focus:ring-purple-500 focus:ring-offset-0"
            />
            <span className="ml-2 text-sm text-slate-300">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Signing in...
            </>
          ) : (
            <>
              <Users className="w-5 h-5" />
              Sign In to Dashboard
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">Need an account?</span>
          </div>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
        <button
          onClick={onSwitchToSignup}
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
          Register your institution
        </button>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Institution Access</h4>
            <p className="text-xs text-slate-400">
              Use your official institution email and unique Institution ID. Contact your system administrator if you need assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
};

export default InstitutionLogin;