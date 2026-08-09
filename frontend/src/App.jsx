import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Receive from './pages/public/Receive';
import ShareView from './pages/public/ShareView';
import NotFound from './pages/public/NotFound';
import Unauthorized from './pages/public/Unauthorized';

import Dashboard from './pages/dashboard/Dashboard';
import CreateShare from './pages/dashboard/CreateShare';
import ShareHistory from './pages/dashboard/ShareHistory';
import Profile from './pages/dashboard/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminShares from './pages/admin/AdminShares';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'neu-card !bg-base-light dark:!bg-base-dark !text-slate-600 dark:!text-slate-200 !shadow-neu dark:!shadow-neu-dark',
        }}
      />
      <Routes>
        {/* Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/share/:shareKey" element={<ShareView />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Authenticated user dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/create" element={<CreateShare />} />
            <Route path="/dashboard/history" element={<ShareHistory />} />
            <Route path="/dashboard/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/shares" element={<AdminShares />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>
        </Route>

        <Route path="*" element={<MainLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
