import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';  

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false, barangayOnly = false }) => {
  const { isAuthenticated, isAdmin, isUser, isBarangay, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-page">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If admin-only route and user is not admin
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/home" replace />;
  }

  // If user-only route and user is not a regular user
  if (userOnly && !isUser()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If barangay-only route and user is not barangay official
  if (barangayOnly && !isBarangay()) {
    // Redirect based on user type
    if (isAdmin()) {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  // User is authenticated and has proper permissions
  return children;
};

export default ProtectedRoute;
