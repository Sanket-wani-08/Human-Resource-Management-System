import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import { Toaster } from 'react-hot-toast';

// Public pages
import Login from './pages/Login';

// Lazy load role-specific dashboards
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const HRDashboard = React.lazy(() => import('./pages/HRDashboard'));
const EmployeeDashboard = React.lazy(() => import('./pages/EmployeeDashboard'));

// Lazy load shared pages
const Employees = React.lazy(() => import('./pages/Employees'));
const Departments = React.lazy(() => import('./pages/Departments'));
const Attendance = React.lazy(() => import('./pages/Attendance'));
const Leaves = React.lazy(() => import('./pages/Leaves'));
const Payroll = React.lazy(() => import('./pages/Payroll'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Holidays = React.lazy(() => import('./pages/Holidays'));

// A beautiful loading spinner for Suspense fallback
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* All authenticated users share DashboardLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              
              {/* ── Admin routes ── */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={
                  <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
                } />
                <Route path="/settings" element={
                  <Suspense fallback={<PageLoader />}><Settings /></Suspense>
                } />
              </Route>

              {/* ── HR routes ── */}
              <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
                <Route path="/hr/dashboard" element={
                  <Suspense fallback={<PageLoader />}><HRDashboard /></Suspense>
                } />
              </Route>

              {/* ── Shared route for ALL authenticated users ── */}
              <Route path="/holidays" element={
                <Suspense fallback={<PageLoader />}><Holidays /></Suspense>
              } />

              {/* ── Admin + HR shared routes ── */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HR']} />}>
                <Route path="/employees" element={
                  <Suspense fallback={<PageLoader />}><Employees /></Suspense>
                } />
                <Route path="/departments" element={
                  <Suspense fallback={<PageLoader />}><Departments /></Suspense>
                } />
                <Route path="/attendance" element={
                  <Suspense fallback={<PageLoader />}><Attendance /></Suspense>
                } />
                <Route path="/leaves" element={
                  <Suspense fallback={<PageLoader />}><Leaves /></Suspense>
                } />
                <Route path="/payroll" element={
                  <Suspense fallback={<PageLoader />}><Payroll /></Suspense>
                } />
              </Route>

              {/* ── Employee routes ── */}
              <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
                <Route path="/employee/dashboard" element={
                  <Suspense fallback={<PageLoader />}><EmployeeDashboard /></Suspense>
                } />
                <Route path="/profile" element={
                  <Suspense fallback={<PageLoader />}><Profile /></Suspense>
                } />
                <Route path="/my-attendance" element={
                  <Suspense fallback={<PageLoader />}><Attendance /></Suspense>
                } />
                <Route path="/my-leaves" element={
                  <Suspense fallback={<PageLoader />}><Leaves /></Suspense>
                } />
                <Route path="/my-payroll" element={
                  <Suspense fallback={<PageLoader />}><Payroll /></Suspense>
                } />
              </Route>

            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
