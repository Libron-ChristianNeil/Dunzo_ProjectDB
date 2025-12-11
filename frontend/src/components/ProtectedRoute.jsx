// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// This function checks for an authentication token in localStorage.
// You should adapt this to your application's authentication logic.
const useAuth = () => {
  const token = localStorage.getItem('authToken');
  return token != null;
};

const ProtectedRoute = () => {
  const isAuth = useAuth();
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
