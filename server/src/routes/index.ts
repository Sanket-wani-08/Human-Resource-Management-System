import express from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import departmentRoutes from './department.routes';
import attendanceRoutes from './attendance.routes';
import leaveRoutes from './leave.routes';
import payrollRoutes from './payroll.routes';
import dashboardRoutes from './dashboard.routes';
import settingRoutes from './setting.routes';
import holidayRoutes from './holiday.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingRoutes);
router.use('/holidays', holidayRoutes);

export default router;
