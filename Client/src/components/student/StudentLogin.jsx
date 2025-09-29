import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Lock,
  Mail,
  AlertTriangle,
  ArrowLeft,
  School,
  CheckCircle
} from 'lucide-react';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock authentication logic
      if (formData.email === 'student@iitdelhi.ac.in' && formData.password === 'student123') {
        // Success - redirect to student dashboard
        navigate('/student/dashboard');
      } else {
        setError('Invalid email or password. Please check your credentials.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic
    alert('Password reset link will be sent to your registered email address.');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-slate-900 to-green-900/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.1),transparent)] opacity-70" />
      
      {/* Back to home link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center text-slate-400 hover:text-white transition-colors duration-200 z-10"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Home
      </Link>

      {/* Main login container */}
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg shadow-green-600/25">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Student Login</h1>
          <p className="text-slate-400">Access your placement dashboard</p>
        </div>

        {/* Welcome Banner */}
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 mb-6 flex items-center">
          <School className="text-green-400 mr-3 flex-shrink-0" size={20} />
          <div>
            <p className="text-green-200 text-sm font-medium">Welcome Back!</p>
            <p className="text-green-300 text-xs">Track your placement journey and opportunities</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center animate-in slide-in-from-top-2 duration-300">
                <AlertTriangle className="text-red-400 mr-3 flex-shrink-0" size={20} />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Student Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="your.email@college.edu"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                Use your institution email address
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-600 bg-slate-700 rounded transition-colors duration-200"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-300">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-green-400 hover:text-green-300 transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing you in...
                </>
              ) : (
                <>
                  <User className="mr-2" size={20} />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/student/signup" 
                className="text-green-400 hover:text-green-300 font-medium transition-colors duration-200"
              >
                Register as Student
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-6 bg-slate-800/60 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center">
            <CheckCircle className="mr-2 text-green-400" size={16} />
            What you can do:
          </h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center">
              <div className="w-1 h-1 bg-green-400 rounded-full mr-2"></div>
              Track your job applications and interview schedules
            </li>
            <li className="flex items-center">
              <div className="w-1 h-1 bg-green-400 rounded-full mr-2"></div>
              Browse and apply for placement opportunities
            </li>
            <li className="flex items-center">
              <div className="w-1 h-1 bg-green-400 rounded-full mr-2"></div>
              Update your profile and academic information
            </li>
            <li className="flex items-center">
              <div className="w-1 h-1 bg-green-400 rounded-full mr-2"></div>
              Get notifications about new job postings
            </li>
          </ul>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center space-x-4 text-xs">
            <Link to="/student/help" className="text-slate-400 hover:text-white transition-colors duration-200">
              Student Help
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/contact" className="text-slate-400 hover:text-white transition-colors duration-200">
              Contact Support
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Demo credentials hint (remove in production) */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg border border-slate-700 max-w-xs">
        <p className="text-xs text-slate-400 mb-2 font-medium">Demo Credentials:</p>
        <div className="space-y-1 text-xs text-slate-500">
          <p>Email: student@iitdelhi.ac.in</p>
          <p>Password: student123</p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;