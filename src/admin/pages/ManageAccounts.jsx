import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { database } from '../../firebase/config';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Search, 
  QrCode,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Building2,
  Target,
  X,
  CheckCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import AdminLayout from '../components/AdminLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './ManageAccounts.css';

const ManageAccounts = React.memo(() => {
  // Superadmin credentials that should be hidden and protected
  const SUPERADMIN_EMAIL = 'saricycle-admin@gmail.com';
  const SUPERADMIN_USERNAME = 'saricyclesuperadmin';
  
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [barangayUsers, setBarangayUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: '', 
    email: '',
    password: '',
    points: 0,
    usertype: '',
    address: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [showPassword, setShowPassword] = useState({});
  const [showQRPopup, setShowQRPopup] = useState(false);

  // Initialize all passwords as hidden
  useEffect(() => {
    const allUsers = [...users, ...admins, ...barangayUsers];
    const initialPasswordState = {};
    allUsers.forEach(user => {
      initialPasswordState[user.userID] = false;
    });
    setShowPassword(initialPasswordState);
  }, [users, admins, barangayUsers]);

  // Optimized Firebase listeners with proper cleanup
  useEffect(() => {
    let unsubscribeUsers, unsubscribeAdmins, unsubscribeBarangay;
    
    const setupListeners = () => {
      try {
        // Fetch regular users
        const usersRef = ref(database, 'Users');
        unsubscribeUsers = onValue(usersRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const usersList = Object.keys(data).map(userID => ({
              userID,
              category: 'Users',
              ...data[userID]
            }));
            setUsers(usersList);
          } else {
            setUsers([]);
          }
        }, (error) => {
          console.error('Error fetching users:', error);
        });

        // Fetch admin users (filter out superadmin)
        const adminsRef = ref(database, 'Admins');
        unsubscribeAdmins = onValue(adminsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const adminsList = Object.keys(data)
              .filter(userID => {
                // Filter out superadmin from the list
                const admin = data[userID];
                return admin.email !== SUPERADMIN_EMAIL && admin.username !== SUPERADMIN_USERNAME;
              })
              .map(userID => ({
                userID,
                category: 'Admins',
                ...data[userID]
              }));
            setAdmins(adminsList);
          } else {
            setAdmins([]);
          }
        }, (error) => {
          console.error('Error fetching admins:', error);
        });

        // Fetch barangay users
        const barangayRef = ref(database, 'Barangay');
        unsubscribeBarangay = onValue(barangayRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const barangayList = Object.keys(data).map(userID => ({
              userID,
              category: 'Barangay',
              ...data[userID]
            }));
            setBarangayUsers(barangayList);
          } else {
            setBarangayUsers([]);
          }
        }, (error) => {
          console.error('Error fetching barangay users:', error);
        });
      } catch (error) {
        console.error('Error setting up listeners:', error);
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeAdmins) unsubscribeAdmins();
      if (unsubscribeBarangay) unsubscribeBarangay();
    };
  }, []);

  // Get database reference based on usertype
  const getDatabaseRef = (usertype) => {
    switch (usertype.toLowerCase()) {
      case 'admin':
        return 'Admins';
      case 'barangay':
        return 'Barangay';
      default:
        return 'Users';
    }
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'admins':
        return admins;
      case 'barangay':
        return barangayUsers;
      default:
        return users;
    }
  };

  // Check if user is eligible for QR code (only regular users)
  const isQRCodeEligible = (user) => {
    return user.usertype === 'user' || user.category === 'Users';
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

      setQrCodeUrl(qrCodeDataUrl);
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

  // Handle user selection for QR code display
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    
    // Only generate QR code for regular users
    if (!isQRCodeEligible(user)) {
      setQrCodeUrl('');
      return;
    }
    
    // Generate QR code if it doesn't exist or needs updating
    if (!user.qrCode) {
      const qrCodeDataUrl = await generateQRCode(user);
      if (qrCodeDataUrl) {
        await saveQRCodeToFirebase(user.userID, qrCodeDataUrl, user.category);
      }
    } else {
      setQrCodeUrl(user.qrCode);
    }
  };

  // Memoized input handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'points' ? parseInt(value) || 0 : value
    }));
  }, []);

  // Create new user
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.usertype) {
      alert('Username, Email, Password, and User Type are required!');
      return;
    }

    setLoading(true);
    try {
      const category = getDatabaseRef(formData.usertype);
      const usersRef = ref(database, category);
      const newUserRef = await push(usersRef, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        points: formData.points,
        usertype: formData.usertype,
        address: formData.address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Generate QR code only for regular users
      if (formData.usertype === 'user') {
        const newUserData = {
          userID: newUserRef.key,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          points: formData.points,
          usertype: formData.usertype,
          address: formData.address,
          category: category
        };

        const qrCodeDataUrl = await generateQRCode(newUserData);
        if (qrCodeDataUrl) {
          await saveQRCodeToFirebase(newUserRef.key, qrCodeDataUrl, category);
        }
      }
      
      setFormData({ username: '', email: '', password: '', points: 0, usertype: '', address: '' });
      
      if (formData.usertype === 'user') {
        alert(`${formData.usertype} created successfully with QR code!`);
      } else {
        alert(`${formData.usertype} created successfully!`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    } finally {
      setLoading(false);
    }
  };

  // Update existing user
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.usertype) {
      alert('Username, Email, Password, and User Type are required!');
      return;
    }

    setLoading(true);
    try {
      const newCategory = getDatabaseRef(formData.usertype);
      
      // If usertype changed, move to different category
      if (editingCategory !== newCategory) {
        // Remove from old category
        const oldUserRef = ref(database, `${editingCategory}/${editingId}`);
        await remove(oldUserRef);
        
        // Add to new category
        const newUsersRef = ref(database, newCategory);
        const newUserRef = await push(newUsersRef, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          points: formData.points,
          usertype: formData.usertype,
          address: formData.address,
          createdAt: selectedUser?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        // Generate new QR code only for regular users
        if (formData.usertype === 'user') {
          const updatedUserData = {
            userID: newUserRef.key,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            points: formData.points,
            usertype: formData.usertype,
            address: formData.address,
            category: newCategory
          };

          const qrCodeDataUrl = await generateQRCode(updatedUserData);
          if (qrCodeDataUrl) {
            await saveQRCodeToFirebase(newUserRef.key, qrCodeDataUrl, newCategory);
          }
        }
      } else {
        // Update in same category
        const userRef = ref(database, `${editingCategory}/${editingId}`);
        await update(userRef, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          points: formData.points,
          usertype: formData.usertype,
          address: formData.address,
          updatedAt: new Date().toISOString()
        });

        // Regenerate QR code only for regular users
        if (formData.usertype === 'user') {
          const updatedUserData = {
            userID: editingId,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            points: formData.points,
            usertype: formData.usertype,
            address: formData.address,
            category: editingCategory
          };

          const qrCodeDataUrl = await generateQRCode(updatedUserData);
          if (qrCodeDataUrl) {
            await saveQRCodeToFirebase(editingId, qrCodeDataUrl, editingCategory);
          }
        }
      }
      
      setFormData({ username: '', email: '', password: '', points: 0, usertype: '', address: '' });
      setEditingId(null);
      setEditingCategory(null);
      
      if (formData.usertype === 'user') {
        alert('User updated successfully with new QR code!');
      } else {
        alert('User updated successfully!');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is superadmin
  const isSuperAdmin = (user) => {
    return user.email === SUPERADMIN_EMAIL || user.username === SUPERADMIN_USERNAME;
  };

  // Create encrypted display for password (SHA-256 style display)
  const getEncryptedPasswordDisplay = (password) => {
    if (!password) return '********************************';
    // Create a hash-like display (not actual encryption, just for display)
    const hashDisplay = btoa(password).substring(0, 32).replace(/[^a-zA-Z0-9]/g, 'x');
    return hashDisplay.padEnd(32, 'x');
  };

  // Delete user
  const handleDelete = async (userID, category) => {
    // Find the user to check if it's superadmin
    const currentData = getCurrentData();
    const userToDelete = currentData.find(u => u.userID === userID);
    
    if (userToDelete && isSuperAdmin(userToDelete)) {
      alert('Cannot delete superadmin account. This account is protected.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        const userRef = ref(database, `${category}/${userID}`);
        await remove(userRef);
        
        // Clear QR code display if deleted user was selected
        if (selectedUser && selectedUser.userID === userID) {
          setSelectedUser(null);
          setQrCodeUrl('');
        }
        
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      } finally {
        setLoading(false);
      }
    }
  };

  // Edit user (populate form)
  const handleEdit = (user) => {
    // Prevent editing superadmin
    if (isSuperAdmin(user)) {
      alert('Cannot edit superadmin account. This account is protected.');
      return;
    }
    
    setFormData({
      username: user.username,
      email: user.email,
      password: user.password,
      points: user.points || 0,
      usertype: user.usertype || 'user',
      address: user.address || ''
    });
    setEditingId(user.userID);
    setEditingCategory(user.category);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setFormData({ username: '', email: '', password: '', points: 0, usertype: '', address: '' });
    setEditingId(null);
    setEditingCategory(null);
  };

  // Toggle password visibility
  const togglePasswordVisibility = (userID) => {
    setShowPassword(prev => ({
      ...prev,
      [userID]: !prev[userID]
    }));
  };

  // Download QR Code (only for regular users)
  const downloadQRCode = () => {
    if (qrCodeUrl && selectedUser && isQRCodeEligible(selectedUser)) {
      const link = document.createElement('a');
      link.download = `${selectedUser.username}_qrcode.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const handleQRButtonClick = async (user) => {
    await handleUserSelect(user);
    setShowQRPopup(true);
  };

  const handleCloseQRPopup = () => {
    setShowQRPopup(false);
  };

  const handlePopupBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseQRPopup();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCloseQRPopup();
    }
  };

  // Memoized filtered data for better performance
  const filteredData = useMemo(() => {
    const currentData = getCurrentData();
    if (!searchTerm) return currentData;
    
    const searchTermLower = searchTerm.toLowerCase();
    return currentData.filter(user => {
      return (
        (user.username && user.username.toLowerCase().includes(searchTermLower)) ||
        (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
        (user.userID && user.userID.toLowerCase().includes(searchTermLower)) ||
        (user.usertype && user.usertype.toLowerCase().includes(searchTermLower)) ||
        (user.address && user.address.toLowerCase().includes(searchTermLower))
      );
    });
  }, [users, admins, barangayUsers, activeTab, searchTerm]);

  return (
    <AdminLayout>
      <div className="manage-accounts-page">
        <div className="page-header">
          <h1>Manage Accounts</h1>
          <p>Create, update, and delete user accounts with full CRUD operations</p>
        </div>

        <div className="accounts-content">
          <div className="main-content">
            {/* Create/Edit Form */}
            <div className="form-section">
              <div className="section-header">
                {editingId ? <Edit3 size={24} /> : <UserPlus size={24} />}
                <h2>{editingId ? 'Edit User' : 'Create New User'}</h2>
              </div>
              <form onSubmit={editingId ? handleUpdate : handleCreate} className="crud-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="username">Username *</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="usertype">User Type *</label>
                    <select
                      id="usertype"
                      name="usertype"
                      value={formData.usertype}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select User Type</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="barangay">Barangay</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="points">Points</label>
                    <input
                      type="number"
                      id="points"
                      name="points"
                      value={formData.points}
                      onChange={handleInputChange}
                      placeholder="Enter points"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {editingId ? <Edit3 size={18} /> : <UserPlus size={18} />}
                    {loading ? 'Processing...' : (editingId ? 'Update User' : 'Create User')}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      <X size={18} />
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-section">
              <div className="tabs-header">
                <button 
                  className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <Target size={18} />
                  Users ({users.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admins')}
                >
                  <Shield size={18} />
                  Admins ({admins.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'barangay' ? 'active' : ''}`}
                  onClick={() => setActiveTab('barangay')}
                >
                  <Building2 size={18} />
                  Barangay ({barangayUsers.length})
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="table-section">
              <div className="table-header">
                <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({filteredData.length})</h2>
                <div className="search-box">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              {loading ? (
                <LoadingSkeleton type="table" rows={5} />
              ) : filteredData.length === 0 ? (
                <div className="no-data">
                  <p>No users found. {searchTerm ? 'Try adjusting your search.' : 'Create your first user above!'}</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>User Type</th>
                        <th>Address</th>
                        <th>Points</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(user => (
                        <tr 
                          key={user.userID} 
                          className={`${editingId === user.userID ? 'editing' : ''} ${selectedUser?.userID === user.userID ? 'selected' : ''}`}
                        >
                          <td className="user-id-cell">
                            <span title={user.userID}>
                              {user.userID.length > 8 
                                ? `${user.userID.substring(0, 8)}...` 
                                : user.userID
                              }
                            </span>
                          </td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td className="password-cell">
                            <div className="password-container">
                              <span className={showPassword[user.userID] ? "password-visible" : "password-hidden"}>
                                {showPassword[user.userID] 
                                  ? getEncryptedPasswordDisplay(user.password)
                                  : '•'.repeat(user.password ? user.password.length : 8)
                                }
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(user.userID)}
                                className="password-toggle"
                                title={showPassword[user.userID] ? "Hide password" : "Show encrypted password"}
                              >
                                {showPassword[user.userID] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className={`usertype-badge ${user.usertype || 'user'}`}>
                              {user.usertype || 'User'}
                            </span>
                          </td>
                          <td className="address-cell">
                            {user.address ? (
                              <span title={user.address}>
                                {user.address.length > 30 
                                  ? `${user.address.substring(0, 30)}...` 
                                  : user.address
                                }
                              </span>
                            ) : (
                              <span className="no-address">No address</span>
                            )}
                          </td>
                          <td>
                            <span className={`points-badge ${user.points >= 100 ? 'high' : user.points >= 50 ? 'medium' : 'low'}`}>
                              {user.points || 0}
                            </span>
                          </td>
                          <td>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </td>
                          <td className="actions-cell">
                            {/* Only show QR button for regular users */}
                            {isQRCodeEligible(user) && (
                              <button
                                onClick={() => handleQRButtonClick(user)}
                                className="btn btn-qr"
                                title="Show QR Code"
                              >
                                <QrCode size={14} />
                                <span>QR</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(user)}
                              className="btn btn-edit"
                              title="Edit user"
                            >
                              <Edit3 size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(user.userID, user.category)}
                              className="btn btn-delete"
                              title="Delete user"
                              disabled={loading}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* QR Code Popup */}
      {showQRPopup && (
        <div 
          className="qr-popup-overlay"
          onClick={handlePopupBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className="qr-popup-modal">
            <div className="qr-popup-header">
              <div className="qr-popup-title">
                <QrCode size={24} />
                <h3>QR Code Details</h3>
              </div>
              <button 
                onClick={handleCloseQRPopup}
                className="qr-popup-close"
                aria-label="Close QR code popup"
              >
                <X size={20} />
              </button>
            </div>
            
            {selectedUser ? (
              <div className="qr-popup-content">
                <div className="user-info">
                  <h4>{selectedUser.username}</h4>
                  <p>{selectedUser.email}</p>
                  <span className={`usertype-display ${selectedUser.usertype || 'user'}`}>
                    {selectedUser.usertype || 'User'}
                  </span>
                  <span className="points-display">Points: {selectedUser.points || 0}</span>
                  {selectedUser.address && (
                    <p className="address-display">{selectedUser.address}</p>
                  )}
                </div>
                
                {/* Only show QR code for regular users */}
                {isQRCodeEligible(selectedUser) ? (
                  qrCodeUrl ? (
                    <div className="qr-display">
                      <img 
                        src={qrCodeUrl} 
                        alt="User QR Code" 
                        className="qr-image"
                      />
                      <div className="qr-actions">
                        <button 
                          onClick={downloadQRCode}
                          className="btn btn-download"
                        >
                          <Download size={16} />
                          Download QR
                        </button>
                        <button 
                          onClick={() => handleUserSelect(selectedUser)}
                          className="btn btn-refresh"
                        >
                          <RefreshCw size={16} />
                          Refresh QR
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="qr-loading">
                      <p>Generating QR code...</p>
                    </div>
                  )
                ) : (
                  <div className="qr-restricted">
                    <X size={48} className="restricted-icon" />
                    <p>QR Code Not Available</p>
                    <small>QR codes are only generated for regular users</small>
                  </div>
                )}
              </div>
            ) : (
              <div className="qr-placeholder">
                <QrCode size={64} className="placeholder-icon" />
                <p>Select a user to view their QR code</p>
                <small>QR codes are only available for regular users</small>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
});

export default ManageAccounts; 