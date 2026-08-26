import express from 'express';
import { getHolidays, createHoliday, deleteHoliday } from '../controllers/holiday.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

// Everyone can view holidays
router.get('/', getHolidays);

// Only admins and HR can manage holidays
router.post('/', authorize('ADMIN', 'HR'), createHoliday);
router.delete('/:id', authorize('ADMIN', 'HR'), deleteHoliday);

export default router;
