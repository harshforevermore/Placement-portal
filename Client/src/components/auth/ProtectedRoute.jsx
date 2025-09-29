import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Loader2, Lock, User, Building2, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole, fallback = null }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Mock authentication check - replace with actual auth logic
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setLoading(true);
        
        // Simulate API call to check authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user data - replace with actual auth service
        const mockUser = localStorage.getItem('currentUser') 
          ? JSON.parse(localStorage.getItem('currentUser'))
          : null;
        
        // For demo purposes, you can set a mock user
        // Uncomment one of these for testing:
        
        // Mock admin user
        // const mockUser = { 
        //   id: 1, 
        //   role: 'admin', 
        //   name: 'System Admin',
        //   email: 'admin@platform.com',
        //   isAuthenticated: true 
        // };
        
        // Mock student user
        // const mockUser = { 
        //   id: 2, 
        //   role: 'student', 
        //   name: 'John Doe',
        //   email: 'john@university.edu',
        //   isAuthenticated: true,
        //   institution: 'ABC University'
        // };
        
        // Mock institution user
        // const mockUser = { 
        //   id: 3, 
        //   role: 'institution', 
        //   name: 'Jane Smith',
        //   email: 'admin@university.edu',
        //   isAuthenticated: true,
        //   institutionName: 'ABC University'
        // };

        setUser(mockUser);
      } catch (err) {
        setError('Authentication check failed');
        console.error('Auth error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Verifying Access</h2>
            <p className="text-slate-400">Please wait while we check your authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-slate-800 p-8 rounded-lg border border-red-600/20 max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !user.isAuthenticated) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 max-w-md">
            <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
            <p className="text-slate-400 mb-6">
              You need to be logged in to access this page. Please sign in to continue.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  // Navigate to login - replace with actual navigation logic
                  console.log('Navigate to login');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  navigate("/");
                }}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    const getRoleInfo = (role) => {
      switch (role) {
        case 'admin':
          return { 
            icon: Shield, 
            color: 'red', 
            label: 'Platform Administrator',
            description: 'System-level access required'
          };
        case 'institution':
          return { 
            icon: Building2, 
            color: 'purple', 
            label: 'Institution Administrator',
            description: 'Institution management access required'
          };
        case 'student':
          return { 
            icon: User, 
            color: 'green', 
            label: 'Student',
            description: 'Student portal access required'
          };
        default:
          return { 
            icon: UserCheck, 
            color: 'blue', 
            label: 'Authorized User',
            description: 'Specific role access required'
          };
      }
    };

    const requiredRoleInfo = getRoleInfo(requiredRole);
    const userRoleInfo = getRoleInfo(user.role);
    const IconComponent = requiredRoleInfo.icon;

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-slate-800 p-8 rounded-lg border border-yellow-600/20 max-w-lg">
            <IconComponent className={`w-12 h-12 text-${requiredRoleInfo.color}-400 mx-auto mb-4`} />
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-4">
              This page requires <span className={`text-${requiredRoleInfo.color}-400 font-medium`}>
                {requiredRoleInfo.label}
              </span> access.
            </p>
            
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Your Role:</span>
                <span className={`text-${userRoleInfo.color}-400 font-medium`}>
                  {userRoleInfo.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-300">Required Role:</span>
                <span className={`text-${requiredRoleInfo.color}-400 font-medium`}>
                  {requiredRoleInfo.label}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              {requiredRoleInfo.description}. Please contact your administrator if you believe this is an error.
            </p>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  // Navigate to appropriate dashboard based on user role
                  console.log(`Navigate to ${user.role} dashboard`);
                }}
                className={`w-full bg-${userRoleInfo.color}-600 hover:bg-${userRoleInfo.color}-700 text-white py-2 px-4 rounded-lg transition-colors`}
              >
                Go to My Dashboard
              </button>
              <button 
                onClick={() => {
                  // Logout functionality
                  localStorage.removeItem('currentUser');
                  window.location.reload();
                }}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has correct role
  return children;
};

// Higher-order component for specific role protection
export const withAuth = (WrappedComponent, requiredRole = null) => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific route protectors for convenience
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

export const InstitutionRoute = ({ children }) => (
  <ProtectedRoute requiredRole="institution">{children}</ProtectedRoute>
);

export const StudentRoute = ({ children }) => (
  <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>
);

// Hook for checking authentication status
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Replace with actual auth check
        const mockUser = localStorage.getItem('currentUser') 
          ? JSON.parse(localStorage.getItem('currentUser'))
          : null;
        setUser(mockUser);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user?.isAuthenticated,
    login,
    logout
  };
};

export default ProtectedRoute;