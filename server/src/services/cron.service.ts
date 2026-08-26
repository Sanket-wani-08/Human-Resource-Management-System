import cron from 'node-cron';
import { Leave } from '../models/leave.model';
import { Employee } from '../models/employee.model';

export const startCronJobs = () => {
  // Run at midnight every day
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cron job for employee status updates...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all APPROVED leaves that cover today
      const activeLeaves = await Leave.find({
        status: 'APPROVED',
        startDate: { $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }, 
        endDate: { $gte: today } 
      });

      const employeesOnLeave = activeLeaves.map(leave => leave.employee.toString());

      // Update statuses to ON_LEAVE
      if (employeesOnLeave.length > 0) {
        await Employee.updateMany(
          {
            _id: { $in: employeesOnLeave },
            status: 'ACTIVE' 
          },
          { status: 'ON_LEAVE' }
        );
        console.log(`Updated ${employeesOnLeave.length} employees to ON_LEAVE`);
      }

      // Find employees who are currently ON_LEAVE but their leave has ended
      const employeesToActivate = await Employee.find({
        status: 'ON_LEAVE',
        _id: { $nin: employeesOnLeave }
      });

      if (employeesToActivate.length > 0) {
        const idsToActivate = employeesToActivate.map(emp => emp._id);
        await Employee.updateMany(
          { _id: { $in: idsToActivate } },
          { status: 'ACTIVE' }
        );
        console.log(`Updated ${idsToActivate.length} employees back to ACTIVE`);
      }

    } catch (error) {
      console.error('Error running daily cron job:', error);
    }
  });
};
