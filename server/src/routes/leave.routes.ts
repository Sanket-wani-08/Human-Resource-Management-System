import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
} from '../controllers/leave.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

// Employee routes
router.post('/', applyLeave);
router.get('/my', getMyLeaves);

// Admin routes
router.get('/', authorize('ADMIN', 'HR'), getAllLeaves);
router.patch('/:id/approve', authorize('ADMIN', 'HR'), approveLeave);
router.patch('/:id/reject', authorize('ADMIN', 'HR'), rejectLeave);

export default router;
