import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/contexts/AuthContext';
import ProtectedRoute from './auth/components/ProtectedRoute'; 
import Authentication from './auth/Authentication';
import Landing from './home/pages/Landing';
import Home from './home/pages/Home';
import About from './home/pages/About';
import LearnRecycling from './home/pages/LearnRecycling';
import DigitalWallet from './home/pages/DigitalWallet';
import RedeemRewards from './home/pages/RedeemRewards';

import Dashboard from './admin/pages/Dashboard';
import ManageAccounts from './admin/pages/ManageAccounts';
import ManageProducts from './admin/pages/ManageProducts';

// Import Barangay Components
import BarangayDashboard from './barangay/pages/BarangayDashboard';
import ViewUsers from './barangay/pages/ViewUsers';
import ViewActivities from './barangay/pages/ViewActivities';
import './App.css';

// Route wrapper component to handle initial redirect logic
const AppRoutes = () => {
  const { isAuthenticated, isAdmin, isBarangay, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading SariCycle...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={<Authentication />} />
      
      {/* Landing and Home Routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/home/about" element={
        <ProtectedRoute userOnly={false}>
          <About />
        </ProtectedRoute>
      } />
      
      {/*}
      <Route path="/home/learn-recycling" element={
        <ProtectedRoute userOnly={false}>
          <LearnRecycling />
        </ProtectedRoute>
      } />
      */}
      
      {/* Root redirect logic */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            isAdmin() ? (
              <Navigate to="/admin/dashboard" replace />
            ) : isBarangay() ? (
              <Navigate to="/barangay/dashboard" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          ) : (
            <Navigate to="/landing" replace />
          )
        } 
      />

      {/* User Routes - Protected for regular users */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute userOnly={false}>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/home/digital-wallet" 
        element={
          <ProtectedRoute userOnly={false}>
            <DigitalWallet />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/home/redeem-rewards" 
        element={
          <ProtectedRoute userOnly={false}>
            <RedeemRewards />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes - Protected for admins only */}
      <Route 
        path="/admin" 
        element={<Navigate to="/admin/dashboard" replace />} 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute adminOnly={true}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/manage-accounts" 
        element={
          <ProtectedRoute adminOnly={true}>
            <ManageAccounts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/manage-products" 
        element={
          <ProtectedRoute adminOnly={true}>
            <ManageProducts />
          </ProtectedRoute>
        } 
      />

      {/* Barangay Routes - Protected for barangay officials only */}
      <Route 
        path="/barangay" 
        element={<Navigate to="/barangay/dashboard" replace />} 
      />
      <Route 
        path="/barangay/dashboard" 
        element={
          <ProtectedRoute barangayOnly={true}>
            <BarangayDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barangay/view-users" 
        element={
          <ProtectedRoute barangayOnly={true}>
            <ViewUsers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barangay/view-activities" 
        element={
          <ProtectedRoute barangayOnly={true}>
            <ViewActivities />
          </ProtectedRoute>
        } 
      />

      {/* Catch all - redirect to appropriate page */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? (
            isAdmin() ? (
              <Navigate to="/admin/dashboard" replace />
            ) : isBarangay() ? (
              <Navigate to="/barangay/dashboard" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          ) : (
            <Navigate to="/landing" replace />
          )
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
