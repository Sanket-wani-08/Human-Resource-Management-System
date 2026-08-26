import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  if (err.name === 'ValidationError') {
    // Yup validation error structure
    if (err.inner && err.inner.length > 0) {
      statusCode = 400;
      message = 'Validation failed';
      errors = err.inner.map((e: any) => ({
        path: e.path,
        message: e.message,
      }));
    } else if (err.errors) {
      // Mongoose validation error
      statusCode = 400;
      message = 'Validation failed';
      errors = Object.values(err.errors).map((val: any) => ({
        path: val.path,
        message: val.message,
      }));
    }
  } else if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found. Invalid: ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Hide stack trace in production
  if (process.env.NODE_ENV === 'production') {
    sendResponse(res, statusCode, false, message, undefined, errors);
  } else {
    sendResponse(res, statusCode, false, message, undefined, { 
      stack: err.stack, 
      details: errors || err 
    });
  }
};
