import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';
  totalHours?: number;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'],
      default: 'PRESENT'
    },
    totalHours: { type: Number },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same employee on same date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
