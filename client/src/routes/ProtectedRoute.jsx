import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import React from 'react';

const ProtectedRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userLoading } = useUser();

  if (authLoading || userLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const location = window.location.hash ? window.location.hash.slice(1) : window.location.pathname;

  // 1. If user is authenticated but NOT onboarded
  if (user && !userData?.onboarded) {
    if (location !== '/onboarding') {
       return <Navigate to="/onboarding" replace />;
    }
    return <Outlet />;
  }

  // 2. If user IS onboarded but tries to access /onboarding
  if (user && userData?.onboarded && location === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  // 3. Normal protected route behavior
  return <Outlet />;
};

export default ProtectedRoute;
