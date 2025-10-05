import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Wallet, 
  Award, 
  BookOpen, 
  Menu, 
  X, 
  LogOut, 
  Recycle,
  Gift
} from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext';
import UserProfileDropdown from './UserProfileDropdown';
import './HomeNavbar.css';

const HomeNavbar = () => {
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
    <nav className="home-navbar">
      <div className="home-navbar-container">
        <div className="home-navbar-brand">
          <div className="home-brand-icon">
            <img src={"/images/recycling-icon.svg"} alt="SariCycle Logo" />
          </div>
          <span className="home-brand-text">SariCycle</span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="home-navbar-nav">
          <NavLink 
            to="/home" 
            end
            className={({ isActive }) => `home-nav-link ${isActive ? 'active' : ''}`}
          >
            <span>Home</span>
          </NavLink>
          <NavLink 
            to="/home/digital-wallet" 
            className={({ isActive }) => `home-nav-link ${isActive ? 'active' : ''}`}
          >
            <span>Digital Wallet</span>
          </NavLink>
          <NavLink 
            to="/home/redeem-rewards" 
            className={({ isActive }) => `home-nav-link ${isActive ? 'active' : ''}`}
          >
            <span>Redeem Rewards</span>
          </NavLink>
          {/*
          <NavLink 
            to="/home/learn-recycling" 
            className={({ isActive }) => `home-nav-link ${isActive ? 'active' : ''}`}
          >
            <span>Learn Recycling</span>
          </NavLink>
          */}
          <NavLink 
            to="/home/about" 
            className={({ isActive }) => `home-nav-link ${isActive ? 'active' : ''}`}
          >
            <span>About</span>
          </NavLink>
          
          {/* User Profile Dropdown */}
          <UserProfileDropdown />
        </div>

        {/* Mobile menu button */}
        <button 
          className="home-mobile-menu-button"
          onClick={handleToggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile Navigation */}
        <div className={`home-mobile-nav ${isMobileMenuOpen ? 'home-mobile-nav-open' : ''}`}>
          <NavLink 
            to="/home" 
            end
            className={({ isActive }) => `home-mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Home size={18} />
            <span>Home</span>
          </NavLink>
          <NavLink 
            to="/home/digital-wallet" 
            className={({ isActive }) => `home-mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Wallet size={18} />
            <span>Digital Wallet</span>
          </NavLink>
          <NavLink 
            to="/home/redeem-rewards" 
            className={({ isActive }) => `home-mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Gift size={18} />
            <span>Redeem Rewards</span>
          </NavLink>
          <NavLink 
            to="/home/learn-recycling" 
            className={({ isActive }) => `home-mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BookOpen size={18} />
            <span>Learn Recycling</span>
          </NavLink>
          <NavLink 
            to="/home/about" 
            className={({ isActive }) => `home-mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Award size={18} />
            <span>About</span>
          </NavLink>
          
          {/* Mobile User Profile Dropdown */}
          <div className="mobile-profile-section">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar; 