import express from 'express';
import {
  getInstitutionDashboardStats,
  getRecentPlacements,
  getActiveDrives,
  getUpcomingEvents,
  getDepartmentStats,
  getInstitutionProfile
} from '../../controllers/institution/institutionDashboard.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// All routes require institution authentication
router.use(authenticate);

// Dashboard routes
router.get('/dashboard/stats', getInstitutionDashboardStats);
router.get('/dashboard/recent-placements', getRecentPlacements);
router.get('/dashboard/active-drives', getActiveDrives);
router.get('/dashboard/upcoming-events', getUpcomingEvents);
router.get('/dashboard/department-stats', getDepartmentStats);

// Profile
router.get('/profile', getInstitutionProfile);

export default router;