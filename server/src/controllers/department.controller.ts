import { Request, Response, NextFunction } from 'express';
import { Department } from '../models/department.model';
import { Employee } from '../models/employee.model';
import { sendResponse } from '../utils/response';

export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await Department.find().populate('manager', 'firstName lastName');
    return sendResponse(res, 200, true, 'Departments fetched successfully', departments);
  } catch (error) {
    next(error);
  }
};

export const getDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'firstName lastName');
    
    if (!department) {
      return sendResponse(res, 404, false, 'Department not found');
    }
    
    // Get employees in this department
    const employees = await Employee.find({ department: req.params.id }).select('firstName lastName employeeId designation');

    return sendResponse(res, 200, true, 'Department fetched successfully', {
      department,
      employees
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, manager } = req.body;

    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return sendResponse(res, 400, false, 'Department name already exists');
    }

    const department = await Department.create({ name, description, manager });
    return sendResponse(res, 201, true, 'Department created successfully', department);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, manager, isActive } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendResponse(res, 404, false, 'Department not found');
    }

    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ name });
      if (existingDepartment) {
        return sendResponse(res, 400, false, 'Department name already exists');
      }
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, manager, isActive },
      { new: true, runValidators: true }
    );

    return sendResponse(res, 200, true, 'Department updated successfully', updatedDepartment);
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return sendResponse(res, 404, false, 'Department not found');
    }

    // Check if there are employees in this department
    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    
    if (employeeCount > 0) {
      return sendResponse(res, 400, false, 'Cannot delete department with assigned employees. Deactivate instead.');
    }

    await Department.findByIdAndDelete(req.params.id);
    return sendResponse(res, 200, true, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};
