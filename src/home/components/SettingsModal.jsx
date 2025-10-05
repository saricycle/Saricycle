import React, { useState, useEffect } from 'react';
import { User, Lock, MapPin, Save, Eye, EyeOff, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [activeTab, setActiveTab] = useState('profile');

  // Initialize form data with user information
  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        address: user.address || ''
      }));
    }
  }, [user, isOpen]);

  // Reset form when modal closes and manage body scroll
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
      setFormData({
        username: '',
        email: '',
        address: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setActiveTab('profile');
      setNotification({ show: false, type: '', message: '' });
    }

    // Cleanup function to restore body scroll
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      showNotification('error', 'Username is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const updateData = {
        username: formData.username.trim(),
        address: formData.address.trim()
      };

      const result = await updateUserProfile(updateData);
      
      if (result.success) {
        showNotification('success', 'Profile updated successfully!');
      } else {
        showNotification('error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      showNotification('error', 'All password fields are required');
      return;
    }

    if (formData.currentPassword !== user.password) {
      showNotification('error', 'Current password is incorrect');
      return;
    }

    if (formData.newPassword.length < 6) {
      showNotification('error', 'New password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('error', 'New passwords do not match');
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      showNotification('error', 'New password must be different from current password');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await updateUserProfile({ password: formData.newPassword });
      
      if (result.success) {
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        showNotification('success', 'Password updated successfully!');
      } else {
        showNotification('error', result.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showNotification('error', 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={handleOverlayClick}>
      <div className="settings-modal">
        {/* Notification */}
        {notification.show && (
          <div className={`settings-notification ${notification.type}`}>
            <div className="notification-content">
              {notification.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="settings-modal-header">
          <h2 className="text-white">Settings</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tab-navigation">
          <button
            className={`modal-tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          <button
            className={`modal-tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={18} />
            <span>Security</span>
          </button>
        </div>

        {/* Content */}
        <div className="settings-modal-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="modal-tab-content">
              <div className="modal-card-header">
                <h3>Profile Information</h3>
                <p>Update your personal information and address</p>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="modal-settings-form">
                <div className="modal-form-group">
                  <label htmlFor="modal-username">
                    <User size={18} />
                    Username
                  </label>
                  <input
                    type="text"
                    id="modal-username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="modal-form-group">
                  <label htmlFor="modal-email">
                    <User size={18} />
                    Email (Read-only)
                  </label>
                  <input
                    type="email"
                    id="modal-email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="readonly-input"
                  />
                  <small className="form-hint">Email cannot be changed</small>
                </div>

                <div className="modal-form-group">
                  <label htmlFor="modal-address">
                    <MapPin size={18} />
                    Address
                  </label>
                  <textarea
                    id="modal-address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    rows="3"
                    disabled={isLoading}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="modal-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Profile
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="modal-tab-content">
              <div className="modal-card-header">
                <h3>Change Password</h3>
                <p>Update your password to keep your account secure</p>
              </div>
              
              <form onSubmit={handlePasswordUpdate} className="modal-settings-form">
                <div className="modal-form-group">
                  <label htmlFor="modal-currentPassword">
                    <Lock size={18} />
                    Current Password
                  </label>
                  <div className="password-input-group">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="modal-currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter your current password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="modal-form-group">
                  <label htmlFor="modal-newPassword">
                    <Lock size={18} />
                    New Password
                  </label>
                  <div className="password-input-group">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="modal-newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter your new password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <small className="form-hint">Must be at least 6 characters long</small>
                </div>

                <div className="modal-form-group">
                  <label htmlFor="modal-confirmPassword">
                    <Lock size={18} />
                    Confirm New Password
                  </label>
                  <div className="password-input-group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="modal-confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your new password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="modal-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;