import { Request, Response, NextFunction } from 'express';
import { Employee } from '../models/employee.model';
import { Department } from '../models/department.model';
import { Attendance } from '../models/attendance.model';
import { Leave } from '../models/leave.model';
import { Payroll } from '../models/payroll.model';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only count real EMPLOYEE-role users (exclude ADMIN/HR)
    const employeeUserIds = await Employee.find()
      .populate({ path: 'user', match: { role: 'EMPLOYEE' }, select: '_id' })
      .then(emps => emps.filter(e => e.user).map(e => e._id));

    const totalEmployees = employeeUserIds.length;
    const activeEmployees = await Employee.countDocuments({
      _id: { $in: employeeUserIds },
      status: 'ACTIVE',
    });
    const totalDepartments = await Department.countDocuments({ isActive: true });
    const pendingLeaves = await Leave.countDocuments({ status: 'PENDING' });

    // IST-aware today boundaries
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(new Date().getTime() + IST_OFFSET_MS);
    const today = new Date(
      Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate())
    );
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Only count attendance for real employees
    const presentToday = await Attendance.countDocuments({
      employee: { $in: employeeUserIds },
      date: { $gte: today, $lt: tomorrow },
    });

    // Clamp to 0 — never show negative
    const absentToday = Math.max(0, activeEmployees - presentToday);

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    const payrollTotal = await Payroll.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, total: { $sum: '$netSalary' } } },
    ]);

    const dashboardData = {
      totalEmployees,
      activeEmployees,
      totalDepartments,
      presentToday,
      absentToday,
      pendingLeaves,
      payrollSummary: {
        month: currentMonth,
        year: currentYear,
        total: payrollTotal.length > 0 ? payrollTotal[0].total : 0,
      },
    };

    return sendResponse(res, 200, true, 'Admin dashboard data fetched successfully', dashboardData);
  } catch (error) {
    next(error);
  }
};


export const getEmployeeDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id }).populate('department', 'name');
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee record not found');
    }

    // IST-aware today boundaries
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(new Date().getTime() + IST_OFFSET_MS);
    const today = new Date(
      Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate())
    );
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const todayAttendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: today, $lt: tomorrow }
    });

    const pendingLeaves = await Leave.countDocuments({ employee: employee._id, status: 'PENDING' });
    
    const recentLeaves = await Leave.find({ employee: employee._id })
      .sort({ createdAt: -1 })
      .limit(3);

    const recentAttendance = await Attendance.find({ employee: employee._id })
      .sort({ date: -1 })
      .limit(5);

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    const currentPayroll = await Payroll.findOne({ 
      employee: employee._id, 
      month: currentMonth, 
      year: currentYear 
    });

    const dashboardData = {
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        designation: employee.designation,
        department: employee.department
      },
      todayAttendance: todayAttendance || null,
      pendingLeaves,
      recentLeaves,
      recentAttendance,
      currentPayroll: currentPayroll || null
    };

    return sendResponse(res, 200, true, 'Employee dashboard data fetched successfully', dashboardData);
  } catch (error) {
    next(error);
  }
};
