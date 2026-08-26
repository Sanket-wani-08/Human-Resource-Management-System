import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Users, Building2, CalendarCheck, CalendarOff, Wallet, TrendingUp } from 'lucide-react';

const SkeletonCard = () => (
  <div className="glass-card p-6">
    <div className="skeleton h-4 w-28 mb-4" />
    <div className="skeleton h-9 w-16 mb-2" />
    <div className="skeleton h-3 w-20" />
  </div>
);

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard/admin');
        if (response.data.success) setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
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
        <div className="skeleton h-40 w-full rounded-2xl" />
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
      iconBg: 'icon-blue',
      sub: 'Registered staff',
    },
    {
      title: 'Active Employees',
      value: data.activeEmployees,
      icon: <Users size={22} className="text-white" />,
      iconBg: 'icon-green',
      sub: 'Currently active',
    },
    {
      title: 'Departments',
      value: data.totalDepartments,
      icon: <Building2 size={22} className="text-white" />,
      iconBg: 'icon-indigo',
      sub: 'Across organisation',
    },
    {
      title: 'Present Today',
      value: data.presentToday,
      icon: <CalendarCheck size={22} className="text-white" />,
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
      sub: 'Awaiting approval',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-extrabold text-slate-900">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening across your organisation today.</p>
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

      {/* Payroll hero card */}
      <div className="glass-card p-8 animate-fade-in-up delay-400 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-50 rounded-full pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 icon-blue rounded-xl flex items-center justify-center shadow">
                <Wallet size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Payroll Summary</h2>
                <p className="text-xs text-slate-400">
                  {data.payrollSummary.month} {data.payrollSummary.year}
                </p>
              </div>
            </div>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="text-5xl font-extrabold text-slate-900 mt-4">
            ${data.payrollSummary.total.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500 mt-2">Total gross payout this month</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
