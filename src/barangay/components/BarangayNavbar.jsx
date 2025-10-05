import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Eye, 
  Menu, 
  X, 
  LogOut, 
  Recycle,
  ChevronLeft,
  ChevronRight,
  Home,
  Building2
} from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext';
import './BarangayNavbar.css';

const BarangayNavbar = ({ isMobile }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  return (
    <>
      {/* Top Header */}
      <header className="barangay-header">
        <div className="barangay-header-container">
          <div className="header-left">
            <div className="barangay-brand">
              <div className="barangay-brand-icon">
                <img className="barangay-brand-icon-image" src={"/images/recycling-icon.svg"} alt="SariCycle Logo" />
              </div>
              <span className="barangay-brand-text">SariCycle Barangay</span>
            </div>
          </div>
          
          <div className="header-right">
            <button 
              className="logout-button"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="mobile-menu-button"
              onClick={handleToggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <nav className="barangay-sidebar">
        <div className="sidebar-content">
          <div className="nav-section">
            <div className="nav-header">
              <span className="nav-title">Navigation</span>
            </div>
            <div className="nav-links">
              <NavLink 
                to="/barangay/dashboard" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                title="Dashboard"
              >
                <div className="nav-link-icon">
                  <BarChart3 size={20} />
                </div>
                <span className="nav-link-text">Dashboard</span>
              </NavLink>
              
              <NavLink 
                to="/barangay/view-users" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                title="View Users"
              >
                <div className="nav-link-icon">
                  <Users size={20} />
                </div>
                <span className="nav-link-text">View Users</span>
              </NavLink>
              
              <NavLink 
                to="/barangay/view-activities" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                title="View Activities"
              >
                <div className="nav-link-icon">
                  <Eye size={20} />
                </div>
                <span className="nav-link-text">Activities</span>
              </NavLink>
            </div>
          </div>

          {/*
          <div className="nav-section">
            <div className="nav-header">
              <span className="nav-title">Quick Actions</span>
            </div>
            <div className="nav-links">
              <NavLink 
                to="/home" 
                className="nav-link"
                title="Back to Home"
              >
                <div className="nav-link-icon">
                  <Home size={20} />
                </div>
                <span className="nav-link-text">Back to Home</span>
              </NavLink>
            </div>
          </div>
          */}

        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <div className="mobile-nav-header">
            <div className="barangay-brand">
              <div className="barangay-brand-icon">
                <Building2 size={24} />
              </div>
              <span className="barangay-brand-text">SariCycle Barangay</span>
            </div>
            <button 
              className="mobile-nav-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="mobile-nav-links">
            <NavLink 
              to="/barangay/dashboard" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BarChart3 size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/barangay/view-users" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users size={20} />
              <span>View Users</span>
            </NavLink>
            <NavLink 
              to="/barangay/view-activities" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Eye size={20} />
              <span>Activities</span>
            </NavLink>
            {/*
            <NavLink 
              to="/home" 
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home size={20} />
              <span>Back to Home</span>
            </NavLink>
            */}
            
            <button 
              className="mobile-nav-link logout-link"
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              aria-label="Logout"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BarangayNavbar; 