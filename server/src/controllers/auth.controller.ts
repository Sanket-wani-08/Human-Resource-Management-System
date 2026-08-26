import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { sendResponse } from '../utils/response';
import { generateToken } from '../utils/generateToken';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, 'Please provide an email and password');
    }

    const user = await User.findOne({ email }).select('+password').populate('employee');

    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    if (!user.isActive) {
      return sendResponse(res, 403, false, 'User account is deactivated');
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    const token = generateToken(user._id.toString(), user.role);

    // Remove password from output
    user.password = undefined;

    return sendResponse(res, 200, true, 'Login successful', {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id).populate('employee');
    return sendResponse(res, 200, true, 'User fetched successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Since we use JWT on the client, logout is just returning a success message
    // Client should delete the token
    return sendResponse(res, 200, true, 'Logout successful');
  } catch (error) {
    next(error);
  }
};
