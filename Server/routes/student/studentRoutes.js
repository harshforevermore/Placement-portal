// Server/routes/student.js
import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import {
  getDashboardStats,
  getRecentApplications,
  getUpcomingEvents,
  getAvailableJobs,
  getStudentProfile,
  updateStudentProfile
} from '../../controllers/student/studentDashboard.js';

const router = express.Router();

// All routes below require valid authentication token
// and student role verification
router.use(authenticate);

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-applications', getRecentApplications);
router.get('/dashboard/upcoming-events', getUpcomingEvents);
router.get('/dashboard/available-jobs', getAvailableJobs);
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// ============================================
// FUTURE ROUTES (To be implemented)
// ============================================

// Application Management Routes
// router.get('/applications', getAllApplications);
// router.get('/applications/:id', getApplicationDetails);
// router.post('/applications', submitApplication);
// router.put('/applications/:id', updateApplication);
// router.delete('/applications/:id', withdrawApplication);

// Job/Placement Drive Routes
// router.get('/jobs', searchJobs);
// router.get('/jobs/:id', getJobDetails);
// router.post('/jobs/:id/apply', applyForJob);

// Document Management Routes
// router.post('/documents/upload', uploadDocument);
// router.get('/documents', getMyDocuments);
// router.delete('/documents/:id', deleteDocument);

// Notification Routes
// router.get('/notifications', getNotifications);
// router.put('/notifications/:id/read', markNotificationAsRead);
// router.put('/notifications/read-all', markAllNotificationsAsRead);

// Interview Routes
// router.get('/interviews', getMyInterviews);
// router.get('/interviews/:id', getInterviewDetails);
// router.put('/interviews/:id/confirm', confirmInterview);

export default router;