import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guards routes that require an authenticated admin and completed 2FA check
 */
export const AdminRoute = () => {
  const { user, role, loading, twoFactorRequired } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Not logged in or not an admin, redirect to login
  if (!user || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Admin exists, but 2FA is required and not yet verified in this session
  if (twoFactorRequired) {
    return <Navigate to="/2fa" replace />;
  }

  return <Outlet />;
};
