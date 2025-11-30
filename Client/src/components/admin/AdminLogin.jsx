import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Shield, 
  Lock,
  Mail,
  AlertTriangle,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const AdminLogin = () => {
  const {login, isAuthenticated, user} = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password || !formData.adminCode) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    const result = await login(formData, "admin");
    if (result.success) {
      toast.success("Logged in successfully");
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-slate-900 to-orange-900/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.1),transparent)] opacity-70" />
      
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4 shadow-lg shadow-red-600/25">
            <Settings className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Admin</h1>
          <p className="text-slate-400">Secure administrative access</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6 flex items-center">
          <Shield className="text-red-400 mr-3 flex-shrink-0" size={20} />
          <div>
            <p className="text-red-200 text-sm font-medium">Restricted Access</p>
            <p className="text-red-300 text-xs">This area is for authorized administrators only</p>
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
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="admin@placementportal.com"
                  required
                />
              </div>
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
                  className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
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

            {/* Admin Code Field */}
            <div className="space-y-2">
              <label htmlFor="adminCode" className="block text-sm font-medium text-slate-300">
                Admin Access Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  id="adminCode"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter admin code"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                Contact your system administrator for the access code
              </p>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="mr-2" size={20} />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Additional Security Info */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="flex items-center justify-center text-xs text-slate-500">
              <Shield className="mr-2" size={14} />
              <span>This session is encrypted and monitored for security</span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-slate-500 text-sm">
            Need assistance? Contact IT support
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs">
            <Link to="/help" className="text-slate-400 hover:text-white transition-colors duration-200">
              Help Center
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/security" className="text-slate-400 hover:text-white transition-colors duration-200">
              Security Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Demo credentials hint (remove in production) */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg border border-slate-700 max-w-xs">
        <p className="text-xs text-slate-400 mb-2 font-medium">Demo Credentials:</p>
        <div className="space-y-1 text-xs text-slate-500">
          <p>Email: admin@placementportal.com</p>
          <p>Password: admin123</p>
          <p>Code: SUPER2025</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;