import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { 
  Users, 
  Target, 
  Trophy, 
  BarChart3, 
  Eye, 
  Building2,
  TrendingUp,
  Award,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import BarangayLayout from '../components/BarangayLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './BarangayDashboard.css';

const BarangayDashboard = React.memo(() => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [barangayUsers, setBarangayUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View-only Firebase listeners for barangay officials (limited access)
  useEffect(() => {
    let unsubscribeUsers;
    
    const setupListeners = () => {
      try {
        // Fetch only regular users (no admin data access for barangay)
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
        }, (error) => {
          console.error('Error fetching users:', error);
          setError('Failed to load users');
        });

        setLoading(false);
      } catch (error) {
        console.error('Error setting up listeners:', error);
        setError('Failed to connect to database');
        setLoading(false);
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  // Limited analytics calculations for barangay view (users only)
  const analytics = useMemo(() => {
    const totalUsers = users.length;
    const totalPoints = users.reduce((total, user) => total + (user.points || 0), 0);
    const averagePoints = users.length === 0 ? 0 : Math.round(totalPoints / users.length);
    
    const topUsers = users
      .filter(user => user.points > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 5);
    
    const recentUsers = users
      .filter(user => user.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    const pointsDistribution = {
      '0-50': users.filter(user => (user.points || 0) <= 50).length,
      '51-100': users.filter(user => (user.points || 0) > 50 && (user.points || 0) <= 100).length,
      '101-200': users.filter(user => (user.points || 0) > 100 && (user.points || 0) <= 200).length,
      '200+': users.filter(user => (user.points || 0) > 200).length,
    };

    const activeUsers = users.filter(user => user.points > 0).length;
    
    return {
      totalUsers,
      totalPoints,
      averagePoints,
      topUsers,
      recentUsers,
      pointsDistribution,
      activeUsers
    };
  }, [users]);

  // Error handling component
  if (error) {
    return (
      <BarangayLayout>
        <div className="error-container">
          <div className="error-message">
            <AlertCircle size={48} className="error-icon" />
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </BarangayLayout>
    );
  }

  if (loading) {
    return (
      <BarangayLayout>
        <div className="dashboard-page">
          <div className="dashboard-header">
            <h1>Barangay Dashboard</h1>
            <p>View-only overview of community users and recycling activities</p>
          </div>
          <LoadingSkeleton type="stats" />
          <div className="analytics-grid">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
        </div>
      </BarangayLayout>
    );
  }

  const { totalUsers, totalPoints, averagePoints, topUsers, recentUsers, pointsDistribution, activeUsers } = analytics;

  return (
    <BarangayLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Barangay Dashboard</h1>
          <p>View-only overview of community users and recycling activities</p>
        </div>

        {/* Statistics Cards - Limited view for barangay */}
        <div className="stats-grid">
          <div className="stat-card total-users">
            <div className="stat-icon">
              <Users size={28} />
            </div>
            <div className="stat-content">
              <h3>Community Users</h3>
              <p className="stat-number">{totalUsers}</p>
              <small>Registered users</small>
            </div>
          </div>

          <div className="stat-card active-users">
            <div className="stat-icon">
              <Target size={28} />
            </div>
            <div className="stat-content">
              <h3>Active Users</h3>
              <p className="stat-number">{activeUsers}</p>
              <small>Users with points</small>
            </div>
          </div>

          <div className="stat-card total-points">
            <div className="stat-icon">
              <Trophy size={28} />
            </div>
            <div className="stat-content">
              <h3>Total Points</h3>
              <p className="stat-number">{totalPoints.toLocaleString()}</p>
              <small>Community total</small>
            </div>
          </div>

          <div className="stat-card average-points">
            <div className="stat-icon">
              <BarChart3 size={28} />
            </div>
            <div className="stat-content">
              <h3>Average Points</h3>
              <p className="stat-number">{averagePoints}</p>
              <small>Per active user</small>
            </div>
          </div>

          <div className="stat-card view-only">
            <div className="stat-icon">
              <Eye size={28} />
            </div>
            <div className="stat-content">
              <h3>Access Level</h3>
              <p className="stat-number">View Only</p>
              <small>Barangay official</small>
            </div>
          </div>

          <div className="stat-card community">
            <div className="stat-icon">
              <Building2 size={28} />
            </div>
            <div className="stat-content">
              <h3>Community</h3>
              <p className="stat-number">Active</p>
              <small>Recycling program</small>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="analytics-grid">
          {/* Points Distribution */}
          <div className="analytics-card">
            <div className="card-header">
              <TrendingUp size={24} />
              <h3>Points Distribution</h3>
            </div>
            <div className="points-distribution">
              {Object.entries(pointsDistribution).map(([range, count]) => (
                <div key={range} className="distribution-item">
                  <div className="distribution-label">{range} points</div>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill" 
                      style={{ 
                        width: users.length > 0 ? `${(count / users.length) * 100}%` : '0%' 
                      }}
                    ></div>
                  </div>
                  <div className="distribution-count">{count} users</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users */}
          <div className="analytics-card">
            <div className="card-header">
              <Award size={24} />
              <h3>Top Users by Points</h3>
            </div>
            {topUsers.length > 0 ? (
              <div className="top-users-list">
                {topUsers.map((user, index) => (
                  <div key={user.userID} className="top-user-item">
                    <div className="user-rank">#{index + 1}</div>
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    <div className="user-points">{user.points || 0} pts</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <Trophy size={48} className="no-data-icon" />
                <p>No users with points yet</p>
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="analytics-card">
            <div className="card-header">
              <Clock size={24} />
              <h3>Recent Users</h3>
            </div>
            {recentUsers.length > 0 ? (
              <div className="recent-users-list">
                {recentUsers.map((user) => (
                  <div key={user.userID} className="recent-user-item">
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-type">
                        <span className={`type-badge ${user.usertype || 'user'}`}>
                          {user.usertype || 'user'}
                        </span>
                      </div>
                    </div>
                    <div className="user-date">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <Users size={48} className="no-data-icon" />
                <p>No recent users</p>
              </div>
            )}
          </div>
          {/* Access Level Disclaimer */}
          <div className="analytics-card disclaimer-card">
            <div className="card-header">
              <Eye size={24} />
              <h3>Access Notice</h3>
            </div>
            <div className="disclaimer-content">
              <p>This dashboard provides view-only access to community recycling data.</p>
              <p>As a barangay official, you can monitor user activities and participation but cannot make administrative changes.</p>
              <small>For administrative functions, please contact the system administrator.</small>
            </div>
          </div>
        </div>
      </div>
    </BarangayLayout>
  );
});

export default BarangayDashboard; 