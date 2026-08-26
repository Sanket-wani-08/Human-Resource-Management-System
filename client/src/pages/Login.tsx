import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Building2, Shield, Users, UserCheck, Eye, EyeOff } from 'lucide-react';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
}).required();

type RoleTab = 'admin' | 'hr' | 'employee';

const roleConfig: Record<RoleTab, {
  label: string;
  icon: React.ReactNode;
  accent: string;
  ring: string;
  gradient: string;
  title: string;
  subtitle: string;
}> = {
  admin: {
    label: 'Admin',
    icon: <Shield size={16} />,
    accent: 'bg-blue-600 hover:bg-blue-700',
    ring: 'focus:ring-blue-500',
    gradient: 'from-blue-900 via-blue-800 to-indigo-900',
    title: 'Admin Control Center',
    subtitle: 'Manage your entire organisation from one place.',
  },
  hr: {
    label: 'HR',
    icon: <Users size={16} />,
    accent: 'bg-violet-600 hover:bg-violet-700',
    ring: 'focus:ring-violet-500',
    gradient: 'from-violet-900 via-purple-800 to-indigo-900',
    title: 'HR Management Hub',
    subtitle: 'Oversee people, leaves, and payroll with ease.',
  },
  employee: {
    label: 'Employee',
    icon: <UserCheck size={16} />,
    accent: 'bg-emerald-600 hover:bg-emerald-700',
    ring: 'focus:ring-emerald-500',
    gradient: 'from-emerald-900 via-teal-800 to-cyan-900',
    title: 'Employee Portal',
    subtitle: 'Track attendance, leaves, and your payslips.',
  },
};

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<RoleTab>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const cfg = roleConfig[activeTab];

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(loginSchema),
  });


  const tabToRole: Record<RoleTab, string> = {
    admin: 'ADMIN',
    hr: 'HR',
    employee: 'EMPLOYEE',
  };

  const onSubmit = async (data: any) => {
    try {
      setError('');
      const response = await apiClient.post('/auth/login', data);
      if (response.data.success) {
        const user = response.data.data.user;

        // Enforce tab-role match
        if (user.role !== tabToRole[activeTab]) {
          setError(
            `This account is not an ${roleConfig[activeTab].label} account. Please select the correct role tab.`
          );
          return;
        }

        login(response.data.data.token, user);
        if (user.role === 'ADMIN') navigate('/admin/dashboard');
        else if (user.role === 'HR') navigate('/hr/dashboard');
        else navigate('/employee/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div
        className={`hidden lg:flex flex-col justify-between w-[46%] bg-gradient-to-br ${cfg.gradient} p-12 relative overflow-hidden transition-all duration-700`}
        style={{ backgroundSize: '400% 400%', animation: 'gradientShift 10s ease infinite' }}
      >
        {/* Floating blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 animate-fade-in-left">
          <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Building2 className="text-white" size={22} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">HRMS</span>
        </div>

        {/* Centre illustration / text */}
        <div className="animate-fade-in-up delay-200">
          <div className="animate-float mb-8">
            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto">
              {React.cloneElement(cfg.icon as React.ReactElement, { size: 48, className: 'text-white/90' })}
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight text-center">
            {cfg.title}
          </h2>
          <p className="mt-4 text-white/70 text-center text-lg leading-relaxed">
            {cfg.subtitle}
          </p>
        </div>

        {/* Bottom tagline */}
        <p className="text-white/40 text-sm animate-fade-in-up delay-300">
          &copy; 2025 HRMS · All rights reserved
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-[420px] animate-scale-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg text-slate-800">HRMS</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 mb-8 text-sm">Sign in to your workspace</p>

          {/* Role Tabs */}
          <div className="flex gap-2 p-1 bg-slate-200 rounded-xl mb-8">
            {(Object.keys(roleConfig) as RoleTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-white shadow-sm text-slate-900 scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {roleConfig[tab].icon}
                {roleConfig[tab].label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 animate-fade-in-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                {...register('email')}
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="form-input"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl text-white text-sm font-semibold transition-all duration-200 ${cfg.accent} disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : `Sign in as ${roleConfig[activeTab].label}`}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default Login;
