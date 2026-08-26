import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: string;
}

const Holidays: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';
  
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', type: 'PUBLIC' });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const res = await apiClient.get('/holidays');
      if (res.data.success) {
        setHolidays(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching holidays', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/holidays', form);
      if (res.data.success) {
        toast.success('Holiday added successfully');
        setShowModal(false);
        setForm({ name: '', date: '', type: 'PUBLIC' });
        fetchHolidays();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add holiday');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      const res = await apiClient.delete(`/holidays/${id}`);
      if (res.data.success) {
        toast.success('Holiday deleted');
        fetchHolidays();
      }
    } catch (error) {
      toast.error('Failed to delete holiday');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Company Holidays</h1>
            <p className="text-sm text-slate-500">View upcoming company holidays</p>
          </div>
        </div>
        
        {isAdminOrHR && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
          >
            <Plus size={18} />
            <span>Add Holiday</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Holiday Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  {isAdminOrHR && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holidays.length > 0 ? (
                  holidays.map((h) => {
                    const hDate = new Date(h.date);
                    const formattedDate = hDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    
                    const isPast = hDate < new Date();
                    
                    return (
                      <tr key={h._id} className={`hover:bg-slate-50/50 transition-colors ${isPast ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${isPast ? 'text-slate-400' : 'text-slate-800'}`}>
                            {formattedDate}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {h.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            h.type === 'PUBLIC' ? 'bg-emerald-100 text-emerald-700' :
                            h.type === 'COMPANY' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {h.type}
                          </span>
                        </td>
                        {isAdminOrHR && (
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(h._id)}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Delete Holiday"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isAdminOrHR ? 4 : 3} className="px-6 py-12 text-center text-slate-500">
                      No holidays have been added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Add Holiday</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Holiday Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. New Year's Day"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date *</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={form.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Holiday Type *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="PUBLIC">Public Holiday</option>
                  <option value="COMPANY">Company Holiday</option>
                  <option value="OPTIONAL">Optional/Restricted</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;
