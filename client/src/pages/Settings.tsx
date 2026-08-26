import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const [form, setForm] = useState({
    companyName: '',
    lateCheckInTime: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/settings');
      if (res.data.success && res.data.data) {
        setForm({
          companyName: res.data.data.companyName || '',
          lateCheckInTime: res.data.data.lateCheckInTime || '09:30',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.put('/settings', form);
      if (res.data.success) {
        toast.success('Settings updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
          <p className="text-sm text-slate-500">Configure global application preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Late Check-in Time</label>
                <input
                  type="time"
                  name="lateCheckInTime"
                  value={form.lateCheckInTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Employees checking in after this time will be marked as LATE.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
