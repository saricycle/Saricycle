import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, QrCode, Download, RefreshCw, X } from 'lucide-react';
import QRCode from 'qrcode';
import { database } from '../../firebase/config';
import { ref, get, update } from 'firebase/database';
import { useAuth } from '../../auth/contexts/AuthContext';
import SettingsModal from './SettingsModal';
import './UserProfileDropdown.css';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/landing');
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
    setIsOpen(false);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  // Check if user is eligible for QR code (only regular users)
  const isQRCodeEligible = (userData) => {
    return userData && (userData.usertype === 'user' || userData.category === 'Users');
  };

  // Generate QR Code (only for regular users)
  const generateQRCode = async (userData) => {
    try {
      // Only generate QR code for regular users
      if (!isQRCodeEligible(userData)) {
        console.log('QR code generation skipped for non-user type:', userData.usertype);
        return null;
      }

      const qrData = JSON.stringify({
        userID: userData.userID,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        points: userData.points || 0,
        usertype: userData.usertype || 'user',
        address: userData.address || '',
        category: userData.category
      });

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  // Save QR code to Firebase (only for regular users)
  const saveQRCodeToFirebase = async (userID, qrCodeDataUrl, category) => {
    try {
      // Only save QR code for regular users
      if (category !== 'Users') {
        return;
      }

      const userRef = ref(database, `${category}/${userID}`);
      await update(userRef, {
        qrCode: qrCodeDataUrl,
        qrCodeUpdatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving QR code to Firebase:', error);
    }
  };

  // Handle QR code button click
  const handleQRCodeClick = async () => {
    setIsOpen(false);
    
    if (!isQRCodeEligible(user)) {
      alert('QR codes are only available for regular users.');
      return;
    }

    setShowQRPopup(true);
    setIsGeneratingQR(true);

    try {
      // First, try to get existing QR code from Firebase
      const userRef = ref(database, `${user.category}/${user.userID}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        
        if (userData.qrCode) {
          setQrCodeUrl(userData.qrCode);
          setIsGeneratingQR(false);
          return;
        }
      }

      // Generate new QR code if it doesn't exist
      const qrCodeDataUrl = await generateQRCode(user);
      if (qrCodeDataUrl) {
        setQrCodeUrl(qrCodeDataUrl);
        await saveQRCodeToFirebase(user.userID, qrCodeDataUrl, user.category);
      }
    } catch (error) {
      console.error('Error loading QR code:', error);
      alert('Error loading QR code. Please try again.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Download QR Code
  const handleDownloadQR = () => {
    if (qrCodeUrl && user) {
      const link = document.createElement('a');
      link.download = `${user.username}_qrcode.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  // Refresh QR Code
  const handleRefreshQR = async () => {
    if (!user) return;
    
    setIsGeneratingQR(true);
    try {
      const qrCodeDataUrl = await generateQRCode(user);
      if (qrCodeDataUrl) {
        setQrCodeUrl(qrCodeDataUrl);
        await saveQRCodeToFirebase(user.userID, qrCodeDataUrl, user.category);
      }
    } catch (error) {
      console.error('Error refreshing QR code:', error);
      alert('Error refreshing QR code. Please try again.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Close QR popup
  const handleCloseQRPopup = () => {
    setShowQRPopup(false);
    setQrCodeUrl('');
  };

  // Handle popup backdrop click
  const handlePopupBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseQRPopup();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown and QR popup on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showQRPopup) {
          handleCloseQRPopup();
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showQRPopup]);

  const getInitials = (username) => {
    if (!username) return 'U';
    const parts = username.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      <button
        className="profile-trigger"
        onClick={handleToggleDropdown}
        aria-label="User profile menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="profile-avatar">
          <span className="avatar-text">{getInitials(user?.username)}</span>
        </div>
        <ChevronDown 
          className={`chevron-icon ${isOpen ? 'chevron-rotated' : ''}`} 
          size={16} 
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-avatar">
                <span className="avatar-text-large">{getInitials(user?.username)}</span>
              </div>
              <div className="user-details">
                <h4 className="username">{user?.username || 'User'}</h4>
                <p className="user-email">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-body">
            <button
              className="dropdown-item"
              onClick={handleSettingsClick}
              tabIndex="0"
              aria-label="Settings"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            
            {/* Only show QR Code option for regular users */}
            {isQRCodeEligible(user) && (
              <button
                className="dropdown-item"
                onClick={handleQRCodeClick}
                tabIndex="0"
                aria-label="Show QR Code"
              >
                <QrCode size={18} />
                <span>My QR Code</span>
              </button>
            )}
            
            <button
              className="dropdown-item logout-item"
              onClick={handleLogout}
              tabIndex="0"
              aria-label="Logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

            {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettingsModal}
      />

      {/* QR Code Popup */}
      {showQRPopup && (
        <div 
          className="qr-popup-overlay"
          onClick={handlePopupBackdropClick}
          tabIndex={-1}
        >
          <div className="qr-popup-modal">
            <div className="qr-popup-header">
              <div className="qr-popup-title">
                <QrCode size={24} />
                <h3>My QR Code</h3>
              </div>
              <button 
                onClick={handleCloseQRPopup}
                className="qr-popup-close"
                aria-label="Close QR code popup"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="qr-popup-content">

              {/*
              <div className="user-info">
                <h4>{user?.username || 'User'}</h4>
                <p>{user?.email || 'user@example.com'}</p>
                <span className={`usertype-display ${user?.usertype || 'user'}`}>
                  {user?.usertype || 'User'}
                </span>
                <span className="points-display">Points: {user?.points || 0}</span>
                {user?.address && (
                  <p className="address-display">{user.address}</p>
                )}
              </div>
              */}
              
              {isGeneratingQR ? (
                <div className="qr-loading">
                  <div className="loading-spinner"></div>
                  <p>Generating QR code...</p>
                </div>
              ) : qrCodeUrl ? (
                <div className="qr-display">
                  <img 
                    src={qrCodeUrl} 
                    alt="User QR Code" 
                    className="qr-image"
                  />
                  <div className="qr-actions">
                    <button 
                      onClick={handleDownloadQR}
                      className="btn btn-download"
                    >
                      <Download size={16} />
                      Download QR
                    </button>
                    {/*
                    <button 
                      onClick={handleRefreshQR}
                      className="btn btn-refresh"
                      disabled={isGeneratingQR}
                    >
                      <RefreshCw size={16} />
                      Refresh QR
                    </button>
                    */}
                  </div>
                </div>
              ) : (
                <div className="qr-error">
                  <p>Failed to generate QR code</p>
                  <button 
                    onClick={handleRefreshQR}
                    className="btn btn-refresh"
                    disabled={isGeneratingQR}
                  >
                    <RefreshCw size={16} />
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;