import mongoose, { Document, Schema } from 'mongoose';

export interface ILeave extends Document {
  employee: mongoose.Types.ObjectId;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'REJECTED'], 
      default: 'PENDING' 
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const Leave = mongoose.model<ILeave>('Leave', leaveSchema);
