import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { sendResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendResponse(res, 401, false, 'Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return sendResponse(res, 401, false, 'User not found');
    }

    if (!req.user.isActive) {
      return sendResponse(res, 403, false, 'User account is deactivated');
    }

    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Not authorized, token failed');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        false,
        `User role ${req.user.role} is not authorized to access this route`
      );
    }
    next();
  };
};
