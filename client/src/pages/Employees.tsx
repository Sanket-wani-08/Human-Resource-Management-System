import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Employee, Department } from '../types';
import { UserPlus, X, Search, Pencil, Filter } from 'lucide-react';

interface AddEmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  designation: string;
  department: string;
  joiningDate: string;
  employmentType: string;
  salary: number | '';
}

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'];

const Employees: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');

  // Debounce: only update query key 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const [form, setForm] = useState<AddEmployeeForm>({
    firstName: '', lastName: '', email: '', password: '',
    phone: '', designation: '', department: '',
    joiningDate: '', employmentType: 'FULL_TIME',
    salary: ''
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get('/employees', { params: { search: debouncedSearch, limit: 50 } });
      if (res.data.success) {
        return res.data.data.employees.filter((emp: any) => {
          const user = emp.user;
          if (typeof user === 'object' && user !== null) {
            return user.role === 'EMPLOYEE';
          }
          return true;
        });
      }
      return [];
    }
  });

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/departments');
      return res.data.success ? res.data.data : [];
    }
  });

  const loading = employeesLoading || departmentsLoading;

  // Client-side filtering by status and department
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: any) => {
      const matchStatus = filterStatus === 'ALL' || emp.status === filterStatus;
      const deptId = typeof emp.department === 'object' && emp.department ? emp.department._id : emp.department;
      const matchDept = filterDepartment === 'ALL' || deptId === filterDepartment;
      return matchStatus && matchDept;
    });
  }, [employees, filterStatus, filterDepartment]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'salary' ? Number(value) : value }));
  };

  const addEmployeeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/employees', payload);
      return res.data;
    },
    onSuccess: () => {
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', phone: '',
        designation: '', department: '', joiningDate: '',
        employmentType: 'FULL_TIME', salary: '' });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to add employee.');
    }
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await apiClient.put(`/employees/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      setShowEditModal(false);
      setSelectedEmployeeId(null);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to update employee.');
    }
  });

  const handleEditClick = (emp: any) => {
    setSelectedEmployeeId(emp._id);
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      password: '',
      phone: emp.phone,
      designation: emp.designation,
      department: typeof emp.department === 'object' ? emp.department._id : emp.department,
      joiningDate: new Date(emp.joiningDate).toISOString().split('T')[0],
      employmentType: emp.employmentType,
      salary: emp.salary || 0,
      status: emp.status
    } as any);
    setShowEditModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const payload = { ...form, role: 'EMPLOYEE' };
    if (showEditModal && selectedEmployeeId) {
      if (!payload.password) delete payload.password;
      updateEmployeeMutation.mutate({ id: selectedEmployeeId, payload });
    } else {
      addEmployeeMutation.mutate(payload);
    }
  };

  const statusColor = (s: string) =>
    s === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700'
    : s === 'ON_LEAVE' ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';

  if (loading) return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="skeleton h-8 w-48 mb-6" />
      <div className="skeleton h-64 w-full rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Employees</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow hover:shadow-lg transition-all active:scale-95"
        >
          <UserPlus size={16} /> Add Employee
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up delay-100">
        {/* Search box */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, email, ID..."
            className="form-input pl-10 w-full"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="form-input !py-2.5 text-sm"
          >
            <option value="ALL">All Statuses</option>
            {['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Department filter */}
        <div>
          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            className="form-input !py-2.5 text-sm"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d: any) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden animate-fade-in-up delay-150">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((emp: any, i: number) => (
                <tr key={emp._id} className="hover:bg-slate-50 transition-colors" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{emp.firstName} {emp.lastName}</div>
                        <div className="text-xs text-slate-400">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{emp.employeeId}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {typeof emp.department === 'object' && emp.department ? emp.department.name : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{emp.designation}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{emp.employmentType?.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColor(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditClick(emp)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add New Employee</h2>
                <p className="text-xs text-slate-400 mt-0.5">Fill in the details to create a new employee account</p>
              </div>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{formError}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name *</label>
                  <input name="firstName" required value={form.firstName} onChange={handleChange} className="form-input" placeholder="John" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name *</label>
                  <input name="lastName" required value={form.lastName} onChange={handleChange} className="form-input" placeholder="Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange} className="form-input" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password *</label>
                  <input name="password" type="password" required value={form.password} onChange={handleChange} className="form-input" placeholder="Minimum 8 characters" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Designation *</label>
                  <input name="designation" required value={form.designation} onChange={handleChange} className="form-input" placeholder="Software Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department *</label>
                  <select name="department" required value={form.department} onChange={handleChange} className="form-input">
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Joining Date *</label>
                  <input name="joiningDate" type="date" required value={form.joiningDate} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Employment Type *</label>
                  <select name="employmentType" value={form.employmentType} onChange={handleChange} className="form-input">
                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Basic Salary (₹) *</label>
                  <input name="salary" type="number" min={0} required value={form.salary} onChange={handleChange} className="form-input" placeholder="e.g. 50000" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormError(''); }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={addEmployeeMutation.isPending}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow disabled:opacity-60">
                  {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit Employee</h2>
                <p className="text-xs text-slate-400 mt-0.5">Update employee details</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setFormError(''); }} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{formError}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name *</label>
                  <input name="firstName" required value={form.firstName} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name *</label>
                  <input name="lastName" required value={form.lastName} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} className="form-input" placeholder="Leave blank to keep unchanged" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Designation *</label>
                  <input name="designation" required value={form.designation} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department *</label>
                  <select name="department" required value={form.department} onChange={handleChange} className="form-input">
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Joining Date *</label>
                  <input name="joiningDate" type="date" required value={form.joiningDate} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Employment Type *</label>
                  <select name="employmentType" value={form.employmentType} onChange={handleChange} className="form-input">
                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Basic Salary (₹) *</label>
                  <input name="salary" type="number" min={0} required value={form.salary} onChange={handleChange} className="form-input" placeholder="e.g. 50000" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status *</label>
                  <select 
                    name="status" 
                    value={(form as any).status || 'ACTIVE'} 
                    onChange={handleChange} 
                    disabled={(form as any).status === 'ON_LEAVE'}
                    className="form-input disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    {['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  {(form as any).status === 'ON_LEAVE' && (
                    <p className="text-[10px] text-amber-600 mt-1">Status is locked. It will automatically return to Active when the leave ends.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); setFormError(''); }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={updateEmployeeMutation.isPending}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow disabled:opacity-60">
                  {updateEmployeeMutation.isPending ? 'Updating...' : 'Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
