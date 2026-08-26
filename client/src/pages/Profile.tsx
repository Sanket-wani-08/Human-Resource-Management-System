import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const emp = typeof user?.employee === 'object' ? user.employee : null;

  if (!emp) return <div>Employee profile not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
              {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{emp.firstName} {emp.lastName}</h2>
              <p className="text-gray-500">{emp.designation}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
            <p className="mt-1 text-lg text-gray-900">{emp.employeeId}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
            <p className="mt-1 text-lg text-gray-900">{emp.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
            <p className="mt-1 text-lg text-gray-900">{emp.phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Employment Type</h3>
            <p className="mt-1 text-lg text-gray-900">{emp.employmentType}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Joining Date</h3>
            <p className="mt-1 text-lg text-gray-900">{new Date(emp.joiningDate).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-lg text-gray-900">{emp.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
