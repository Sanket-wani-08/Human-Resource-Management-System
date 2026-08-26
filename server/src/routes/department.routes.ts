import express from 'express';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

// Everyone can view departments
router.get('/', getDepartments);
router.get('/:id', getDepartment);

// Only ADMIN can modify departments
router.post('/', authorize('ADMIN'), createDepartment);
router.put('/:id', authorize('ADMIN'), updateDepartment);
router.delete('/:id', authorize('ADMIN'), deleteDepartment);

export default router;
