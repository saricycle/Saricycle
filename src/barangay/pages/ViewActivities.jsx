import React, { useState, useEffect, useMemo } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { 
  Activity, 
  Search, 
  Eye,
  Calendar,
  Trophy,
  Target,
  Clock,
  AlertCircle,
  User,
  Award
} from 'lucide-react';
import BarangayLayout from '../components/BarangayLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './ViewActivities.css';

const ViewActivities = React.memo(() => {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // View-only Firebase listeners for activities and users
  useEffect(() => {
    let unsubscribeActivities, unsubscribeUsers;
    
    const setupListeners = () => {
      try {
        // Fetch activities (assuming they exist in Firebase)
        const activitiesRef = ref(database, 'Activities');
        unsubscribeActivities = onValue(activitiesRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const activitiesList = Object.keys(data).map(activityID => ({
              activityID,
              ...data[activityID]
            }));
            setActivities(activitiesList);
          } else {
            setActivities([]);
          }
        }, (error) => {
          console.error('Error fetching activities:', error);
          // Don't set error for activities since they might not exist yet
          setActivities([]);
        });

        // Fetch users to match with activities
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
          setError('Failed to load user data');
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
      if (unsubscribeActivities) unsubscribeActivities();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  // Create mock recent activities from user data for demonstration
  const mockActivities = useMemo(() => {
    return users
      .filter(user => user.points > 0)
      .map(user => ({
        activityID: `activity_${user.userID}`,
        userID: user.userID,
        username: user.username,
        type: 'recycling',
        description: `Recycling activity - earned ${user.points} points`,
        points: user.points,
        date: user.createdAt || new Date().toISOString(),
        status: 'completed'
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [users]);

  // Use real activities if available, otherwise use mock data
  const displayActivities = activities.length > 0 ? activities : mockActivities;

  // Filter activities based on search term
  const filteredActivities = useMemo(() => {
    if (!searchTerm) return displayActivities;
    return displayActivities.filter(activity => 
      activity.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayActivities, searchTerm]);

  if (error) {
    return (
      <BarangayLayout>
        <div className="error-container">
          <div className="error-message">
            <AlertCircle size={48} className="error-icon" />
            <h3>Error Loading Activities</h3>
            <p>{error}</p>
          </div>
        </div>
      </BarangayLayout>
    );
  }

  if (loading) {
    return (
      <BarangayLayout>
        <div className="activities-page">
          <div className="page-header">
            <h1>View Community Activities</h1>
            <p>Monitor recycling activities and user participation</p>
          </div>
          <LoadingSkeleton type="table" />
        </div>
      </BarangayLayout>
    );
  }

  return (
    <BarangayLayout>
      <div className="activities-page">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>View Community Activities</h1>
              <p>Monitor recycling activities and user participation</p>
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
              <Activity size={24} />
              <h2>Recent Activities ({filteredActivities.length})</h2>
            </div>
            <div className="section-actions">
              <div className="search-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="empty-state">
              <Activity size={64} className="empty-icon" />
              <h3>No Activities Found</h3>
              <p>No community activities match your search criteria or no activities have been recorded yet.</p>
            </div>
          ) : (
            <div className="activities-table-container">
              <table className="activities-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Activity Type</th>
                    <th>Description</th>
                    <th>Points Earned</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((activity) => (
                    <tr key={activity.activityID} className="activity-row">
                      <td className="user-cell">
                        <div className="user-info">
                          <User size={16} className="user-icon" />
                          <span className="username">{activity.username || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="type-cell">
                        <span className={`type-badge ${activity.type || 'general'}`}>
                          {activity.type || 'General'}
                        </span>
                      </td>
                      <td className="description-cell">{activity.description || 'No description'}</td>
                      <td className="points-cell">
                        <div className="points-badge">
                          <Trophy size={16} />
                          <span>+{activity.points || 0}</span>
                        </div>
                      </td>
                      <td className="date-cell">
                        <div className="date-info">
                          <Calendar size={16} />
                          <span>{activity.date ? new Date(activity.date).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge ${activity.status || 'completed'}`}>
                          {activity.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="activities-summary">
          <div className="summary-card">
            <Award size={24} />
            <div className="summary-content">
              <h3>Total Activities</h3>
              <p className="summary-number">{displayActivities.length}</p>
            </div>
          </div>
          <div className="summary-card">
            <Trophy size={24} />
            <div className="summary-content">
              <h3>Points Distributed</h3>
              <p className="summary-number">
                {displayActivities.reduce((total, activity) => total + (activity.points || 0), 0)}
              </p>
            </div>
          </div>
          <div className="summary-card">
            <Target size={24} />
            <div className="summary-content">
              <h3>Active Users</h3>
              <p className="summary-number">
                {new Set(displayActivities.map(activity => activity.userID)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Access Notice */}
        <div className="access-notice">
          <div className="notice-content">
            <Eye size={20} />
            <div className="notice-text">
              <strong>View-Only Access:</strong> As a barangay official, you can monitor community activities but cannot modify or approve them. Contact the system administrator for activity management.
            </div>
          </div>
        </div>
      </div>
    </BarangayLayout>
  );
});

ViewActivities.displayName = 'ViewActivities';

export default ViewActivities;