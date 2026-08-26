import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Payroll as PayrollType, Employee } from '../types';
import { Plus, X, Wallet, CheckCircle, Download, Pencil } from 'lucide-react';
import { downloadCSV } from '../utils/csvExport';

interface PayrollForm {
  employee: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  tax: number;
}

const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];

const Payroll: React.FC = () => {
  const { user } = useAuth();
  const [payroll, setPayroll] = useState<PayrollType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRecord, setEditRecord] = useState<PayrollType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState<PayrollForm>({
    employee: '', month: MONTHS[new Date().getMonth()],
    year: currentYear, basicSalary: 0,
    allowances: 0, bonus: 0, deductions: 0, tax: 0,
  });

  const [editForm, setEditForm] = useState({
    allowances: 0, bonus: 0, deductions: 0, tax: 0, paymentStatus: 'PENDING'
  });

  const fetchPayroll = async () => {
    try {
      const endpoint = isAdminOrHR ? '/payroll' : '/payroll/my';
      const res = await apiClient.get(endpoint);
      if (res.data.success) setPayroll(res.data.data);
    } catch (e) {
      console.error('Failed to fetch payroll', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/employees', { params: { limit: 100 } });
      if (res.data.success) {
        // Only EMPLOYEE role users
        const onlyEmp = res.data.data.employees.filter((e: any) =>
          typeof e.user === 'object' ? e.user?.role === 'EMPLOYEE' : true
        );
        setEmployees(onlyEmp);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchPayroll();
    if (isAdminOrHR) fetchEmployees();
  }, [isAdminOrHR]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'employee') {
      // Auto-fill basicSalary from the selected employee's salary
      const selectedEmp = employees.find((emp: any) => emp._id === value);
      setForm(prev => ({
        ...prev,
        employee: value,
        basicSalary: selectedEmp?.salary ?? 0,
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: ['allowances','bonus','deductions','tax','year'].includes(name) ? Number(value) : value }));
    }
  };

  const netSalary = form.basicSalary + form.allowances + form.bonus - form.deductions - form.tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await apiClient.post('/payroll', form);
      if (res.data.success) {
        setShowModal(false);
        setForm({ employee: '', month: MONTHS[new Date().getMonth()], year: currentYear,
          basicSalary: 0, allowances: 0, bonus: 0, deductions: 0, tax: 0 });
        fetchPayroll();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to generate payroll.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await apiClient.put(`/payroll/${id}`, { paymentStatus: 'PAID' });
      fetchPayroll();
    } catch {
      alert('Failed to mark payroll as paid.');
    }
  };

  const handleEditClick = (rec: PayrollType) => {
    setEditRecord(rec);
    setEditForm({
      allowances: rec.allowances,
      bonus: rec.bonus,
      deductions: rec.deductions,
      tax: rec.tax,
      paymentStatus: rec.paymentStatus,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: ['allowances','bonus','deductions','tax'].includes(name) ? Number(value) : value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    setSubmitting(true);
    setFormError('');
    try {
      await apiClient.put(`/payroll/${editRecord._id}`, editForm);
      setShowEditModal(false);
      setEditRecord(null);
      fetchPayroll();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update payroll.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const csvData = payroll.map(rec => ({
      Employee: typeof rec.employee === 'object' && rec.employee ? `${rec.employee.firstName} ${rec.employee.lastName}` : rec.employee,
      Period: `${rec.month} ${rec.year}`,
      BasicSalary: rec.basicSalary,
      Allowances: rec.allowances,
      Bonus: rec.bonus,
      Deductions: rec.deductions,
      Tax: rec.tax,
      NetSalary: rec.netSalary,
      Status: rec.paymentStatus
    }));
    downloadCSV(csvData, `Payroll_Report_${MONTHS[new Date().getMonth()]}_${currentYear}`);
  };

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
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isAdminOrHR ? 'Payroll Records' : 'My Payroll'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{payroll.length} record{payroll.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow hover:shadow-lg transition-all active:scale-95"
          >
            <Download size={16} /> Export CSV
          </button>
          {isAdminOrHR && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow hover:shadow-lg transition-all active:scale-95"
            >
              <Plus size={16} /> Generate Payroll
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden animate-fade-in-up delay-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {isAdminOrHR && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>}
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Basic Salary</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Allowances</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                {isAdminOrHR && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payroll.map((rec) => (
                <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                  {isAdminOrHR && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {typeof rec.employee === 'object' && rec.employee
                            ? `${rec.employee.firstName[0]}${rec.employee.lastName[0]}`
                            : '??'}
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {typeof rec.employee === 'object' && rec.employee
                            ? `${rec.employee.firstName} ${rec.employee.lastName}`
                            : 'Unknown'}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">{rec.month} {rec.year}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">₹{rec.basicSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">₹{rec.allowances.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-red-500">-₹{(rec.deductions + rec.tax).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{rec.netSalary.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${rec.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {rec.paymentStatus}
                    </span>
                  </td>
                  {isAdminOrHR && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(rec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        {rec.paymentStatus === 'PENDING' && (
                          <button
                            onClick={() => handleMarkPaid(rec._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all active:scale-95"
                          >
                            <CheckCircle size={13} /> Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {payroll.length === 0 && (
                <tr>
                  <td colSpan={isAdminOrHR ? 8 : 6} className="px-6 py-12 text-center text-slate-400">
                    No payroll records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Wallet size={18} className="text-blue-600" /> Generate Payroll
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Calculate and create a payroll record</p>
              </div>
              <button onClick={() => { setShowModal(false); setFormError(''); }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{formError}</div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Employee *</label>
                <select name="employee" required value={form.employee} onChange={handleChange} className="form-input">
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Month *</label>
                  <select name="month" value={form.month} onChange={handleChange} className="form-input">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Year *</label>
                  <input name="year" type="number" min={2020} max={2100} value={form.year} onChange={handleChange} className="form-input" />
                </div>
              </div>

              {/* Basic salary display — full width */}
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between items-center border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Basic Salary (auto-filled from employee profile)</span>
                <span className="font-bold text-slate-800">
                  {form.basicSalary > 0 ? `₹${form.basicSalary.toLocaleString()}` : <span className="text-slate-400 font-normal text-sm">Select an employee first</span>}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Allowances (₹)</label>
                  <input name="allowances" type="number" min={0} value={form.allowances} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bonus (₹)</label>
                  <input name="bonus" type="number" min={0} value={form.bonus} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deductions (₹)</label>
                  <input name="deductions" type="number" min={0} value={form.deductions} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tax (₹)</label>
                  <input name="tax" type="number" min={0} value={form.tax} onChange={handleChange} className="form-input" />
                </div>
              </div>

              {/* Live net salary preview */}
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Net Salary</span>
                <span className={`text-xl font-extrabold ${netSalary >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ₹{netSalary.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormError(''); }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow disabled:opacity-60">
                  {submitting ? 'Generating...' : 'Generate Payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payroll Modal */}
      {showEditModal && editRecord && (() => {
        const editNet = (editRecord.basicSalary) + editForm.allowances + editForm.bonus - editForm.deductions - editForm.tax;
        const empName = typeof editRecord.employee === 'object' && editRecord.employee
          ? `${editRecord.employee.firstName} ${editRecord.employee.lastName}`
          : 'Employee';
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Pencil size={18} className="text-blue-600" /> Edit Payroll
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{empName} — {editRecord.month} {editRecord.year}</p>
                </div>
                <button onClick={() => { setShowEditModal(false); setFormError(''); }}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{formError}</div>
                )}

                {/* Basic salary read-only */}
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Basic Salary (fixed)</span>
                  <span className="font-bold text-slate-800">₹{editRecord.basicSalary.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Allowances (₹)</label>
                    <input name="allowances" type="number" min={0} value={editForm.allowances} onChange={handleEditChange} className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bonus (₹)</label>
                    <input name="bonus" type="number" min={0} value={editForm.bonus} onChange={handleEditChange} className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Deductions (₹)</label>
                    <input name="deductions" type="number" min={0} value={editForm.deductions} onChange={handleEditChange} className="form-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tax (₹)</label>
                    <input name="tax" type="number" min={0} value={editForm.tax} onChange={handleEditChange} className="form-input" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Status</label>
                  <select name="paymentStatus" value={editForm.paymentStatus} onChange={handleEditChange} className="form-input">
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>

                {/* Live net preview */}
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-600">Net Salary</span>
                  <span className={`text-xl font-extrabold ${editNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ₹{editNet.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowEditModal(false); setFormError(''); }}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow disabled:opacity-60">
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Payroll;
