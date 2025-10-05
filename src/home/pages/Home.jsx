import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { addSampleActivities, addQuickTestActivity } from '../../utils/sampleData';
import { addTestActivitiesForUser, addQuickTestForUser } from '../../utils/testUserActivities';
import { 
  Award, 
  Recycle, 
  BookOpen, 
  BarChart3,
  Gift,
  Star,
  MapPin,
  User2,
  Clock,
  Loader2,
  Wallet,
  X,
  Receipt
} from 'lucide-react';
import { HomeNavbar, HomeFooter } from '../components';
import '../css/Home.css';

// Constants - Easy to maintain and edit
const NAVIGATION_ITEMS = [
  {
    label: 'Digital Wallet',
    path: '/home/digital-wallet',
    icon: Wallet,
    description: 'Manage your rewards and transactions'
  },
  {
    label: 'Redeem Rewards',
    path: '/home/redeem-rewards',
    icon: Gift,
    description: 'Exchange points for amazing rewards'
  },
  {
    label: 'Learn Recycling',
    path: '/home/learn-recycling',
    icon: BookOpen,
    description: 'Discover recycling tips and guides'
  },
  {
    label: 'About',
    path: '/home/about',
    icon: Star,
    description: 'Learn more about SariCycle'
  }
];

// Activity type configurations
const ACTIVITY_TYPES = {
  recycling: {
    icon: Recycle,
    color: 'secondary',
    prefix: '+'
  },
  redemption: {
    icon: Gift,
    color: 'accent',
    prefix: '-'
  },
  learning: {
    icon: BookOpen,
    color: 'accent',
    prefix: '+'
  },
  bonus: {
    icon: Star,
    color: 'primary',
    prefix: '+'
  }
};

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Fetch user's activities from Firebase
  useEffect(() => {
    if (!user?.userID) {
      setActivitiesLoading(false);
      setRecentActivities([]);
      setAllActivities([]);
      return;
    }

    setActivitiesLoading(true);

    // Activities are now under: Users/userID/activities
    const userActivitiesRef = ref(database, `Users/${user.userID}/activities`);
    
    const unsubscribe = onValue(userActivitiesRef, (snapshot) => {      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        const activitiesList = Object.keys(data)
          .map(activityID => ({
            activityID,
            ...data[activityID],
            timestamp: new Date(data[activityID].timestamp)
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
        
        // Store all activities for statistics
        setAllActivities(activitiesList);
        
        // Store only recent 5 activities for display
        setRecentActivities(activitiesList.slice(0, 5));
      } else {
        setAllActivities([]);
        setRecentActivities([]);
      }
      setActivitiesLoading(false);
    }, (error) => {
      setActivitiesLoading(false);
      setAllActivities([]);
      setRecentActivities([]);
    });

    return () => unsubscribe();
  }, [user?.userID]);

  // Calculate real statistics from user activities
  const calculatedStats = useMemo(() => {
    const recycledCount = allActivities.filter(activity => activity.type === 'recycling').length;
    const rewardsCount = allActivities.filter(activity => activity.type === 'redemption').length;
    
    // Calculate impact score based on total points and activity frequency
    const totalPoints = user?.points || 0;
    const totalActivities = allActivities.length;
    const impactScore = totalActivities > 0 ? Math.min(100, Math.round((totalPoints / 100) + (totalActivities * 5))) : 0;
    
    return [
      {
        key: 'recycled',
        title: 'Items Recycled',
        value: recycledCount.toString(),
        icon: Recycle,
        color: 'secondary'
      },
      {
        key: 'rewards',
        title: 'Rewards Earned',
        value: rewardsCount.toString(),
        icon: Gift,
        color: 'accent'
      },
      {
        key: 'impact',
        title: 'Impact Score',
        value: `${impactScore}%`,
        icon: BarChart3,
        color: 'primary'
      }
    ];
  }, [allActivities, user?.points]);

  // Memoized computed values for performance
  const userStats = useMemo(() => {
    const pointsStats = {
      key: 'points',
      title: 'Total Points',
      value: user?.points || 0,
      icon: Award,
      color: 'primary'
    };
    return [pointsStats, ...calculatedStats];
  }, [user?.points, calculatedStats]);

  const userInfo = useMemo(() => ({
    username: user?.username || 'Guest',
    address: user?.address || 'No address provided',
    points: user?.points || 0
  }), [user]);

  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return timestamp.toLocaleDateString();
  };

  // Event handlers
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowReceiptModal(true);
  };

  const handleCloseModal = () => {
    setShowReceiptModal(false);
    setTimeout(() => setSelectedActivity(null), 300);
  };

  // Development helper function
  const handleAddSampleData = async () => {
    if (!user?.userID) {
      alert('User not logged in!');
      return;
    }

    const confirmation = window.confirm('Add sample activity data for testing? This will add several test activities to your account.');
    if (confirmation) {
      const success = await addSampleActivities(user.userID);
      if (success) {
        alert('Sample activities added! Check your recent activity section.');
      } else {
        alert('Failed to add sample activities. Check console for errors.');
      }
    }
  };

  const handleAddQuickTest = async () => {
    if (!user?.userID) {
      alert('User not logged in!');
      return;
    }

    const success = await addQuickTestActivity(user.userID);
    if (success) {
      alert('Test activity added!');
    } else {
      alert('Failed to add test activity. Check console for errors.');
    }
  };

  // Sub-components for better organization
  const WelcomeSection = () => (
    <section className="welcome-section">
      <div className="welcome-content">
        <h2 className="welcome-title">
          Welcome back, <span className="highlight">{userInfo.username}</span>!
        </h2>
        <p className="welcome-subtitle">
          Ready to make a positive impact on the environment today?
        </p>
        <div className="location-info">
          <MapPin className="location-icon" />
          <span>{userInfo.address}</span>
        </div>
      </div>
      <div className="welcome-image">
        <div className="recycling-illustration">
          <User2 className="illustration-icon" />
        </div>
      </div>
    </section>
  );  

  const StatsSection = () => (
    <section className="stats-section">
      <h3 className="section-title">Your Impact Dashboard</h3>
      <div className="stats-grid">
        {userStats.map((stat) => (
          <StatCard key={stat.key} stat={stat} />
        ))}
      </div>
    </section>
  );

  const StatCard = ({ stat }) => (
    <div className={`stat-card stat-${stat.color}`} role="button" tabIndex={0}>
      <div className="stat-icon-container2">
        <stat.icon className="stat-icon2" aria-hidden="true" />
      </div>
      <div className="stat-content">
        <h4 className="stat-value">{stat.value}</h4>
        <p className="stat-title">{stat.title}</p>
      </div>
    </div>
  );

  const QuickActionsSection = () => (
    <section className="actions-section">
      <h3 className="section-title">Quick Actions</h3>
      <div className="actions-grid">
        {NAVIGATION_ITEMS.map((item) => (
          <ActionCard key={item.path} item={item} onClick={handleNavigation} />
        ))}
      </div>
    </section>
  );

  const ActionCard = ({ item, onClick }) => (
    <button
      onClick={() => onClick(item.path)}
      className="action-card"
      aria-label={`Navigate to ${item.label}`}
      tabIndex={0}
    >
      <div className="action-icon-container">
        <item.icon className="action-icon" aria-hidden="true" />
      </div>
      <h4 className="action-title">{item.label}</h4>
      <p className="action-description">{item.description}</p>
    </button>
  );

  const RecentActivitySection = () => (
    <section className="activity-section">
      <h3 className="section-title">Recent Activity</h3>
      <div className="activity-list">
        {activitiesLoading ? (
          <ActivityLoadingState />
        ) : recentActivities.length === 0 ? (
          <NoActivityMessage />
        ) : (
          recentActivities.map((activity) => (
            <ActivityItem key={activity.activityID} activity={activity} />
          ))
        )}
      </div>
    </section>
  );

  const ActivityLoadingState = () => (
    <div className="activity-loading">
      <Loader2 className="loading-spinner" />
      <p>Loading your recent activities...</p>
    </div>
  );

  const NoActivityMessage = () => (
    <div className="no-activity">
      <Clock className="no-activity-icon" />
      <h4>No Recent Activity</h4>
      <p>Start recycling or redeeming rewards to see your activity here!</p>
      <div className="activity-suggestions">
        <button 
          onClick={() => handleNavigation('/home/redeem-rewards')}
          className="suggestion-button"
        >
          Explore Rewards
        </button>
        <button 
          onClick={() => handleNavigation('/home/learn-recycling')}
          className="suggestion-button"
        >
          Learn Recycling
        </button>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const activityConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.recycling;
    const IconComponent = activityConfig.icon;
    const isRedemption = activity.type === 'redemption';

    return (
      <div 
        className={`activity-item ${isRedemption ? 'clickable' : ''}`}
        onClick={isRedemption ? () => handleActivityClick(activity) : undefined}
        role={isRedemption ? "button" : undefined}
        tabIndex={isRedemption ? 0 : undefined}
        onKeyDown={isRedemption ? (e) => e.key === 'Enter' && handleActivityClick(activity) : undefined}
      >
        <div className={`activity-icon ${activityConfig.color}`}>
          <IconComponent />
        </div>
        <div className="activity-content">
          <h4>{activity.title}</h4>
          <p className="activity-description">
            {activity.description}
            {activity.pointsEarned && (
              <span className={`points-badge ${activity.pointsEarned > 0 ? 'positive' : 'negative'}`}>
                {activityConfig.prefix}{Math.abs(activity.pointsEarned)} points
              </span>
            )}
          </p>
          <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
        </div>
        {activity.category && isRedemption && (
          <div className="activity-category">
            <span className={`category-badge ${activity.type}`}>
              {activity.category}
            </span>
            <Receipt className="receipt-icon" size={16} />
          </div>
        )}
      </div>
    );
  };

  // Development Tools Section (only shows in development)
  const DevelopmentToolsSection = () => {
    // Only show in development environment
    if (process.env.NODE_ENV !== 'development') return null;

    const handleAddSpecificUserTest = async () => {
      const success = await addQuickTestForUser();
      if (success) {
        alert('Test activity added for your specific user!');
      } else {
        alert('Failed to add test activity. Check console for errors.');
      }
    };

    const handleAddSpecificUserData = async () => {
      const confirmation = window.confirm('Add sample activities for your specific user? This will add 5 test activities.');
      if (confirmation) {
        const success = await addTestActivitiesForUser();
        if (success) {
          alert('Sample activities added for your user! Check the Recent Activity section.');
        } else {
          alert('Failed to add sample activities. Check console for errors.');
        }
      }
    };

    return (
      <section className="development-tools">
        <div className="dev-tools-container">
          <h4 className="dev-tools-title">Development Tools</h4>
          <div className="dev-tools-buttons">
            <button onClick={handleAddQuickTest} className="dev-button quick">
              Add Test Activity (Current User)
            </button>
            <button onClick={handleAddSampleData} className="dev-button sample">
              Add Sample Data (Current User)
            </button>
            <button onClick={handleAddSpecificUserTest} className="dev-button specific">
              Test Specific User Activity
            </button>
            <button onClick={handleAddSpecificUserData} className="dev-button specific-data">
              Add Data for Specific User
            </button>
          </div>
        </div>
      </section>
    );
  };

  const ReceiptModal = () => {
    if (!selectedActivity) return null;

    const activityConfig = ACTIVITY_TYPES[selectedActivity.type] || ACTIVITY_TYPES.recycling;
    const IconComponent = activityConfig.icon;
    const isPositive = selectedActivity.pointsEarned >= 0;

    // Helper function to format field names to readable labels
    const formatLabel = (key) => {
      const labelMap = {
        'category': 'Category',
        'description': 'Item Description',
        'pointsEarned': 'Points Earned',
        'pointsRedeemed': 'Points Redeemed',
        'productID': 'Product ID',
        'quantity': 'Quantity',
        'location': 'Location',
        'itemType': 'Item Type',
        'weight': 'Weight',
        'material': 'Material Type',
        'condition': 'Condition',
        'rewardName': 'Reward Name',
        'rewardType': 'Reward Type'
      };
      return labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    // Helper to format activity type
    const formatType = (type) => {
      const typeMap = {
        'recycling': 'Recycling Activity',
        'redemption': 'Reward Redemption',
        'learning': 'Learning Activity',
        'bonus': 'Bonus Points'
      };
      return typeMap[type] || type;
    };

    return (
      <div 
        className={`receipt-modal-overlay ${showReceiptModal ? 'active' : ''}`}
        onClick={handleCloseModal}
      >
        <div 
          className="receipt-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="receipt-modal-close" onClick={handleCloseModal}>
            <X size={24} />
          </button>

          <div className="receipt-header">
            <div className={`receipt-icon ${activityConfig.color}`}>
              <IconComponent size={40} />
            </div>
            <h2>Transaction Receipt</h2>
            <p className="receipt-id">Receipt #{selectedActivity.activityID?.slice(-8).toUpperCase()}</p>
          </div>

          <div className="receipt-body">
            <div className="receipt-summary">
              <div className="receipt-summary-item">
                <span className="summary-label">Activity</span>
                <span className="summary-value">{selectedActivity.title}</span>
              </div>
              <div className="receipt-summary-amount">
                <span className={`amount-badge ${isPositive ? 'positive' : 'negative'}`}>
                  {activityConfig.prefix}{Math.abs(selectedActivity.pointsEarned)} pts
                </span>
              </div>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-details">
              <h3 className="receipt-section-title">Transaction Details</h3>
              
              <div className="receipt-row">
                <span className="receipt-label">Activity Type</span>
                <span className={`receipt-value ${isPositive ? 'earned' : 'redeemed'}`}>
                  {formatType(selectedActivity.type)}
                </span>
              </div>

              <div className="receipt-row">
                <span className="receipt-label">Description</span>
                <span className="receipt-value">{selectedActivity.description}</span>
              </div>

              {selectedActivity.category && (
                <div className="receipt-row">
                  <span className="receipt-label">Category</span>
                  <span className="receipt-value">
                    <span className={`category-badge ${selectedActivity.type}`}>
                      {selectedActivity.category}
                    </span>
                  </span>
                </div>
              )}

              <div className="receipt-row">
                <span className="receipt-label">
                  <Clock size={16} />
                  Transaction Date
                </span>
                <span className="receipt-value">
                  {selectedActivity.timestamp.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
              <>
                <div className="receipt-divider"></div>
                <div className="receipt-details">
                  <h3 className="receipt-section-title">Additional Information</h3>
                  
                  {Object.entries(selectedActivity.metadata).map(([key, value]) => (
                    <div className="receipt-row" key={key}>
                      <span className="receipt-label">{formatLabel(key)}</span>
                      <span className="receipt-value">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="receipt-footer">
            <div className="receipt-footer-content">
              <Receipt size={20} />
              <div>
                <p className="receipt-note">Thank you for making a difference!</p>
                <p className="receipt-timestamp">
                  Receipt generated on {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">
      <HomeNavbar />
      
      <main className="home-main">
        <WelcomeSection />
        <StatsSection />
        <QuickActionsSection />
        <RecentActivitySection />
        {/*<DevelopmentToolsSection />*/}
      </main>

      <HomeFooter />
      
      {showReceiptModal && <ReceiptModal />}
    </div>
  );
};

export default Home;