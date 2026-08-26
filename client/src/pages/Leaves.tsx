import React, { useState, useMemo } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Check, Ban, CalendarOff, Filter } from 'lucide-react';

const LEAVE_TYPES = ['SICK', 'CASUAL', 'ANNUAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER'];

interface ApplyForm {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

const statusStyle = (s: string) =>
  s === 'APPROVED' ? 'bg-emerald-100 text-emerald-700'
  : s === 'REJECTED' ? 'bg-red-100 text-red-700'
  : 'bg-amber-100 text-amber-700';

const Leaves: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<ApplyForm>({
    leaveType: 'SICK', startDate: '', endDate: '', reason: '',
  });

  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { data: leaves = [], isLoading: loading } = useQuery({
    queryKey: ['leaves', isAdminOrHR ? 'all' : 'my'],
    queryFn: async () => {
      const endpoint = isAdminOrHR ? '/leaves' : '/leaves/my';
      const res = await apiClient.get(endpoint);
      return res.data.success ? res.data.data : [];
    }
  });

  // Client-side status filter
  const filteredLeaves = useMemo(() => {
    if (filterStatus === 'ALL') return leaves;
    return leaves.filter((l: any) => l.status === filterStatus);
  }, [leaves, filterStatus]);

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'approve' | 'reject' }) => {
      await apiClient.patch(`/leaves/${id}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
    onError: (_error, variables) => {
      alert(`Failed to ${variables.action} leave request.`);
    }
  });

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    actionMutation.mutate({ id, action });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyMutation = useMutation({
    mutationFn: async (formData: ApplyForm) => {
      const res = await apiClient.post('/leaves', formData);
      return res.data;
    },
    onSuccess: () => {
      setShowModal(false);
      setForm({ leaveType: 'SICK', startDate: '', endDate: '', reason: '' });
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to apply for leave.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setFormError('End date cannot be before start date.');
      return;
    }
    applyMutation.mutate(form);
  };

  // Days between two dates
  const daysDiff = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

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
            {isAdminOrHR ? 'Leave Requests' : 'My Leaves'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {(leaves as any[]).filter(l => l.status === 'PENDING').length} pending &middot; {filteredLeaves.length} shown
          </p>
        </div>
        {!isAdminOrHR && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow hover:shadow-lg transition-all active:scale-95"
          >
            <Plus size={16} /> Apply for Leave
          </button>
        )}
      </div>

      {/* Status Filter Pill Buttons */}
      <div className="flex items-center gap-3 animate-fade-in-up delay-75">
        <Filter size={15} className="text-slate-400 shrink-0" />
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                filterStatus === s
                  ? s === 'APPROVED' ? 'bg-emerald-600 text-white border-emerald-600'
                  : s === 'REJECTED' ? 'bg-red-500 text-white border-red-500'
                  : s === 'PENDING' ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden animate-fade-in-up delay-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {isAdminOrHR && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>}
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Days</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                {isAdminOrHR && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeaves.map((leave: any) => (
                <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                  {isAdminOrHR && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {typeof leave.employee === 'object' && leave.employee
                            ? `${leave.employee.firstName[0]}${leave.employee.lastName[0]}`
                            : '?'}
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {typeof leave.employee === 'object' && leave.employee
                            ? `${leave.employee.firstName} ${leave.employee.lastName}`
                            : 'Unknown'}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                      {leave.leaveType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div>{fmt(leave.startDate)}</div>
                    <div className="text-xs text-slate-400">to {fmt(leave.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">
                    {daysDiff(leave.startDate, leave.endDate)}d
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{leave.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  {isAdminOrHR && (
                    <td className="px-6 py-4">
                      {leave.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(leave._id, 'approve')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all active:scale-95"
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(leave._id, 'reject')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all active:scale-95"
                          >
                            <Ban size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={isAdminOrHR ? 7 : 5} className="px-6 py-16 text-center">
                    <CalendarOff size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">
                      {isAdminOrHR ? 'No leave requests yet.' : 'You have no leave records. Apply for your first leave!'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Apply for Leave</h2>
                <p className="text-xs text-slate-400 mt-0.5">Submit a leave request for approval</p>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Leave Type *</label>
                <select name="leaveType" value={form.leaveType} onChange={handleChange} className="form-input">
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Date *</label>
                  <input name="startDate" type="date" required
                    min={new Date().toISOString().split('T')[0]}
                    value={form.startDate} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Date *</label>
                  <input name="endDate" type="date" required
                    min={form.startDate || new Date().toISOString().split('T')[0]}
                    value={form.endDate} onChange={handleChange} className="form-input" />
                </div>
              </div>

              {/* Days preview */}
              {form.startDate && form.endDate && new Date(form.endDate) >= new Date(form.startDate) && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700">Total days requested</span>
                  <span className="text-lg font-extrabold text-emerald-700">
                    {daysDiff(form.startDate, form.endDate)} day{daysDiff(form.startDate, form.endDate) > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reason *</label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  value={form.reason}
                  onChange={handleChange as any}
                  className="form-input resize-none"
                  placeholder="Briefly describe the reason for your leave..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormError(''); }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={applyMutation.isPending}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow disabled:opacity-60">
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
