import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description?: string;
  manager?: mongoose.Types.ObjectId;
  isActive: boolean;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    manager: { type: Schema.Types.ObjectId, ref: 'Employee' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
