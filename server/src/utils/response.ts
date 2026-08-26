import { Response } from 'express';

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any,
  errors?: any
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    errors,
  });
};
