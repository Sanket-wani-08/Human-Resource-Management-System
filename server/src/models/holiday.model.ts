import mongoose, { Document, Schema } from 'mongoose';

export interface IHoliday extends Document {
  name: string;
  date: Date;
  type: 'PUBLIC' | 'COMPANY' | 'OPTIONAL';
}

const holidaySchema = new Schema<IHoliday>(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['PUBLIC', 'COMPANY', 'OPTIONAL'], default: 'PUBLIC' },
  },
  { timestamps: true }
);

export const Holiday = mongoose.model<IHoliday>('Holiday', holidaySchema);
