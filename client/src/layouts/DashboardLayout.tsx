import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarOff,
  Wallet,
  LogOut,
  Menu,
  X,
  Bell,
  UserCircle,
  Settings as SettingsIcon,
  CalendarDays,
} from 'lucide-react';

type NavItem = { name: string; path: string; icon: React.ReactNode };

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isHR = role === 'HR';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-specific sidebar accent colours
  const accentClass = isAdmin
    ? 'bg-blue-600'
    : isHR
    ? 'bg-violet-600'
    : 'bg-emerald-600';

  const accentText = isAdmin
    ? 'text-blue-400'
    : isHR
    ? 'text-violet-400'
    : 'text-emerald-400';

  const accentBg = isAdmin
    ? 'bg-blue-600/20'
    : isHR
    ? 'bg-violet-600/20'
    : 'bg-emerald-600/20';

  const roleLabel = isAdmin ? 'Admin' : isHR ? 'HR Manager' : 'Employee';

  const roleBadgeClass = isAdmin
    ? 'role-badge-admin'
    : isHR
    ? 'role-badge-hr'
    : 'role-badge-employee';

  const navItems: NavItem[] = isAdmin
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Employees', path: '/employees', icon: <Users size={18} /> },
        { name: 'Departments', path: '/departments', icon: <Building2 size={18} /> },
        { name: 'Attendance', path: '/attendance', icon: <CalendarCheck size={18} /> },
        { name: 'Leaves', path: '/leaves', icon: <CalendarOff size={18} /> },
        { name: 'Holidays', path: '/holidays', icon: <CalendarDays size={18} /> },
        { name: 'Payroll', path: '/payroll', icon: <Wallet size={18} /> },
        { name: 'Settings', path: '/settings', icon: <SettingsIcon size={18} /> },
      ]
    : isHR
    ? [
        { name: 'Dashboard', path: '/hr/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Employees', path: '/employees', icon: <Users size={18} /> },
        { name: 'Departments', path: '/departments', icon: <Building2 size={18} /> },
        { name: 'Attendance', path: '/attendance', icon: <CalendarCheck size={18} /> },
        { name: 'Leaves', path: '/leaves', icon: <CalendarOff size={18} /> },
        { name: 'Holidays', path: '/holidays', icon: <CalendarDays size={18} /> },
        { name: 'Payroll', path: '/payroll', icon: <Wallet size={18} /> },
      ]
    : [
        { name: 'Dashboard', path: '/employee/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'My Profile', path: '/profile', icon: <UserCircle size={18} /> },
        { name: 'My Attendance', path: '/my-attendance', icon: <CalendarCheck size={18} /> },
        { name: 'My Leaves', path: '/my-leaves', icon: <CalendarOff size={18} /> },
        { name: 'Holidays', path: '/holidays', icon: <CalendarDays size={18} /> },
        { name: 'My Payroll', path: '/my-payroll', icon: <Wallet size={18} /> },
      ];

  // Initials avatar
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 w-full sidebar-dark z-30 flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 ${accentClass} rounded-lg flex items-center justify-center`}>
            <Building2 size={14} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">HRMS</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white">
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Sidebar ── */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative top-0 left-0 h-full w-64 sidebar-dark flex flex-col z-20 transition-transform duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="hidden md:flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className={`w-9 h-9 ${accentClass} rounded-xl flex items-center justify-center shadow-lg`}>
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">HRMS</span>
            <p className={`text-[10px] font-semibold uppercase tracking-widest ${accentText} mt-0.5`}>
              {roleLabel}
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 mt-14 md:mt-0 overflow-y-auto space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? `${accentBg} ${accentText} nav-item-active`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
            <div className={`w-9 h-9 rounded-xl ${accentClass} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <span className={`role-badge ${roleBadgeClass} mt-0.5`}>{roleLabel}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 hidden md:flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-medium">{dateStr}</p>
            <h2 className="text-slate-800 font-semibold text-lg leading-tight">
              {isAdmin
                ? 'Admin Control Center'
                : isHR
                ? 'HR Management Hub'
                : `Welcome, ${user?.name?.split(' ')[0] ?? 'there'}! 👋`}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <Bell size={18} />
            </button>
            <div className={`w-9 h-9 rounded-xl ${accentClass} flex items-center justify-center text-white text-xs font-bold`}>
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
