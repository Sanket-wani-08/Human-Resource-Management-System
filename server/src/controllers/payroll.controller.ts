import { Request, Response, NextFunction } from 'express';
import { Payroll } from '../models/payroll.model';
import { Employee } from '../models/employee.model';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../services/email.service';
import { User } from '../models/user.model';

export const createPayroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employee, month, year, allowances = 0, bonus = 0, deductions = 0, tax = 0, paymentStatus } = req.body;

    const employeeId = employee || req.body.employeeId;
    const emp = await Employee.findById(employeeId);
    if (!emp) {
      return sendResponse(res, 404, false, 'Employee not found');
    }

    const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
    if (existingPayroll) {
      return sendResponse(res, 400, false, `Payroll for ${month} ${year} already exists for this employee`);
    }

    const basicSalary = emp.salary;
    const netSalary = basicSalary + Number(allowances) + Number(bonus) - Number(deductions) - Number(tax);

    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      year,
      basicSalary,
      allowances,
      bonus,
      deductions,
      tax,
      netSalary,
      paymentStatus: paymentStatus || 'PENDING',
      paymentDate: paymentStatus === 'PAID' ? new Date() : undefined
    });

    const employeeUser = await User.findById(emp.user);
    if (employeeUser && employeeUser.email) {
      const emailContent = `
        <h3>Payslip Generated</h3>
        <p>Dear ${emp.firstName},</p>
        <p>Your payslip for <strong>${month} ${year}</strong> has been generated.</p>
        <p><strong>Net Salary:</strong> ₹${netSalary.toLocaleString()}</p>
        <p>Please log in to the HRMS portal to view the full details.</p>
      `;
      sendEmail(employeeUser.email, `Payslip for ${month} ${year}`, emailContent);
    }

    return sendResponse(res, 201, true, 'Payroll created successfully', payroll);
  } catch (error) {
    next(error);
  }
};

export const getAllPayroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year, employeeId } = req.query;
    
    let query: any = {};
    if (month) query.month = month;
    if (year) query.year = year;
    if (employeeId) query.employee = employeeId;

    const payroll = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId designation')
      .sort({ year: -1, month: -1 });

    return sendResponse(res, 200, true, 'Payroll records fetched successfully', payroll);
  } catch (error) {
    next(error);
  }
};

export const getMyPayroll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee record not found');
    }

    const payroll = await Payroll.find({ employee: employee._id })
      .sort({ year: -1, month: -1 });

    return sendResponse(res, 200, true, 'Payroll records fetched successfully', payroll);
  } catch (error) {
    next(error);
  }
};

export const getPayrollById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee');

    if (!payroll) {
      return sendResponse(res, 404, false, 'Payroll record not found');
    }

    return sendResponse(res, 200, true, 'Payroll record fetched successfully', payroll);
  } catch (error) {
    next(error);
  }
};

export const updatePayroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return sendResponse(res, 404, false, 'Payroll record not found');
    }

    const allowances = req.body.allowances !== undefined ? Number(req.body.allowances) : payroll.allowances;
    const bonus = req.body.bonus !== undefined ? Number(req.body.bonus) : payroll.bonus;
    const deductions = req.body.deductions !== undefined ? Number(req.body.deductions) : payroll.deductions;
    const tax = req.body.tax !== undefined ? Number(req.body.tax) : payroll.tax;
    const paymentStatus = req.body.paymentStatus || payroll.paymentStatus;

    const netSalary = payroll.basicSalary + allowances + bonus - deductions - tax;

    let updateData: any = {
      allowances,
      bonus,
      deductions,
      tax,
      netSalary,
      paymentStatus
    };

    if (paymentStatus === 'PAID' && payroll.paymentStatus !== 'PAID') {
      updateData.paymentDate = new Date();
    }

    const updatedPayroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return sendResponse(res, 200, true, 'Payroll record updated successfully', updatedPayroll);
  } catch (error) {
    next(error);
  }
};
