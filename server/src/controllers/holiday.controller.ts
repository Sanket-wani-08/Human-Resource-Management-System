import { Request, Response, NextFunction } from 'express';
import { Holiday } from '../models/holiday.model';
import { sendResponse } from '../utils/response';

export const getHolidays = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    return sendResponse(res, 200, true, 'Holidays fetched successfully', holidays);
  } catch (error) {
    next(error);
  }
};

export const createHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holiday = await Holiday.create(req.body);
    return sendResponse(res, 201, true, 'Holiday created successfully', holiday);
  } catch (error) {
    next(error);
  }
};

export const deleteHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) {
      return sendResponse(res, 404, false, 'Holiday not found');
    }
    return sendResponse(res, 200, true, 'Holiday deleted successfully');
  } catch (error) {
    next(error);
  }
};
