import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { CalendarCheck, LogOut, Clock, CalendarOff, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const response = await apiClient.get('/dashboard/employee');
      if (response.data.success) setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    try {
      setIsActing(true);
      await apiClient.post('/attendance/check-in');
      await fetchDashboard();
    } catch {
      alert('Failed to check in. You might have already checked in today.');
    } finally {
      setIsActing(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsActing(true);
      await apiClient.post('/attendance/check-out');
      await fetchDashboard();
    } catch {
      alert('Failed to check out.');
    } finally {
      setIsActing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="skeleton h-40 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="skeleton h-36 rounded-2xl" />
          <div className="skeleton h-36 rounded-2xl" />
          <div className="skeleton h-36 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Failed to load your dashboard.
      </div>
    );
  }

  const hasCheckedIn = !!data.todayAttendance;
  const hasCheckedOut = !!data.todayAttendance?.checkOut;

  // Initials
  const initials = `${data.employee.firstName?.[0] ?? ''}${data.employee.lastName?.[0] ?? ''}`.toUpperCase();

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* ── Hero welcome card ── */}
      <div
        className="rounded-2xl p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden animate-fade-in-up"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #10b981 100%)',
        }}
      >
        {/* Background decoration */}
        <div className="absolute -top-14 -right-14 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />

        <div className="flex items-center gap-5 relative">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-extrabold text-2xl shadow-lg flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-emerald-100 text-sm font-medium">Welcome back 👋</p>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              {data.employee.firstName} {data.employee.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-white/70 text-sm">{data.employee.designation}</span>
              {data.employee.department?.name && (
                <>
                  <span className="text-white/40">·</span>
                  <span className="text-white/70 text-sm">{data.employee.department.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Check-in / out */}
        <div className="relative flex-shrink-0">
          {!hasCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={isActing}
              id="btn-check-in"
              className="flex items-center gap-2.5 px-7 py-3.5 bg-white text-emerald-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all disabled:opacity-60 btn-pulse-green"
            >
              <CalendarCheck size={20} />
              Check In
            </button>
          ) : !hasCheckedOut ? (
            <button
              onClick={handleCheckOut}
              disabled={isActing}
              id="btn-check-out"
              className="flex items-center gap-2.5 px-7 py-3.5 bg-orange-500 text-white font-bold rounded-2xl shadow-xl hover:bg-orange-600 hover:shadow-2xl active:scale-95 transition-all disabled:opacity-60"
            >
              <LogOut size={20} />
              Check Out
            </button>
          ) : (
            <div className="flex items-center gap-2.5 px-7 py-3.5 bg-white/20 text-white font-bold rounded-2xl backdrop-blur-sm">
              <Clock size={20} />
              Shift Completed ✓
            </div>
          )}
        </div>
      </div>

      {/* ── Info cards row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Status */}
        <div className="glass-card p-6 animate-fade-in-up delay-100">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 icon-green rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-700">Today's Status</h2>
          </div>

          {hasCheckedIn ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Check In</span>
                <span className="font-semibold text-slate-800 text-sm bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                  {fmt(data.todayAttendance.checkIn)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Check Out</span>
                <span className={`font-semibold text-sm px-2.5 py-1 rounded-lg ${
                  data.todayAttendance.checkOut
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {data.todayAttendance.checkOut ? fmt(data.todayAttendance.checkOut) : '--:--'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">You haven't checked in yet today.</p>
          )}
        </div>

        {/* Leave Status */}
        <div className="glass-card p-6 animate-fade-in-up delay-200">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 icon-orange rounded-lg flex items-center justify-center">
              <CalendarOff size={16} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-700">Leave Status</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Pending Requests</span>
              <span className="font-bold text-slate-800 text-lg">{data.pendingLeaves}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/my-leaves')}
            className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 py-2 rounded-lg hover:bg-orange-50 transition-colors"
          >
            View My Leaves <ArrowRight size={14} />
          </button>
        </div>

        {/* Payroll */}
        <div className="glass-card p-6 animate-fade-in-up delay-300">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 icon-blue rounded-lg flex items-center justify-center">
              <Wallet size={16} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-700">Current Payroll</h2>
          </div>

          {data.currentPayroll ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Net Salary</span>
                <span className="font-extrabold text-slate-900 text-xl">
                  ₹{data.currentPayroll.netSalary.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Status</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  data.currentPayroll.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-orange-50 text-orange-600'
                }`}>
                  {data.currentPayroll.paymentStatus}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">No payroll generated this month.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
