import { Request, Response, NextFunction } from 'express';
import { Leave } from '../models/leave.model';
import { Employee } from '../models/employee.model';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../services/email.service';
import { User } from '../models/user.model';

export const applyLeave = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee record not found');
    }

    if (new Date(startDate) > new Date(endDate)) {
      return sendResponse(res, 400, false, 'Start date cannot be after end date');
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      employee: employee._id,
      status: { $in: ['PENDING', 'APPROVED'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (overlappingLeave) {
      return sendResponse(res, 400, false, 'You already have a leave request during this period');
    }

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      startDate,
      endDate,
      reason
    });

    return sendResponse(res, 201, true, 'Leave applied successfully', leave);
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee record not found');
    }

    const leaves = await Leave.find({ employee: employee._id })
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Leaves fetched successfully', leaves);
  } catch (error) {
    next(error);
  }
};

export const getAllLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, employeeId } = req.query;
    
    let query: any = {};
    if (status) query.status = status;
    if (employeeId) query.employee = employeeId;

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Leaves fetched successfully', leaves);
  } catch (error) {
    next(error);
  }
};

export const approveLeave = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return sendResponse(res, 404, false, 'Leave request not found');
    }

    // Check if the user is approving their own leave
    const employee = await Employee.findOne({ user: req.user._id });
    if (employee && leave.employee.toString() === employee._id.toString()) {
      return sendResponse(res, 403, false, 'You cannot approve your own leave');
    }

    leave.status = 'APPROVED';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
    
    if (new Date(leave.startDate) <= endOfToday && new Date(leave.endDate) >= today) {
       await Employee.updateOne(
         { _id: leave.employee, status: 'ACTIVE' },
         { status: 'ON_LEAVE' }
       );
    }

    // Send email notification
    const employeeToUpdate = await Employee.findById(leave.employee);
    if (employeeToUpdate) {
      const employeeUser = await User.findById(employeeToUpdate.user);
      if (employeeUser && employeeUser.email) {
      const emailContent = `
        <h3>Leave Request Approved</h3>
        <p>Dear ${employeeToUpdate?.firstName},</p>
        <p>Your leave request from ${new Date(leave.startDate).toDateString()} to ${new Date(leave.endDate).toDateString()} has been approved.</p>
        <p>Enjoy your time off!</p>
      `;
      sendEmail(employeeUser.email, 'Leave Approved', emailContent);
      }
    }

    return sendResponse(res, 200, true, 'Leave approved successfully', leave);
  } catch (error) {
    next(error);
  }
};

export const rejectLeave = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return sendResponse(res, 404, false, 'Leave request not found');
    }

    // Check if the user is rejecting their own leave
    const employee = await Employee.findOne({ user: req.user._id });
    if (employee && leave.employee.toString() === employee._id.toString()) {
      return sendResponse(res, 403, false, 'You cannot reject your own leave');
    }

    leave.status = 'REJECTED';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    // Send email notification
    const employeeToUpdate = await Employee.findById(leave.employee);
    if (employeeToUpdate) {
      const employeeUser = await User.findById(employeeToUpdate.user);
      if (employeeUser && employeeUser.email) {
      const emailContent = `
        <h3>Leave Request Rejected</h3>
        <p>Dear ${employeeToUpdate?.firstName},</p>
        <p>Unfortunately, your leave request from ${new Date(leave.startDate).toDateString()} to ${new Date(leave.endDate).toDateString()} has been rejected.</p>
        <p>Please contact your HR manager for more details.</p>
      `;
      sendEmail(employeeUser.email, 'Leave Rejected', emailContent);
      }
    }

    return sendResponse(res, 200, true, 'Leave rejected successfully', leave);
  } catch (error) {
    next(error);
  }
};
