import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - loading:', loading);
  console.log('ProtectedRoute - roles:', roles);
  console.log('ProtectedRoute - current location:', location.pathname);

  if (loading) {
    console.log('ProtectedRoute - showing loading...');
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute - no user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    console.log('ProtectedRoute - user role not allowed, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute - user authenticated, rendering outlet');
  return <Outlet />;
};

export default ProtectedRoute;