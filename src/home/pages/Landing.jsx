import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { 
  Recycle, 
  Award, 
  Users, 
  Leaf,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  TrendingUp,
  Heart
} from 'lucide-react';
import '../css/Landing.css';

// Constants - Easy to maintain and edit
const HERO_CONTENT = {
  title: "Transform Recycling into Rewards",
  subtitle: "Join SariCycle and earn points for every item you recycle. Make a positive environmental impact while getting rewarded!",
  primaryAction: "Get Started Today",
  secondaryAction: "Learn More"
};

const FEATURES = [
  {
    id: 'earn_points',
    title: 'Earn Points',
    description: 'Get rewarded for every plastic bottle, paper, and recyclable item you properly dispose of',
    icon: Award,
    color: 'primary'
  },
  {
    id: 'redeem_rewards',
    title: 'Redeem Rewards',
    description: 'Exchange your points for eco-friendly products and sustainable merchandise',
    icon: Star,
    color: 'secondary'
  },
  {
    id: 'track_impact',
    title: 'Track Impact',
    description: 'Monitor your environmental contribution and see how you\'re helping the planet',
    icon: Globe,
    color: 'accent'
  },
  {
    id: 'join_community',
    title: 'Join Community',
    description: 'Connect with like-minded people who care about environmental sustainability',
    icon: Users,
    color: 'primary'
  }
];

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k+`;
  }
  return `${num}+`;
};

const BENEFITS = [
  {
    id: 'easy_start',
    title: 'Easy to Start',
    description: 'Simple registration process and intuitive app design'
  },
  {
    id: 'instant_rewards',
    title: 'Instant Rewards',
    description: 'Earn points immediately when you recycle'
  },
  {
    id: 'environmental_impact',
    title: 'Real Impact',
    description: 'Make a measurable difference to the environment'
  },
  {
    id: 'community_driven',
    title: 'Community Driven',
    description: 'Join thousands of eco-conscious individuals'
  }
];

const CTA_SECTION = {
  title: "Ready to Make a Difference?",
  subtitle: "Join thousands of people who are already earning rewards while helping the environment",
  actionText: "Start Your Journey"
};

const Landing = () => {
  const navigate = useNavigate();
  const [firebaseStats, setFirebaseStats] = useState({
    totalUsers: 0,
    totalPoints: 0,
    totalActivities: 0,
    loading: true
  });

  // Memoized navigation handlers
  const navigationHandlers = useMemo(() => ({
    handleGetStarted: () => navigate('/auth'),
    handleLearnMore: () => navigate('/home/about'),
    handleStartJourney: () => navigate('/auth')
  }), [navigate]);

  // Fetch real-time data from Firebase
  useEffect(() => {
    let unsubscribeUsers, unsubscribeAdmins, unsubscribeBarangay;

    const setupListeners = () => {
      try {
        let usersData = [];
        let adminsData = [];
        let barangayData = [];
        let listenersReady = 0;

        const checkAllLoaded = () => {
          listenersReady++;
          if (listenersReady === 3) {
            const allUsers = [...usersData, ...adminsData, ...barangayData];
            const totalUsers = allUsers.length;
            const totalPoints = usersData.reduce((sum, user) => sum + (user.points || 0), 0);
            
            // Calculate total activities (estimate based on points)
            const totalActivities = usersData.reduce((sum, user) => {
              // Estimate: each activity gives ~20 points on average
              return sum + Math.floor((user.points || 0) / 20);
            }, 0);

            setFirebaseStats({
              totalUsers,
              totalPoints,
              totalActivities,
              loading: false
            });
          }
        };

        // Listen to Users
        const usersRef = ref(database, 'Users');
        unsubscribeUsers = onValue(usersRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            usersData = Object.keys(data).map(userID => ({
              userID,
              ...data[userID]
            }));
          } else {
            usersData = [];
          }
          checkAllLoaded();
        }, (error) => {
          console.error('Error fetching users:', error);
          checkAllLoaded();
        });

        // Listen to Admins
        const adminsRef = ref(database, 'Admins');
        unsubscribeAdmins = onValue(adminsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            adminsData = Object.keys(data).map(userID => ({
              userID,
              ...data[userID]
            }));
          } else {
            adminsData = [];
          }
          checkAllLoaded();
        }, (error) => {
          console.error('Error fetching admins:', error);
          checkAllLoaded();
        });

        // Listen to Barangay
        const barangayRef = ref(database, 'Barangay');
        unsubscribeBarangay = onValue(barangayRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            barangayData = Object.keys(data).map(userID => ({
              userID,
              ...data[userID]
            }));
          } else {
            barangayData = [];
          }
          checkAllLoaded();
        }, (error) => {
          console.error('Error fetching barangay users:', error);
          checkAllLoaded();
        });
      } catch (error) {
        console.error('Error setting up listeners:', error);
        setFirebaseStats(prev => ({ ...prev, loading: false }));
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeAdmins) unsubscribeAdmins();
      if (unsubscribeBarangay) unsubscribeBarangay();
    };
  }, []);

  // Calculate dynamic impact stats based on Firebase data
  const impactStats = useMemo(() => {
    const { totalUsers, totalPoints, totalActivities } = firebaseStats;
    
    // Calculate waste recycled (estimate: 1 point = 0.1kg)
    const wasteKg = Math.floor(totalPoints * 0.1);
    const wasteTons = wasteKg >= 1000 ? `${(wasteKg / 1000).toFixed(1)} tons` : `${wasteKg} kg`;
    
    // Calculate trees saved (estimate: 1 tree per 50kg waste)
    const treesSaved = Math.floor(wasteKg / 50);
    
    return [
      {
        id: 'users',
        value: firebaseStats.loading ? '...' : formatNumber(totalUsers),
        label: 'Active Users',
        icon: Users,
        color: 'primary'
      },
      {
        id: 'recycled',
        value: firebaseStats.loading ? '...' : wasteTons,
        label: 'Waste Recycled',
        icon: Recycle,
        color: 'secondary'
      },
      {
        id: 'trees',
        value: firebaseStats.loading ? '...' : formatNumber(treesSaved),
        label: 'Trees Saved',
        icon: Leaf,
        color: 'accent'
      },
      {
        id: 'rewards',
        value: firebaseStats.loading ? '...' : formatNumber(totalActivities),
        label: 'Rewards Claimed',
        icon: Award,
        color: 'primary'
      }
    ];
  }, [firebaseStats]);

  // Sub-components for better organization
  const HeroSection = () => (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            {HERO_CONTENT.title}
          </h1>
          <p className="hero-subtitle">
            {HERO_CONTENT.subtitle}
          </p>
          <div className="hero-actions">
            <button 
              className="btn-primary"
              onClick={navigationHandlers.handleGetStarted}
            >
              {HERO_CONTENT.primaryAction}
              <ArrowRight className="btn-icon" />
            </button>
            <button 
              className="btn-secondary"
              onClick={navigationHandlers.handleLearnMore}
            >
              {HERO_CONTENT.secondaryAction}
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-illustration">
            <Recycle className="hero-icon" />
            <div className="floating-icons">
              <Award className="floating-icon icon-1" />
              <Leaf className="floating-icon icon-2" />
              <Heart className="floating-icon icon-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const StatsSection = () => (
    <section className="stats-section">
      <div className="stats-container">
        <h2 className="stats-title">Our Environmental Impact</h2>
        <div className="stats-grid">
          {impactStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );

  const StatCard = ({ stat }) => (
    <div className={`stat-card stat-${stat.color}`}>
      <div className="stat-icon-container">
        <stat.icon className="stat-icon" />
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{stat.value}</h3>
        <p className="stat-label">{stat.label}</p>
      </div>
    </div>
  );

  const FeaturesSection = () => (
    <section className="features-section">
      <div className="features-container">
        <div className="section-header">
          <h2 className="section-title">How SariCycle Works</h2>
          <p className="section-subtitle">
            Simple steps to start earning rewards while helping the environment
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );

  const FeatureCard = ({ feature }) => (
    <div className="feature-card">
      <div className={`feature-icon feature-${feature.color}`}>
        <feature.icon className="icon" />
      </div>
      <div className="feature-content">
        <h3 className="feature-title">{feature.title}</h3>
        <p className="feature-description">{feature.description}</p>
      </div>
    </div>
  );

  const BenefitsSection = () => (
    <section className="benefits-section">
      <div className="benefits-container">
        <h2 className="section-title">Why Choose SariCycle?</h2>
        <div className="benefits-grid">
          {BENEFITS.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  );

  const BenefitCard = ({ benefit }) => (
    <div className="benefit-card">
      <div className="benefit-icon">
        <CheckCircle className="check-icon" />
      </div>
      <div className="benefit-content">
        <h4 className="benefit-title">{benefit.title}</h4>
        <p className="benefit-description">{benefit.description}</p>
      </div>
    </div>
  );

  const CTASection = () => {
    const userCountText = firebaseStats.loading 
      ? 'Loading...' 
      : `Over ${formatNumber(firebaseStats.totalUsers)} people have already joined!`;

    return (
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">{CTA_SECTION.title}</h2>
            <p className="cta-subtitle">{CTA_SECTION.subtitle}</p>
            <button 
              className="cta-button"
              onClick={navigationHandlers.handleStartJourney}
            >
              <TrendingUp className="cta-icon" />
              {CTA_SECTION.actionText}
            </button>
            <p className="cta-stats">{userCountText}</p>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="landing-container">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <BenefitsSection />
      <CTASection />
    </div>
  );
};

export default Landing;