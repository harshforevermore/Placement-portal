import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { X, User, UserPlus, School, Building2, Settings } from 'lucide-react';

const Navbar = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const navigate = useNavigate();
  const handleSignInClick = (e) => {
    e.preventDefault();
    setShowLoginDialog(true);
  };

  const handleSignUpClick = (e) => {
    e.preventDefault();
    setShowSignupDialog(true);
  };

  const closeDialogs = () => {
    setShowLoginDialog(false);
    setShowSignupDialog(false);
  };

  const handleSignupOption = (userType) => {
    setShowSignupDialog(false);
    switch(userType) {
      case "student":
        navigate("/student/signup");
        break;
      case "institution":
        navigate("/institution/signup");
        break;
      default:
        navigate("/");
    };
  }
  const handleLoginOption = (userType) => {
    setShowLoginDialog(false);
    switch(userType) {
      case "student":
        navigate("/student/login");
        break;
      case "institution":
        navigate("/institution/login");
        break;
      case "platform":
        navigate("/admin/login");
        break;
      default:
        navigate("/");
    };
  };

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
              <div className="bg-blue-600 p-2 rounded-lg">
                <span className="text-white font-bold text-xl">PP</span>
              </div>
              {/* <span className="ml-3 text-white text-xl font-semibold">Placement Portal</span> */}
            </Link>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleSignInClick}
                className="cursor-pointer text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-slate-800"
              >
                Sign In
              </button>
              <button 
                onClick={handleSignUpClick}
                className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-100 transform"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Dialog Modal */}
      {showLoginDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-700">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Choose Login Type</h2>
              <button 
                onClick={closeDialogs}
                className="cursor-pointer text-slate-400 hover:text-white transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Dialog Content */}
            <div className="p-6 space-y-4">
              {/* Student Login */}
              <button
                onClick={() => handleLoginOption('student')}
                className="cursor-pointer w-full flex items-center p-4 rounded-lg border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all duration-200 group"
              >
                <div className="bg-green-600 p-3 rounded-lg group-hover:bg-green-500 transition-colors duration-200">
                  <User className="text-white" size={24} />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-white font-semibold text-lg">Student</h3>
                  <p className="text-slate-400 text-sm">Access your placement dashboard</p>
                </div>
              </button>

              {/* Institution Admin Login */}
              <button
                onClick={() => handleLoginOption('institution')}
                className="cursor-pointer w-full flex items-center p-4 rounded-lg border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all duration-200 group"
              >
                <div className="bg-purple-600 p-3 rounded-lg group-hover:bg-purple-500 transition-colors duration-200">
                  <Building2 className="text-white" size={24} />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-white font-semibold text-lg">Institution Admin</h3>
                  <p className="text-slate-400 text-sm">Manage your institution's placements</p>
                </div>
              </button>

              {/* Platform Admin Login */}
              <button
                onClick={() => handleLoginOption('platform')}
                className="cursor-pointer w-full flex items-center p-4 rounded-lg border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all duration-200 group"
              >
                <div className="bg-red-600 p-3 rounded-lg group-hover:bg-red-500 transition-colors duration-200">
                  <Settings className="text-white" size={24} />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-white font-semibold text-lg">Platform Admin</h3>
                  <p className="text-slate-400 text-sm">Oversee the entire platform</p>
                </div>
              </button>
            </div>

            {/* Dialog Footer */}
            <div className="px-6 py-4 border-t border-slate-700 bg-slate-900 rounded-b-xl">
              <p className="text-center text-slate-400 text-sm">
                Don't have an account? 
                <Link 
                  to="/signup" 
                  className="text-blue-400 hover:text-blue-300 ml-1 transition-colors duration-200"
                  onClick={closeDialogs}
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signup Dialog Modal */}
      {showSignupDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-700">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Choose Account Type</h2>
              <button 
                onClick={closeDialogs}
                className="cursor-pointer text-slate-400 hover:text-white transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Dialog Content */}
            <div className="p-6 space-y-4">
              {/* Student Signup */}
              <button
                onClick={() => handleSignupOption('student')}
                className="cursor-pointer w-full flex items-center p-4 rounded-lg border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all duration-200 group"
              >
                <div className="bg-green-600 p-3 rounded-lg group-hover:bg-green-500 transition-colors duration-200">
                  <UserPlus className="text-white" size={24} />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-white font-semibold text-lg">Student</h3>
                  <p className="text-slate-400 text-sm">Join your institution's placement program</p>
                </div>
              </button>

              {/* Institution Signup */}
              <button
                onClick={() => handleSignupOption('institution')}
                className="cursor-pointer w-full flex items-center p-4 rounded-lg border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all duration-200 group"
              >
                <div className="bg-purple-600 p-3 rounded-lg group-hover:bg-purple-500 transition-colors duration-200">
                  <School className="text-white" size={24} />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-white font-semibold text-lg">Institution</h3>
                  <p className="text-slate-400 text-sm">Register your educational institution</p>
                </div>
              </button>

              {/* Platform Admin Signup - Maybe hide this or make it invitation only */}
              <button
                onClick={() => handleSignupOption('platform')}
                className="cursor-pointer w-full flex items-center p-4 rounded-lg border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all duration-200 group opacity-60"
                disabled
              >
                <div className="bg-red-600 p-3 rounded-lg group-hover:bg-red-500 transition-colors duration-200">
                  <Settings className="text-white" size={24} />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-white font-semibold text-lg">Platform Admin</h3>
                  <p className="text-slate-400 text-sm">Invitation only</p>
                </div>
              </button>
            </div>

            {/* Dialog Footer */}
            <div className="px-6 py-4 border-t border-slate-700 bg-slate-900 rounded-b-xl">
              <p className="text-center text-slate-400 text-sm">
                Already have an account? 
                <button 
                  onClick={() => {
                    setShowSignupDialog(false);
                    setShowLoginDialog(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 ml-1 transition-colors duration-200"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;