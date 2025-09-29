import { Routes, Route } from 'react-router-dom';

// Import page components
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import FindInstitutionPage from '../pages/FindInstitutionPage';
import EmailVerification from '../pages/EmailVerification';

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
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AuthLayout from '../components/auth/AuthLayout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/find-institution" element={<FindInstitutionPage />} />
      <Route path='/verify-email/:token' element={<EmailVerification />} />

      {/* Student Routes */}
      <Route path="/student">
        <Route path="signup" element={<StudentSignup />} />
        <Route path="login" element={<StudentLogin />} />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="applications" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ApplicationHistory />
            </ProtectedRoute>
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
            <ProtectedRoute allowedRoles={['institution']}>
              <InstitutionDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="students" 
          element={
            <ProtectedRoute allowedRoles={['institution']}>
              <StudentManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="Management" 
          element={
            <ProtectedRoute allowedRoles={['institution']}>
              <PlacementManagement />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <Route path="login" element={<AdminLogin />} />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="institutions" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <InstitutionApproval />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="settings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SystemSettings />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;