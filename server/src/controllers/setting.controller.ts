import { Request, Response, NextFunction } from 'express';
import { Setting } from '../models/setting.model';
import { sendResponse } from '../utils/response';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    return sendResponse(res, 200, true, 'Settings fetched successfully', setting);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create(req.body);
    } else {
      setting = await Setting.findByIdAndUpdate(setting._id, req.body, { new: true });
    }
    return sendResponse(res, 200, true, 'Settings updated successfully', setting);
  } catch (error) {
    next(error);
  }
};
