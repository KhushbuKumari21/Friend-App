// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom'; // Only import what you use

const PrivateRoute = ({ children }) => {
  const isAuthenticated = Boolean(localStorage.getItem('token')); // Example check
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
