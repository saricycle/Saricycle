import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { 
  Users, 
  Target, 
  Trophy, 
  BarChart3, 
  Settings, 
  Building2,
  TrendingUp,
  Award,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './Dashboard.css';

const Dashboard = React.memo(() => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [barangayUsers, setBarangayUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Fetch admin users
        const adminsRef = ref(database, 'Admins');
        unsubscribeAdmins = onValue(adminsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const adminsList = Object.keys(data).map(userID => ({
              userID,
              ...data[userID]
            }));
            setAdmins(adminsList);
          } else {
            setAdmins([]);
          }
        }, (error) => {
          console.error('Error fetching admins:', error);
          setError('Failed to load admins');
        });

        // Fetch barangay users
        const barangayRef = ref(database, 'Barangay');
        unsubscribeBarangay = onValue(barangayRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const barangayList = Object.keys(data).map(userID => ({
              userID,
              ...data[userID]
            }));
            setBarangayUsers(barangayList);
          } else {
            setBarangayUsers([]);
          }
        }, (error) => {
          console.error('Error fetching barangay users:', error);
          setError('Failed to load barangay users');
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
      if (unsubscribeAdmins) unsubscribeAdmins();
      if (unsubscribeBarangay) unsubscribeBarangay();
    };
  }, []);

  // Memoized analytics calculations for better performance
  const analytics = useMemo(() => {
    const totalUsers = users.length + admins.length + barangayUsers.length;
    const totalPoints = users.reduce((total, user) => total + (user.points || 0), 0);
    const averagePoints = users.length === 0 ? 0 : Math.round(totalPoints / users.length);
    
    const topUsers = users
      .filter(user => user.points > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 5);
    
    const allUsers = [...users, ...admins, ...barangayUsers];
    const recentUsers = allUsers
      .filter(user => user.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    const pointsDistribution = {
      '0-50': users.filter(user => (user.points || 0) <= 50).length,
      '51-100': users.filter(user => (user.points || 0) > 50 && (user.points || 0) <= 100).length,
      '101-200': users.filter(user => (user.points || 0) > 100 && (user.points || 0) <= 200).length,
      '200+': users.filter(user => (user.points || 0) > 200).length,
    };
    
    return {
      totalUsers,
      totalPoints,
      averagePoints,
      topUsers,
      recentUsers,
      pointsDistribution
    };
  }, [users, admins, barangayUsers]);

  // Error handling component
  if (error) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-page">
          <div className="dashboard-header">
            <h1>Analytics Dashboard</h1>
            <p>Overview of current users and system statistics</p>
          </div>
          <LoadingSkeleton type="stats" />
          <div className="analytics-grid">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { totalUsers, totalPoints, averagePoints, topUsers, recentUsers, pointsDistribution } = analytics;

  return (
    <AdminLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Analytics Dashboard</h1>
          <p>Overview of current users and system statistics</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card total-users">
            <div className="stat-icon">
              <Users size={28} />
            </div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-number">{totalUsers}</p>
              <small>All user types</small>
            </div>
          </div>

          <div className="stat-card regular-users">
            <div className="stat-icon">
              <Target size={28} />
            </div>
            <div className="stat-content">
              <h3>Regular Users</h3>
              <p className="stat-number">{users.length}</p>
              <small>Active users</small>
            </div>
          </div>

          <div className="stat-card total-points">
            <div className="stat-icon">
              <Trophy size={28} />
            </div>
            <div className="stat-content">
              <h3>Total Points</h3>
              <p className="stat-number">{totalPoints.toLocaleString()}</p>
              <small>All users combined</small>
            </div>
          </div>

          <div className="stat-card average-points">
            <div className="stat-icon">
              <BarChart3 size={28} />
            </div>
            <div className="stat-content">
              <h3>Average Points</h3>
              <p className="stat-number">{averagePoints}</p>
              <small>Per user</small>
            </div>
          </div>

          <div className="stat-card admins">
            <div className="stat-icon">
              <Settings size={28} />
            </div>
            <div className="stat-content">
              <h3>Admins</h3>
              <p className="stat-number">{admins.length}</p>
              <small>System administrators</small>
            </div>
          </div>

          <div className="stat-card barangay">
            <div className="stat-icon">
              <Building2 size={28} />
            </div>
            <div className="stat-content">
              <h3>Barangay Users</h3>
              <p className="stat-number">{barangayUsers.length}</p>
              <small>Barangay officials</small>
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
        </div>
      </div>
    </AdminLayout>
  );
});

export default Dashboard; 