import React, { useState, useEffect, useMemo } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { 
  Users, 
  Search, 
  Eye,
  Building2,
  Trophy,
  Target,
  Clock,
  AlertCircle
} from 'lucide-react';
import BarangayLayout from '../components/BarangayLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './ViewUsers.css';

const ViewUsers = React.memo(() => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // View-only Firebase listener for regular users
  useEffect(() => {
    let unsubscribeUsers;
    
    const setupListeners = () => {
      try {
        const usersRef = ref(database, 'Users');
        unsubscribeUsers = onValue(usersRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const usersList = Object.keys(data).map(userID => ({
              userID,
              ...data[userID]
            }));
            setUsers(usersList);
          } else {
            setUsers([]);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching users:', error);
          setError('Failed to load users');
          setLoading(false);
        });
      } catch (error) {
        console.error('Error setting up listeners:', error);
        setError('Failed to connect to database');
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user => 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (error) {
    return (
      <BarangayLayout>
        <div className="error-container">
          <div className="error-message">
            <AlertCircle size={48} className="error-icon" />
            <h3>Error Loading Users</h3>
            <p>{error}</p>
          </div>
        </div>
      </BarangayLayout>
    );
  }

  if (loading) {
    return (
      <BarangayLayout>
        <div className="manage-accounts-page">
          <div className="page-header">
            <h1>View Community Users</h1>
            <p>Monitor community members and their recycling activities</p>
          </div>
          <LoadingSkeleton type="table" />
        </div>
      </BarangayLayout>
    );
  }

  return (
    <BarangayLayout>
      <div className="manage-accounts-page">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>View Community Users</h1>
              <p>Monitor community members and their recycling activities</p>
            </div>
            <div className="header-actions">
              <div className="view-only-badge">
                <Eye size={16} />
                <span>View Only</span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <div className="section-title">
              <Users size={24} />
              <h2>Community Users ({filteredUsers.length})</h2>
            </div>
            <div className="section-actions">
              <div className="search-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <Users size={64} className="empty-icon" />
              <h3>No Users Found</h3>
              <p>No community users match your search criteria.</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Points</th>
                    <th>Address</th>
                    <th>Registration Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.userID} className="user-row">
                      <td className="username-cell">
                        <div className="user-info">
                          <span className="username">{user.username || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="email-cell">{user.email || 'N/A'}</td>
                      <td className="points-cell">
                        <div className="points-badge">
                          <Trophy size={16} />
                          <span>{user.points || 0}</span>
                        </div>
                      </td>
                      <td className="address-cell">{user.address || 'N/A'}</td>
                      <td className="date-cell">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge ${user.points > 0 ? 'active' : 'inactive'}`}>
                          {user.points > 0 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Access Notice */}
        <div className="access-notice">
          <div className="notice-content">
            <Eye size={20} />
            <div className="notice-text">
              <strong>View-Only Access:</strong> As a barangay official, you can view user information but cannot make changes. Contact the system administrator for account modifications.
            </div>
          </div>
        </div>
      </div>
    </BarangayLayout>
  );
});

ViewUsers.displayName = 'ViewUsers';

export default ViewUsers;