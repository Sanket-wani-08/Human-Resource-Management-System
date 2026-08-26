import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  designation: string;
  department: mongoose.Types.ObjectId;
  joiningDate: Date;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  salary: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RESIGNED';
  profileImage?: string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    address: { type: String },
    designation: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    joiningDate: { type: Date, required: true },
    employmentType: { 
      type: String, 
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'], 
      default: 'FULL_TIME' 
    },
    salary: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED'], 
      default: 'ACTIVE' 
    },
    profileImage: { type: String },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
