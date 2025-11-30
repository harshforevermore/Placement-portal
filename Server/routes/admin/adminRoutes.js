import express from 'express';
import {
  getDashboardStats,
  getRecentInstitutions,
  getAllInstitutions,
  getInstitutionDetails,
  approveInstitution,
  rejectInstitution,
  suspendInstitution,
  getActivityLogs
} from '../../controllers/admin/adminDashboard.js';
import { authenticate } from '../../middleware/auth.js';
import { adminOnly } from '../../middleware/roleCheck.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(adminOnly);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-institutions', getRecentInstitutions);
router.get('/dashboard/activity-logs', getActivityLogs);

// Institution management
router.get('/institutions', getAllInstitutions);
router.get('/institutions/:id', getInstitutionDetails);
router.put('/institutions/:id/approve', approveInstitution);
router.put('/institutions/:id/reject', rejectInstitution);
router.put('/institutions/:id/suspend', suspendInstitution);

export default router;