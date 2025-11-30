import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Verifying Access</h2>
            <p className="text-slate-400">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-slate-800 p-8 rounded-lg border border-yellow-600/20 max-w-lg">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-6">
              This page requires <span className="text-yellow-400 font-medium">{requiredRole}</span> access.
            </p>

            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Your Role:</span>
                <span className="text-blue-400 font-medium">{user.role}</span>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.href = `/${user.role}/dashboard`;
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Go to My Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and authorized
  return children;
};

// Convenience wrappers
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

export const InstitutionRoute = ({ children }) => (
  <ProtectedRoute requiredRole="institution">{children}</ProtectedRoute>
);

export const StudentRoute = ({ children }) => (
  <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>
);

export default ProtectedRoute;