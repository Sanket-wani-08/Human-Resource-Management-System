import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Attendance as AttendanceType } from '../types';
import { Pencil, X, Download, ChevronDown, ChevronUp, Calendar, Filter } from 'lucide-react';
import { downloadCSV } from '../utils/csvExport';

/* ─── helpers ──────────────────────────────────────────────────── */
const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

const fmtTime = (d: string | Date | undefined) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_COLORS: Record<string, string> = {
  PRESENT:  'bg-emerald-100 text-emerald-700',
  LATE:     'bg-amber-100  text-amber-700',
  ABSENT:   'bg-red-100    text-red-700',
  HALF_DAY: 'bg-blue-100   text-blue-700',
  LEAVE:    'bg-purple-100 text-purple-700',
};

const ALL_STATUSES = ['ALL', 'PRESENT', 'LATE', 'ABSENT', 'HALF_DAY', 'LEAVE'];

/* ─── component ─────────────────────────────────────────────────── */
const Attendance: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

  const [records,        setRecords]        = useState<AttendanceType[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [showEditModal,  setShowEditModal]  = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceType | null>(null);
  const [editForm,       setEditForm]       = useState({ checkIn: '', checkOut: '', status: '', totalHours: 0 });

  // filters (admin only)
  const [filterDate,   setFilterDate]   = useState('');          // YYYY-MM-DD
  const [filterStatus, setFilterStatus] = useState('ALL');

  // which date groups are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /* fetch */
  const fetchAttendance = async () => {
    try {
      const endpoint = isAdmin ? '/attendance' : '/attendance/my';
      const res = await apiClient.get(endpoint);
      if (res.data.success) setRecords(res.data.data);
    } catch (e) {
      console.error('Failed to fetch attendance', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, [isAdmin]);

  /* edit helpers */
  const handleEdit = (record: AttendanceType) => {
    setSelectedRecord(record);
    setEditForm({
      checkIn:    new Date(record.checkIn).toISOString().slice(0, 16),
      checkOut:   record.checkOut ? new Date(record.checkOut).toISOString().slice(0, 16) : '',
      status:     record.status,
      totalHours: record.totalHours || 0,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      await apiClient.put(`/attendance/${selectedRecord._id}`, editForm);
      setShowEditModal(false);
      fetchAttendance();
    } catch (err) { console.error('Failed to update', err); }
  };

  /* CSV export */
  const handleExportCSV = () => {
    const csvData = records.map(r => ({
      Employee:   typeof r.employee === 'object' && r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : r.employee,
      Date:       new Date(r.date).toLocaleDateString(),
      CheckIn:    fmtTime(r.checkIn),
      CheckOut:   fmtTime(r.checkOut),
      TotalHours: r.totalHours || 0,
      Status:     r.status,
    }));
    downloadCSV(csvData, 'Attendance_Report');
  };

  /* ── Admin view: group by date then apply filters ── */
  const groupedByDate = useMemo(() => {
    if (!isAdmin) return {};

    let filtered = records;

    // date filter
    if (filterDate) {
      filtered = filtered.filter(r => {
        const recDate = new Date(r.date).toISOString().slice(0, 10);
        return recDate === filterDate;
      });
    }

    // status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // group
    const groups: Record<string, AttendanceType[]> = {};
    filtered.forEach(r => {
      const key = new Date(r.date).toISOString().slice(0, 10); // YYYY-MM-DD key
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    // sort desc (newest first)
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
    );
  }, [records, filterDate, filterStatus, isAdmin]);

  const toggleDate = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  /* ── loading ── */
  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-48" />
      {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     EMPLOYEE VIEW — simple table (unchanged look)
  ══════════════════════════════════════════════════════════ */
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Attendance History</h1>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
            <Download size={16} /> Export CSV
          </button>
        </div>
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map(r => (
                  <tr key={r._id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{fmtTime(r.checkIn)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{fmtTime(r.checkOut)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{r.totalHours ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No attendance records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     ADMIN / HR VIEW — grouped by date with filters
  ══════════════════════════════════════════════════════════ */
  const dateKeys = Object.keys(groupedByDate);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Employee Attendance</h1>
          <p className="text-slate-500 text-sm mt-0.5">{records.length} total record{records.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleExportCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center animate-fade-in-up">
        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
          <Filter size={16} /> Filters
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-2 flex-1">
          <Calendar size={16} className="text-slate-400 shrink-0" />
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="form-input !py-2 text-sm w-full sm:w-auto"
          />
          {filterDate && (
            <button onClick={() => setFilterDate('')}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
              Clear
            </button>
          )}
        </div>

        {/* Status dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Status</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="form-input !py-2 text-sm"
          >
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date groups */}
      {dateKeys.length === 0 ? (
        <div className="glass-card py-16 text-center text-slate-400">
          No attendance records match your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {dateKeys.map(dateKey => {
            const dayRecords = groupedByDate[dateKey];
            const isOpen = expanded[dateKey] !== false; // default open
            const counts = ALL_STATUSES.slice(1).reduce((acc, s) => {
              acc[s] = dayRecords.filter(r => r.status === s).length;
              return acc;
            }, {} as Record<string, number>);

            return (
              <div key={dateKey} className="glass-card overflow-hidden animate-fade-in-up">

                {/* Date header — clickable to collapse */}
                <button
                  onClick={() => toggleDate(dateKey)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {new Date(dateKey).getDate()}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 text-sm">{fmtDate(dateKey)}</p>
                      <p className="text-xs text-slate-400">{dayRecords.length} record{dayRecords.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Mini status pills */}
                  <div className="hidden sm:flex items-center gap-2">
                    {Object.entries(counts).filter(([, n]) => n > 0).map(([s, n]) => (
                      <span key={s} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[s]}`}>
                        {n} {s.replace('_', ' ')}
                      </span>
                    ))}
                    {isOpen ? <ChevronUp size={18} className="text-slate-400 ml-2" /> : <ChevronDown size={18} className="text-slate-400 ml-2" />}
                  </div>
                </button>

                {/* Records table */}
                {isOpen && (
                  <div className="border-t border-slate-100 overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Check In</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Check Out</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hours</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dayRecords.map(record => (
                          <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                              {typeof record.employee === 'object' && record.employee
                                ? `${record.employee.firstName} ${record.employee.lastName}`
                                : 'Unknown'}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-500">{fmtTime(record.checkIn)}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-500">{fmtTime(record.checkOut)}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-500">{record.totalHours ?? '—'}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[record.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                {record.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <button
                                onClick={() => handleEdit(record)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Edit Attendance</h2>
              <button onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Check In</label>
                <input type="datetime-local" className="form-input" required
                  value={editForm.checkIn} onChange={e => setEditForm({ ...editForm, checkIn: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Check Out</label>
                <input type="datetime-local" className="form-input"
                  value={editForm.checkOut} onChange={e => setEditForm({ ...editForm, checkOut: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                <select className="form-input" value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                  {['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE'].map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Hours</label>
                <input type="number" step="0.01" className="form-input"
                  value={editForm.totalHours} onChange={e => setEditForm({ ...editForm, totalHours: Number(e.target.value) })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
