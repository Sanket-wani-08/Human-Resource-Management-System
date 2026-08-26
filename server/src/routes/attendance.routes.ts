import express from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

// Employee routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my', getMyAttendance);

// Admin routes
router.get('/', authorize('ADMIN', 'HR'), getAllAttendance);
router.put('/:id', authorize('ADMIN', 'HR'), updateAttendance);
router.delete('/:id', authorize('ADMIN', 'HR'), deleteAttendance);

export default router;
