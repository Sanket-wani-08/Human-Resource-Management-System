import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  companyName: string;
  lateCheckInTime: string; // e.g. "09:30"
}

const settingSchema = new Schema<ISetting>(
  {
    companyName: { type: String, default: 'My Company' },
    lateCheckInTime: { type: String, default: '09:30' },
  },
  { timestamps: true }
);

export const Setting = mongoose.model<ISetting>('Setting', settingSchema);
