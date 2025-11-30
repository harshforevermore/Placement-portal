import { Routes, Route } from 'react-router-dom';

// Import page components
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import FindInstitutionPage from '../pages/FindInstitutionPage';

// Student components
import StudentSignup from '../components/student/StudentSignUp';
import StudentLogin from '../components/student/StudentLogin';
import StudentDashboard from '../components/student/StudentDashboard';
import StudentProfile from '../components/student/StudentProfile';
import ApplicationHistory from '../components/student/ApplicationHistory';

// Institution components
import InstitutionSignup from '../components/institution/InstitutionSignup';
import InstitutionLogin from '../components/institution/InstitutionLogin';
import InstitutionDashboard from '../components/institution/InstitutionDashboard';
import StudentManagement from '../components/institution/StudentManagement';
import PlacementManagement from '../components/institution/PlacementManagement';

// Admin components
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import InstitutionApproval from '../components/admin/InstitutionApproval';
import SystemSettings from '../components/admin/SystemSettings';

// Auth components
import { AdminRoute, InstitutionRoute, StudentRoute } from '../components/auth/ProtectedRoute';
import VerifyEmail from '../components/common/VerifyEmail';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/find-institution" element={<FindInstitutionPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path='/verify-email/:userType/:token' element={<VerifyEmail />} />

      {/* Student Routes */}
      <Route path="/student">
        <Route path="signup" element={<StudentSignup />} />
        <Route path="login" element={<StudentLogin />} />
        <Route 
          path="dashboard" 
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          } 
        />
        <Route 
          path="profile" 
          element={
            <StudentRoute>
              <StudentProfile />
            </StudentRoute>
          } 
        />
        <Route 
          path="applications" 
          element={
            <StudentRoute>
              <ApplicationHistory />
            </StudentRoute>
          } 
        />
      </Route>

      {/* Institution Routes */}
      <Route path="/institution">
        <Route path="signup" element={<InstitutionSignup />} />
        <Route path="login" element={<InstitutionLogin />} />
        <Route 
          path="dashboard" 
          element={
            <InstitutionRoute>
              <InstitutionDashboard />
            </InstitutionRoute>
          } 
        />
        <Route 
          path="students" 
          element={
            <InstitutionRoute>
              <StudentManagement />
            </InstitutionRoute>
          } 
        />
        <Route 
          path="Management" 
          element={
            <InstitutionRoute>
              <PlacementManagement />
            </InstitutionRoute>
          } 
        />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <Route path="login" element={<AdminLogin />} />
        <Route 
          path="dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="institutions" 
          element={
            <AdminRoute>
              <InstitutionApproval />
            </AdminRoute>
          } 
        />
        <Route 
          path="settings" 
          element={
            <AdminRoute>
              <SystemSettings />
            </AdminRoute>
          } 
        />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;