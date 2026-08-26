import { Request, Response, NextFunction } from 'express';
import { Attendance } from '../models/attendance.model';
import { Employee } from '../models/employee.model';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { Setting } from '../models/setting.model';

export const checkIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee record not found');
    }

    // Use IST (UTC+5:30) to determine "today"
    const now = new Date();
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + IST_OFFSET_MS);

    // Midnight of today in IST, converted back to UTC for DB query
    const todayIST = new Date(
      Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate())
    );
    const tomorrowIST = new Date(todayIST.getTime() + 24 * 60 * 60 * 1000);

    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: todayIST, $lt: tomorrowIST }
    });

    if (existingAttendance) {
      return sendResponse(res, 400, false, 'Already checked in today');
    }

    const checkInTime = new Date();

    // Fetch global setting for late time
    const setting = await Setting.findOne();
    const lateTimeString = setting?.lateCheckInTime || '09:30';

    const [hours, minutes] = lateTimeString.split(':').map(Number);
    const lateTime = new Date();
    lateTime.setHours(hours, minutes, 0, 0);

    const attendance = await Attendance.create({
      employee: employee._id,
      date: todayIST,          // store clean midnight date (no time component)
      checkIn: checkInTime,
      status: checkInTime > lateTime ? 'LATE' : 'PRESENT'
    });

    return sendResponse(res, 201, true, 'Checked in successfully', attendance);
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee record not found');
    }

    // IST-aware today boundaries
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(new Date().getTime() + IST_OFFSET_MS);
    const todayIST = new Date(
      Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate())
    );
    const tomorrowIST = new Date(todayIST.getTime() + 24 * 60 * 60 * 1000);

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: todayIST, $lt: tomorrowIST }
    });

    if (!attendance) {
      return sendResponse(res, 400, false, 'Cannot check out without checking in');
    }

    if (attendance.checkOut) {
      return sendResponse(res, 400, false, 'Already checked out today');
    }

    const checkOutTime = new Date();
    const diff = checkOutTime.getTime() - attendance.checkIn.getTime();
    const totalHours = Number((diff / (1000 * 60 * 60)).toFixed(2));

    attendance.checkOut = checkOutTime;
    attendance.totalHours = totalHours;
    await attendance.save();

    return sendResponse(res, 200, true, 'Checked out successfully', attendance);
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee record not found');
    }

    const attendance = await Attendance.find({ employee: employee._id })
      .sort({ date: -1 });

    return sendResponse(res, 200, true, 'Attendance fetched successfully', attendance);
  } catch (error) {
    next(error);
  }
};

export const getAllAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, employeeId } = req.query;
    
    let query: any = {};
    
    if (date) {
      const queryDate = new Date(date as string);
      queryDate.setHours(0, 0, 0, 0);
      query.date = {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
      };
    }
    
    if (employeeId) {
      query.employee = employeeId;
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .sort({ date: -1 });

    return sendResponse(res, 200, true, 'Attendance fetched successfully', attendance);
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { checkIn, checkOut, status, totalHours } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return sendResponse(res, 404, false, 'Attendance record not found');
    }

    if (checkIn) attendance.checkIn = new Date(checkIn);
    if (checkOut) attendance.checkOut = new Date(checkOut);
    if (status) attendance.status = status;
    if (totalHours !== undefined) attendance.totalHours = totalHours;

    await attendance.save();

    return sendResponse(res, 200, true, 'Attendance updated successfully', attendance);
  } catch (error) {
    next(error);
  }
};

export const deleteAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!attendance) {
      return sendResponse(res, 404, false, 'Attendance record not found');
    }

    return sendResponse(res, 200, true, 'Attendance deleted successfully');
  } catch (error) {
    next(error);
  }
};
