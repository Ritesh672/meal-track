import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import React from 'react';

const ProtectedRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userLoading } = useUser();

  if (authLoading || userLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 text-blue-600 font-medium">Loading User Data...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but userData failed to load (is null)
  if (user && !userData) {
      // Option: Retry or show error using a simple UI
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4 text-center">
              <p className="text-red-500 mb-2">Failed to load user profile.</p>
              <button onClick={() => window.location.reload()} className="text-blue-600 underline">Retry</button>
          </div>
      );
  }

  const location = window.location.hash ? window.location.hash.slice(1) : window.location.pathname;

  // 1. If user is authenticated but NOT onboarded
  if (user && userData && !userData.onboarded) {
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
