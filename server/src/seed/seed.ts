import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { User } from '../models/user.model';

dns.setServers(['1.1.1.1']);
dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    // Only clear users — keep departments & employees added via dashboard
    await User.deleteMany();
    console.log('Cleared users');

    // Admin User — no Employee record needed
    await User.create({
      name: 'System Admin',
      email: 'admin@hrms.com',
      password: 'Admin@123',
      role: 'ADMIN',
    });

    // HR User — no Employee record needed
    await User.create({
      name: 'HR Manager',
      email: 'hr@hrms.com',
      password: 'Hr@12345',
      role: 'HR',
    });

    console.log('Created Admin & HR system users');
    console.log('Seed completed successfully!');
    console.log('');
    console.log('  Admin  →  admin@hrms.com  /  Admin@123');
    console.log('  HR     →  hr@hrms.com     /  Hr@12345');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
