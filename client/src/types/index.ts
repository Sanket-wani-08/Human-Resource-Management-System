export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'EMPLOYEE';
  isActive: boolean;
  employee?: Employee;
}

export interface Employee {
  _id: string;
  employeeId: string;
  user: User | string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  designation: string;
  department: Department | string;
  joiningDate: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  salary: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RESIGNED';
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  manager?: Employee | string;
  isActive: boolean;
}

export interface Attendance {
  _id: string;
  employee: Employee | string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';
  totalHours?: number;
}

export interface Leave {
  _id: string;
  employee: Employee | string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: User | string;
  reviewedAt?: string;
}

export interface Payroll {
  _id: string;
  employee: Employee | string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  paymentStatus: 'PENDING' | 'PAID';
  paymentDate?: string;
}
