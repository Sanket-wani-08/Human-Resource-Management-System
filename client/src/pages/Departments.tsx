import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import type { Department } from '../types';
import { Plus, X, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Departments: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get('/departments');
      if (res.data.success) setDepartments(res.data.data);
    } catch (e) {
      console.error('Failed to fetch departments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await apiClient.post('/departments', form);
      if (res.data.success) {
        setShowModal(false);
        setForm({ name: '', description: '' });
        fetchDepartments();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to add department.');
    } finally {
      setSubmitting(false);
    }
  };

  const DEPT_COLORS = [
    'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
    'bg-red-100 text-red-700', 'bg-indigo-100 text-indigo-700',
  ];

  if (loading) return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="skeleton h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Departments</h1>
          <p className="text-slate-500 text-sm mt-0.5">{departments.length} department{departments.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow hover:shadow-lg transition-all active:scale-95"
          >
            <Plus size={16} /> Add Department
          </button>
        )}
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept, i) => (
          <div key={dept._id} className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-2xl ${DEPT_COLORS[i % DEPT_COLORS.length]} flex items-center justify-center`}>
                <Building2 size={20} />
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${dept.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {dept.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{dept.description || 'No description provided.'}</p>
          </div>
        ))}
        {departments.length === 0 && (
          <div className="col-span-3 glass-card py-16 text-center text-slate-400">
            No departments found. Add your first department!
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add Department</h2>
                <p className="text-xs text-slate-400 mt-0.5">Create a new department in the organisation</p>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department Name *</label>
                <input name="name" required value={form.name} onChange={handleChange} className="form-input" placeholder="e.g. Engineering" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                <input name="description" value={form.description} onChange={handleChange} className="form-input" placeholder="Short description..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormError(''); }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow disabled:opacity-60">
                  {submitting ? 'Adding...' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
