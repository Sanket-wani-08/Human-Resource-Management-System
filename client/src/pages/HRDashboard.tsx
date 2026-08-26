import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Users, Building2, CalendarOff, Wallet, ClipboardList, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SkeletonCard = () => (
  <div className="glass-card p-6">
    <div className="skeleton h-4 w-28 mb-4" />
    <div className="skeleton h-9 w-16 mb-2" />
    <div className="skeleton h-3 w-20" />
  </div>
);

const HRDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard/admin');
        if (response.data.success) setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch HR dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="skeleton h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Failed to load dashboard data.
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Employees',
      value: data.totalEmployees,
      icon: <Users size={22} className="text-white" />,
      iconBg: 'icon-violet',
      sub: 'Registered staff',
    },
    {
      title: 'Active Employees',
      value: data.activeEmployees,
      icon: <CheckCircle size={22} className="text-white" />,
      iconBg: 'icon-green',
      sub: 'Currently active',
    },
    {
      title: 'Departments',
      value: data.totalDepartments,
      icon: <Building2 size={22} className="text-white" />,
      iconBg: 'icon-indigo',
      sub: 'Managed teams',
    },
    {
      title: 'Present Today',
      value: data.presentToday,
      icon: <ClipboardList size={22} className="text-white" />,
      iconBg: 'icon-green',
      sub: "Today's attendance",
    },
    {
      title: 'Absent Today',
      value: data.absentToday,
      icon: <CalendarOff size={22} className="text-white" />,
      iconBg: 'icon-red',
      sub: 'Not checked in',
    },
    {
      title: 'Pending Leaves',
      value: data.pendingLeaves,
      icon: <CalendarOff size={22} className="text-white" />,
      iconBg: 'icon-orange',
      sub: 'Awaiting your review',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-extrabold text-slate-900">HR Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your team's attendance, leaves, and payroll from here.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass-card p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.07}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.title}</p>
                <p className="text-4xl font-extrabold text-slate-900 mt-2 mb-1">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.iconBg} flex items-center justify-center flex-shrink-0 shadow-md`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-8 animate-fade-in-up delay-400">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/leaves')}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow hover:shadow-lg active:scale-95"
          >
            <CalendarOff size={16} />
            Review Pending Leaves
            {data.pendingLeaves > 0 && (
              <span className="ml-1 bg-white/20 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {data.pendingLeaves}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-all shadow hover:shadow-lg active:scale-95"
          >
            <Users size={16} />
            View Employees
          </button>
          <button
            onClick={() => navigate('/payroll')}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow hover:shadow-lg active:scale-95"
          >
            <Wallet size={16} />
            Manage Payroll
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
