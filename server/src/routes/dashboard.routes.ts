import express from 'express';
import {
  getAdminDashboard,
  getEmployeeDashboard,
} from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/admin', authorize('ADMIN', 'HR'), getAdminDashboard);
router.get('/employee', getEmployeeDashboard);

export default router;
