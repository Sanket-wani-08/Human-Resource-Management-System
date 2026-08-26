import { Request, Response, NextFunction } from 'express';
import { Employee } from '../models/employee.model';
import { User } from '../models/user.model';
import { Department } from '../models/department.model';
import { sendResponse } from '../utils/response';
import bcrypt from 'bcryptjs';

export const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department, status, search, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    if (department) query.department = department;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('user', 'email role isActive')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(query);

    return sendResponse(res, 200, true, 'Employees fetched successfully', {
      employees,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('user', 'email role isActive');

    if (!employee) {
      return sendResponse(res, 404, false, 'Employee not found');
    }

    return sendResponse(res, 200, true, 'Employee fetched successfully', employee);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role, password, ...employeeData } = req.body;

    // Auto-generate employeeId
    const count = await Employee.countDocuments();
    const generatedId = `EMP${String(count + 1).padStart(3, '0')}`;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, false, 'User with this email already exists');
    }

    // Check if department exists
    const department = await Department.findById(employeeData.department);
    if (!department) {
      return sendResponse(res, 400, false, 'Department not found');
    }

    // Create user
    const user = await User.create({
      name: `${employeeData.firstName} ${employeeData.lastName}`,
      email,
      password: password || 'Default@123',
      role: role || 'EMPLOYEE',
    });

    // Create employee with auto-generated ID
    const employee = await Employee.create({
      ...employeeData,
      email,
      employeeId: generatedId,
      user: user._id,
    });

    // Link employee to user
    user.employee = employee._id as any;
    await user.save();

    return sendResponse(res, 201, true, 'Employee created successfully', employee);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, ...employeeData } = req.body;

    let employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee not found');
    }

    // If email is being updated, check if it's taken
    if (email && email !== employee.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return sendResponse(res, 400, false, 'Email is already taken by another user');
      }
      
      // Update User email
      await User.findByIdAndUpdate(employee.user, { email });
      employeeData.email = email;
    }

    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      employeeData,
      { new: true, runValidators: true }
    ).populate('department');

    return sendResponse(res, 200, true, 'Employee updated successfully', employee);
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee not found');
    }

    // Instead of deleting, just deactivate
    employee.status = 'TERMINATED';
    await employee.save();

    // Deactivate user as well
    await User.findByIdAndUpdate(employee.user, { isActive: false });

    return sendResponse(res, 200, true, 'Employee deactivated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return sendResponse(res, 404, false, 'Employee not found');
    }

    employee.status = status;
    await employee.save();

    // If status is terminated or resigned, deactivate user
    if (status === 'TERMINATED' || status === 'RESIGNED') {
      await User.findByIdAndUpdate(employee.user, { isActive: false });
    } else if (status === 'ACTIVE') {
      await User.findByIdAndUpdate(employee.user, { isActive: true });
    }

    return sendResponse(res, 200, true, 'Employee status updated successfully', employee);
  } catch (error) {
    next(error);
  }
};
