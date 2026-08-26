import mongoose, { Document, Schema } from 'mongoose';

export interface IPayroll extends Document {
  employee: mongoose.Types.ObjectId;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  paymentStatus: 'PENDING' | 'PAID';
  paymentDate?: Date;
}

const payrollSchema = new Schema<IPayroll>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
    paymentDate: { type: Date },
  },
  { timestamps: true }
);

export const Payroll = mongoose.model<IPayroll>('Payroll', payrollSchema);
