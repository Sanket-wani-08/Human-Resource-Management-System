import express from 'express';
import {
  createPayroll,
  getAllPayroll,
  getMyPayroll,
  getPayrollById,
  updatePayroll,
} from '../controllers/payroll.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

// Employee routes
router.get('/my', getMyPayroll);

// Admin routes
router.use(authorize('ADMIN', 'HR'));
router.post('/', createPayroll);
router.get('/', getAllPayroll);
router.get('/:id', getPayrollById);
router.put('/:id', updatePayroll);

export default router;
