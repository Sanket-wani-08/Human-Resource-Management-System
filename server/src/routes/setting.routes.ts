import express from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

// Everyone can get settings
router.get('/', getSettings);

// Only admins can update
router.put('/', authorize('ADMIN'), updateSettings);

export default router;
