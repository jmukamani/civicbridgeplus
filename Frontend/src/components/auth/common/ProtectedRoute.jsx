import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ roles }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;