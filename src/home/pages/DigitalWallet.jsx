import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { getUserActivities } from '../../firebase/activities';
import { 
  getUserAchievements, 
  checkAndUpdateAchievements,
  ACHIEVEMENT_TYPES 
} from '../../firebase/achievements';
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Gift,
  Recycle,
  Calendar,
  BarChart3,
  CreditCard,
  History,
  Star,
  Award,
  Target,
  Trophy,
  Users,
  Flame,
  BookOpen,
  Lock,
  CheckCircle,
  X,
  Receipt,
  MapPin,
  Clock
} from 'lucide-react';
import { HomeNavbar, HomeFooter } from '../components';
import '../css/DigitalWallet.css';

// Constants - Easy to maintain and edit
const WALLET_OVERVIEW = {
  title: "Your Wallet Overview",
  subtitle: "Track your points, earnings, and redemptions all in one place",
  lastUpdated: "Last updated"
};

const TIME_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: 'year', label: 'Last Year' }
];

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    type: 'earned',
    amount: 50,
    description: 'Plastic bottles recycled',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: 'recycling',
    icon: Recycle
  },
  {
    id: 2,
    type: 'redeemed',
    amount: -25,
    description: 'Eco-friendly water bottle',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    category: 'redemption',
    icon: Gift
  },
  {
    id: 3,
    type: 'earned',
    amount: 75,
    description: 'Paper recycling bonus',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    category: 'recycling',
    icon: Recycle
  },
  {
    id: 4,
    type: 'earned',
    amount: 30,
    description: 'Glass bottles recycled',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    category: 'recycling',
    icon: Recycle
  },
  {
    id: 5,
    type: 'redeemed',
    amount: -100,
    description: 'Sustainable shopping bag',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    category: 'redemption',
    icon: Gift
  }
];

// Icon mapping for achievements
const ACHIEVEMENT_ICONS = {
  Star: Star,
  Target: Target,
  Recycle: Recycle,
  BookOpen: BookOpen,
  Flame: Flame,
  Users: Users,
  Trophy: Trophy,
  Calendar: Calendar
};

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const DigitalWallet = () => {
  const { user, updateUserPoints } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [error, setError] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(user?.points || 0);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // Ref for cleanup
  const isComponentMounted = useRef(true);

  // Poll Firebase for points updates every 10 seconds
  useEffect(() => {
    if (!user?.userID || !user?.category) {
      setCurrentPoints(user?.points || 0);
      return;
    }

    // Initial fetch
    const fetchPoints = async () => {
      try {
        const { get } = await import('firebase/database');
        const userPointsRef = ref(database, `${user.category}/${user.userID}/points`);
        const snapshot = await get(userPointsRef);
        
        if (snapshot.exists()) {
          const points = snapshot.val();
          setCurrentPoints(points);
          // Also update the AuthContext so other components stay in sync
          updateUserPoints(points);
        }
      } catch (error) {
        console.error('Error fetching points:', error);
      }
    };

    // Fetch immediately
    fetchPoints();

    // Set up polling every 10 seconds
    const intervalId = setInterval(fetchPoints, 10000);

    return () => clearInterval(intervalId);
  }, [user?.userID, user?.category]);

  // Fetch user activities from Firebase - simplified like RedeemRewards
  useEffect(() => {
    if (!user?.userID) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const userActivitiesRef = ref(database, `Users/${user.userID}/activities`);
    
    const unsubscribe = onValue(userActivitiesRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          
          // Convert Firebase activities to transaction format
          const activitiesList = Object.keys(data)
            .map(activityID => {
              const activity = data[activityID];
              return {
                id: activityID,
                type: activity.pointsEarned >= 0 ? 'earned' : 'redeemed',
                amount: activity.pointsEarned || 0,
                description: activity.title || 'Unknown Activity',
                date: new Date(activity.timestamp || Date.now()),
                category: activity.type || 'other',
                icon: getIconForActivityType(activity.type),
                metadata: activity.metadata || {}
              };
            })
            .sort((a, b) => b.date - a.date);
          
          setTransactions(activitiesList);
        } else {
          setTransactions([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error processing activities data:', err);
        setError('Failed to load transaction history');
        setTransactions([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching wallet activities:', error);
      setError('Failed to connect to transaction history');
      setTransactions([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.userID]);

  // Fetch user achievements from Firebase - simplified
  useEffect(() => {
    if (!user?.userID) {
      setAchievements([]);
      return;
    }

    try {
      const unsubscribe = getUserAchievements(user.userID, (achievementsList) => {
        setAchievements(achievementsList || []);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up achievements listener:', error);
      setAchievements([]);
    }
  }, [user?.userID]);

  // Debounced achievement update to prevent excessive API calls
  const updateAchievementsDebounced = useCallback(
    debounce(async (userID, transactions) => {
      if (!userID || transactions.length === 0) return;

      try {
        // Calculate user statistics for achievement checking
        const userStats = calculateUserStats(transactions);
        
        // Check and update achievements
        const newlyUnlocked = await checkAndUpdateAchievements(userID, userStats);
        
        if (newlyUnlocked.length > 0) {
          console.log('Newly unlocked achievements:', newlyUnlocked);
          // You could show a notification here for newly unlocked achievements
        }
      } catch (error) {
        console.error('Error updating achievements:', error);
      }
    }, 1000),
    []
  );

  // Check and update achievements when transactions change (debounced)
  useEffect(() => {
    if (user?.userID && transactions.length > 0) {
      updateAchievementsDebounced(user.userID, transactions);
    }
  }, [user?.userID, transactions, updateAchievementsDebounced]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Helper function to get appropriate icon for activity type
  const getIconForActivityType = (activityType) => {
    switch (activityType) {
      case 'recycling':
        return Recycle;
      case 'redemption':
        return Gift;
      case 'learning':
        return Star;
      case 'bonus':
        return Award;
      default:
        return Recycle;
    }
  };

  // Calculate user statistics for achievement checking
  const calculateUserStats = (transactions) => {
    const earnedTransactions = transactions.filter(t => t.type === 'earned');
    const redeemedTransactions = transactions.filter(t => t.type === 'redeemed');
    const recyclingActivities = transactions.filter(t => t.category === 'recycling');
    const learningActivities = transactions.filter(t => t.category === 'learning');

    return {
      totalPointsEarned: earnedTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalPointsRedeemed: Math.abs(redeemedTransactions.reduce((sum, t) => sum + t.amount, 0)),
      recyclingActivitiesCount: recyclingActivities.length,
      learningActivitiesCount: learningActivities.length,
      recyclingStreak: calculateRecyclingStreak(recyclingActivities),
      totalWasteReduced: calculateWasteReduced(recyclingActivities),
      consecutiveDays: calculateConsecutiveDays(recyclingActivities),
      isEarlyAdopter: false // Could be calculated based on user registration date
    };
  };

  // Helper functions for specific calculations
  const calculateRecyclingStreak = (recyclingActivities) => {
    // Simple streak calculation - count consecutive days with recycling
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    while (streak < 30) { // Max check 30 days
      const dayActivities = recyclingActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate.toDateString() === currentDate.toDateString();
      });

      if (dayActivities.length > 0) {
        streak++;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const calculateWasteReduced = (recyclingActivities) => {
    // Estimate waste reduced based on points (1 point = ~0.1kg)
    const totalRecyclingPoints = recyclingActivities.reduce((sum, activity) => sum + activity.amount, 0);
    return Math.floor(totalRecyclingPoints * 0.1);
  };

  const calculateConsecutiveDays = (recyclingActivities) => {
    // For now, return the same as recycling streak
    return calculateRecyclingStreak(recyclingActivities);
  };

  // Memoized calculations for performance with stable dependencies
  const walletCalculations = useMemo(() => {
    const currentBalance = currentPoints;
    
    const earnedTransactions = transactions.filter(t => t.type === 'earned');
    const redeemedTransactions = transactions.filter(t => t.type === 'redeemed');
    
    const totalEarned = earnedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalRedeemed = Math.abs(redeemedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0));

    // Calculate trend for last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(t => 
      t.date && t.date.getTime() >= thirtyDaysAgo
    );
    
    const recentEarned = recentTransactions
      .filter(t => t.type === 'earned')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const recentRedeemed = Math.abs(recentTransactions
      .filter(t => t.type === 'redeemed')
      .reduce((sum, t) => sum + (t.amount || 0), 0));
    
    const pointsTrend = recentEarned - recentRedeemed;

    return {
      currentBalance,
      totalEarned,
      totalRedeemed,
      pointsTrend
    };
  }, [currentPoints, transactions]);

  // Memoized wallet stats
  const walletStats = useMemo(() => [
    {
      id: 'balance',
      title: 'Current Balance',
      value: walletCalculations.currentBalance,
      icon: Wallet,
      color: 'primary',
      suffix: 'pts'
    },
    {
      id: 'earned',
      title: 'Total Earned',
      value: walletCalculations.totalEarned,
      icon: ArrowUp,
      color: 'success',
      suffix: 'pts'
    },
    {
      id: 'redeemed',
      title: 'Total Redeemed', 
      value: walletCalculations.totalRedeemed,
      icon: ArrowDown,
      color: 'warning',
      suffix: 'pts'
    }
  ], [walletCalculations]);

  // Optimized filtered transactions with better date handling
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];

    const now = Date.now();
    const timeRanges = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000
    };

    const filtered = transactions.filter(transaction => {
      if (!transaction.date) return false;
      
      if (timeFilter === 'all') return true;
      
      const timeRange = timeRanges[timeFilter];
      if (!timeRange) return true;
      
      return (now - transaction.date.getTime()) <= timeRange;
    });

    return filtered.sort((a, b) => {
      const dateA = a.date ? a.date.getTime() : 0;
      const dateB = b.date ? b.date.getTime() : 0;
      return dateB - dateA;
    });
  }, [transactions, timeFilter]);

  // Utility functions
  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Memoized event handlers
  const handleTimeFilterChange = useCallback((newFilter) => {
    setTimeFilter(newFilter);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    // The useEffect hooks will automatically refetch data
  }, []);

  const handleTransactionClick = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowReceiptModal(false);
    setTimeout(() => setSelectedTransaction(null), 300);
  }, []);

  // Memoized sub-components for better organization
  const WalletOverviewSection = React.memo(() => (
    <section className="welcome-section">
      <div className="welcome-content">
        <h2 className="welcome-title">
          <span className="highlight">{user?.username || 'User'}'s</span> Wallet
        </h2>
        <p className="welcome-subtitle">
          {WALLET_OVERVIEW.subtitle}
        </p>
        <div className="location-info">
          <Wallet className="location-icon" />
          <span>Current Balance: {currentPoints} points</span>
        </div>
        <div className="location-info">
          <Calendar className="location-icon" />
          <span>{WALLET_OVERVIEW.lastUpdated}: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <div className="welcome-image">
        <div className="recycling-illustration">
          <CreditCard className="illustration-icon" />
        </div>
      </div>
    </section>
  ));

  const WalletStatsSection = React.memo(() => (
    <section className="stats-section">
      <h3 className="section-title">Wallet Statistics</h3>
      <div className="stats-grid">
        {walletStats.map((stat) => (
          <WalletStatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  ));

  const WalletStatCard = React.memo(({ stat }) => (
    <div className={`wallet-stat-card wallet-stat-${stat.color}`}>
      <div className="wallet-stat-icon-container">
        <stat.icon className="wallet-stat-icon" />
      </div>
      <div className="wallet-stat-content">
        <h4 className="wallet-stat-value">
          {stat.prefix || ''}{stat.value}{stat.suffix || ''}
        </h4>
        <p className="wallet-stat-title">{stat.title}</p>
      </div>
    </div>
  ));

  const TransactionHistorySection = React.memo(() => (
    <section className="activity-section">
      <div className="section-header-with-filter">
        <h3 className="section-title">Transaction History</h3>
        <TimeFilterComponent />
      </div>
      
      <div className="activity-list">
        {filteredTransactions.length === 0 ? (
          <NoTransactionsMessage />
        ) : (
          filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        )}
      </div>
    </section>
  ));

  const TimeFilterComponent = React.memo(() => (
    <div className="time-filter">
      <select 
        value={timeFilter} 
        onChange={(e) => handleTimeFilterChange(e.target.value)}
        className="filter-select"
      >
        {TIME_FILTERS.map(filter => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
    </div>
  ));

  const NoTransactionsMessage = React.memo(() => (
    <div className="no-transactions">
      <History className="no-transactions-icon" />
      <h4>No Transactions Yet</h4>
      <p>Your transaction history will appear here once you start earning and spending points.</p>
      <div className="no-transactions-actions">
        <button 
          onClick={() => navigate('/home/learn-recycling')}
          className="suggestion-button"
        >
          Learn Recycling
        </button>
        <button 
          onClick={() => navigate('/home/redeem-rewards')}
          className="suggestion-button"
        >
          Explore Rewards
        </button>
      </div>
    </div>
  ));

  const TransactionItem = React.memo(({ transaction }) => {
    const IconComponent = transaction.icon;
    const isPositive = transaction.amount >= 0;
    const isRedemption = transaction.category === 'redemption';
    
    return (
      <div 
        className={`activity-item ${isRedemption ? 'clickable' : ''}`}
        onClick={isRedemption ? () => handleTransactionClick(transaction) : undefined}
        role={isRedemption ? "button" : undefined}
        tabIndex={isRedemption ? 0 : undefined}
        onKeyDown={isRedemption ? (e) => e.key === 'Enter' && handleTransactionClick(transaction) : undefined}
      >
        <div className={`activity-icon ${isPositive ? 'success' : 'warning'}`}>
          <IconComponent />
        </div>
        <div className="activity-content">
          <h4>{transaction.description}</h4>
          <p className={`transaction-amount ${isPositive ? 'earned' : 'redeemed'}`}>
            {isPositive ? '+' : ''}{transaction.amount} points
          </p>
          <span className="activity-time">{formatDate(transaction.date)}</span>
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <div className="transaction-details">
              {transaction.metadata.quantity && (
                <span className="detail-badge">Qty: {transaction.metadata.quantity}</span>
              )}
              {transaction.metadata.location && (
                <span className="detail-badge">📍 {transaction.metadata.location}</span>
              )}
            </div>
          )}
        </div>
        {isRedemption && (
          <div className="transaction-category">
            <span className={`category-badge ${transaction.category}`}>
              {transaction.category}
            </span>
            <Receipt className="receipt-icon" size={16} />
          </div>
        )}
      </div>
    );
  });

  const PointsBreakdownSection = React.memo(() => (
    <section className="actions-section">
      <h3 className="section-title">Points Breakdown</h3>
      <div className="chart-container">
        <EarningSpendingChart />
        <AchievementsCard />
      </div>
    </section>
  ));

  const EarningSpendingChart = React.memo(() => {
    const totalEarned = walletCalculations.totalEarned;
    const totalRedeemed = walletCalculations.totalRedeemed;
    const total = totalEarned + totalRedeemed;

    return (
      <div className="chart-card">
        <div className="chart-header">
          <BarChart3 className="chart-icon" />
          <h4>Earning vs Spending</h4>
        </div>
        <div className="chart-content">
          <div className="chart-bar">
            <div 
              className="bar-section earned" 
              style={{width: `${total > 0 ? (totalEarned / total) * 100 : 50}%`}}
            >
              <span className="bar-label">Earned: {totalEarned} pts</span>
            </div>
            <div 
              className="bar-section redeemed" 
              style={{width: `${total > 0 ? (totalRedeemed / total) * 100 : 50}%`}}
            >
              <span className="bar-label">Redeemed: {totalRedeemed} pts</span>
            </div>
          </div>
          <ChartLegend />
        </div>
      </div>
    );
  });

  const ChartLegend = React.memo(() => (
    <div className="chart-legend">
      <div className="legend-item">
        <div className="legend-color earned"></div>
        <span>Points Earned</span>
      </div>
      <div className="legend-item">
        <div className="legend-color redeemed"></div>
        <span>Points Redeemed</span>
      </div>
    </div>
  ));

  const AchievementsCard = React.memo(() => (
    <div className="achievement-card">
      <div className="achievement-header">
        <Award className="achievement-icon" />
        <h4>Achievements</h4>
        <span className="achievement-count">
          {achievements.filter(a => a.isUnlocked).length}/{achievements.length}
        </span>
      </div>
      <div className="achievement-content">
        {achievements.length === 0 ? (
          <div className="no-achievements">
            <Trophy className="no-achievements-icon" />
            <p>No achievements yet. Start recycling to unlock achievements!</p>
          </div>
        ) : (
          achievements.slice(0, 4).map((achievement) => (
            <AchievementItem 
              key={achievement.achievementID} 
              achievement={achievement}
            />
          ))
        )}
        {achievements.length > 4 && (
          <div className="achievement-show-more">
            <button className="show-more-btn">
              View All {achievements.length} Achievements
            </button>
          </div>
        )}
      </div>
    </div>
  ));

  const AchievementItem = React.memo(({ achievement }) => {
    const IconComponent = ACHIEVEMENT_ICONS[achievement.icon] || Star;
    const isUnlocked = achievement.isUnlocked;
    const progress = achievement.progress || { current: 0, target: 1, percentage: 0 };

    return (
      <div className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
        <div className="achievement-icon-container">
          {isUnlocked ? (
            <CheckCircle className="achievement-status-icon unlocked" />
          ) : (
            <Lock className="achievement-status-icon locked" />
          )}
          <IconComponent className="achievement-star" />
        </div>
        <div className="achievement-text">
          <h5>{achievement.title}</h5>
          <p>{achievement.description}</p>
          {!isUnlocked && progress.percentage > 0 && (
            <div className="achievement-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {progress.current}/{progress.target} ({Math.round(progress.percentage)}%)
              </span>
            </div>
          )}
          {isUnlocked && achievement.unlockedAt && (
            <span className="unlocked-date">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  });

  const LoadingState = () => (
    <div className="home-container">
      <HomeNavbar />
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your wallet...</p>
      </div>
      <HomeFooter />
    </div>
  );

  const ErrorState = () => (
    <div className="home-container">
      <HomeNavbar />
      <div className="error-container">
        <div className="error-content">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
      <HomeFooter />
    </div>
  );

  const ReceiptModal = () => {
    if (!selectedTransaction) return null;

    const IconComponent = selectedTransaction.icon;
    const isPositive = selectedTransaction.amount >= 0;

    // Helper function to format field names to readable labels
    const formatLabel = (key) => {
      const labelMap = {
        'quantity': 'Quantity',
        'location': 'Location',
        'itemType': 'Item Type',
        'weight': 'Weight (kg)',
        'material': 'Material Type',
        'condition': 'Condition',
        'productID': 'Product ID',
        'rewardName': 'Reward Name',
        'rewardType': 'Reward Type',
        'category': 'Category'
      };
      return labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    // Helper to format category
    const formatCategory = (category) => {
      const categoryMap = {
        'recycling': 'Recycling',
        'redemption': 'Reward Redemption',
        'learning': 'Learning',
        'bonus': 'Bonus',
        'registration': 'Registration',
        'other': 'Other'
      };
      return categoryMap[category] || category;
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
            <div className={`receipt-icon ${isPositive ? 'success' : 'warning'}`}>
              <IconComponent size={40} />
            </div>
            <h2>Transaction Receipt</h2>
            <p className="receipt-id">Receipt #{selectedTransaction.id?.slice(-8).toUpperCase() || 'N/A'}</p>
          </div>

          <div className="receipt-body">
            <div className="receipt-summary">
              <div className="receipt-summary-item">
                <span className="summary-label">Transaction</span>
                <span className="summary-value">{selectedTransaction.description}</span>
              </div>
              <div className="receipt-summary-amount">
                <span className={`amount-badge ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? '+' : ''}{selectedTransaction.amount} pts
                </span>
              </div>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-details">
              <h3 className="receipt-section-title">Transaction Details</h3>
              
              <div className="receipt-row">
                <span className="receipt-label">Transaction Type</span>
                <span className={`receipt-value ${isPositive ? 'earned' : 'redeemed'}`}>
                  {isPositive ? 'Points Earned' : 'Points Redeemed'}
                </span>
              </div>

              <div className="receipt-row">
                <span className="receipt-label">Category</span>
                <span className="receipt-value">
                  <span className={`category-badge ${selectedTransaction.category}`}>
                    {formatCategory(selectedTransaction.category)}
                  </span>
                </span>
              </div>

              <div className="receipt-row">
                <span className="receipt-label">
                  <Clock size={16} />
                  Transaction Date
                </span>
                <span className="receipt-value">
                  {selectedTransaction.date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
              <>
                <div className="receipt-divider"></div>
                <div className="receipt-details">
                  <h3 className="receipt-section-title">Additional Information</h3>
                  
                  {Object.entries(selectedTransaction.metadata).map(([key, value]) => {
                    if (key === 'location') {
                      return (
                        <div className="receipt-row" key={key}>
                          <span className="receipt-label">
                            <MapPin size={16} />
                            {formatLabel(key)}
                          </span>
                          <span className="receipt-value">{value}</span>
                        </div>
                      );
                    }
                    return (
                      <div className="receipt-row" key={key}>
                        <span className="receipt-label">{formatLabel(key)}</span>
                        <span className="receipt-value">{value}</span>
                      </div>
                    );
                  })}
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

  // Render loading state
  if (loading && !error) {
    return <LoadingState />;
  }

  // Render error state
  if (error && !loading) {
    return <ErrorState />;
  }

  return (
    <div className="home-container">
      <HomeNavbar />

      <main className="home-main">
        <WalletOverviewSection />
        <WalletStatsSection />
        <TransactionHistorySection />
        <PointsBreakdownSection />
      </main>

      <HomeFooter />
      
      {showReceiptModal && <ReceiptModal />}
    </div>
  );
};

export default DigitalWallet;