import React, { useState, useMemo } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logLearningActivity } from '../../firebase/activities';
import { 
  BookOpen,
  Recycle,
  Leaf,
  Lightbulb,
  Play,
  CheckCircle,
  Award,
  Target,
  Clock,
  Users,
  Globe,
  TrendingUp,
  Info,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';
import { HomeNavbar, HomeFooter } from '../components';
import '../css/LearnRecycling.css';

// Constants - Easy to maintain and edit
const LEARNING_OVERVIEW = {
  title: "Master Recycling Skills",
  subtitle: "Learn proper recycling techniques and earn points while helping the environment",
  pointsAvailable: "Earn up to {points} points by completing all modules"
};

const LEARNING_MODULES = [
  {
    id: 1,
    title: 'Plastic Recycling Basics',
    description: 'Learn about different types of plastics and how to recycle them properly',
    duration: '15 min',
    difficulty: 'Beginner',
    points: 25,
    icon: Recycle,
    color: 'primary',
    content: {
      overview: 'Plastic recycling is one of the most important environmental actions you can take. Understanding plastic types and proper disposal methods can significantly impact our environment.',
      keyPoints: [
        'Identify plastic types using recycling codes (1-7)',
        'Clean containers before recycling',
        'Remove caps and labels when required',
        'Never recycle plastic bags in regular bins'
      ],
      tips: [
        'Look for the recycling symbol with numbers',
        'Rinse food containers thoroughly',
        'Check local recycling guidelines',
        'Consider reusing before recycling'
      ]
    }
  },
  {
    id: 2,
    title: 'Paper Recycling Guide',
    description: 'Master the art of paper recycling and understand what can and cannot be recycled',
    duration: '12 min',
    difficulty: 'Beginner',
    points: 20,
    icon: BookOpen,
    color: 'secondary',
    content: {
      overview: 'Paper recycling helps save trees and reduces landfill waste. Learn which papers are recyclable and how to prepare them properly.',
      keyPoints: [
        'Remove staples and paper clips',
        'Separate different paper types',
        'Avoid greasy or waxed papers',
        'Include newspapers, magazines, and cardboard'
      ],
      tips: [
        'Keep paper dry and clean',
        'Flatten cardboard boxes',
        'Remove tape from boxes',
        'Pizza boxes are often not recyclable due to grease'
      ]
    }
  },
  {
    id: 3,
    title: 'Glass & Metal Recycling',
    description: 'Discover how to recycle glass bottles, jars, and metal containers effectively',
    duration: '18 min',
    difficulty: 'Intermediate',
    points: 30,
    icon: Award,
    color: 'accent',
    content: {
      overview: 'Glass and metal are infinitely recyclable materials. Learn proper sorting and preparation techniques for maximum recycling efficiency.',
      keyPoints: [
        'Separate by color for glass',
        'Remove lids and caps',
        'Rinse containers clean',
        'Include aluminum cans and steel containers'
      ],
      tips: [
        'Glass can be recycled endlessly',
        'Aluminum cans are highly valuable',
        'Check for recycling symbols',
        'Remove paper labels when possible'
      ]
    }
  },
  {
    id: 4,
    title: 'Composting Organic Waste',
    description: 'Learn how to turn food scraps into nutrient-rich compost for gardens',
    duration: '20 min',
    difficulty: 'Intermediate',
    points: 35,
    icon: Leaf,
    color: 'primary',
    content: {
      overview: 'Composting reduces organic waste and creates valuable soil amendment. Discover the science behind composting and how to start your own system.',
      keyPoints: [
        'Balance green and brown materials',
        'Maintain proper moisture levels',
        'Turn compost regularly for air circulation',
        'Monitor temperature for optimal decomposition'
      ],
      tips: [
        'Start with a 3:1 ratio of brown to green materials',
        'Avoid meat, dairy, and oils',
        'Chop materials into smaller pieces',
        'Use finished compost in 6-12 months'
      ]
    }
  }
];

const RECYCLING_TIPS = [
  {
    id: 'clean_first',
    title: 'Clean Before You Recycle',
    description: 'Always rinse containers to remove food residue',
    icon: Lightbulb,
    impact: 'Prevents contamination of entire recycling batches'
  },
  {
    id: 'know_rules',
    title: 'Know Your Local Rules',
    description: 'Recycling guidelines vary by location',
    icon: Target,
    impact: 'Ensures your efforts actually help the environment'
  },
  {
    id: 'reduce_first',
    title: 'Reduce First, Then Recycle',
    description: 'Minimize consumption before focusing on disposal',
    icon: TrendingUp,
    impact: 'Greatest environmental impact comes from using less'
  },
  {
    id: 'special_programs',
    title: 'Check for Special Programs',
    description: 'Many items need special collection methods',
    icon: Info,
    impact: 'Electronics, batteries, and chemicals require special handling'
  }
];

const IMPACT_STATS = [
  {
    id: 'trees',
    title: 'Trees Saved',
    value: '17 million',
    subtitle: 'annually through paper recycling',
    icon: Leaf,
    color: 'primary'
  },
  {
    id: 'energy',
    title: 'Energy Saved',
    value: '95%',
    subtitle: 'when recycling aluminum vs. new production',
    icon: Lightbulb,
    color: 'secondary'
  },
  {
    id: 'water',
    title: 'Water Conserved',
    value: '7,000 gal',
    subtitle: 'per ton of recycled paper',
    icon: Globe,
    color: 'accent'
  },
  {
    id: 'co2',
    title: 'CO2 Reduced',
    value: '1.17 tons',
    subtitle: 'per ton of recycled plastic',
    icon: TrendingUp,
    color: 'primary'
  }
];

const FAQS = [
  {
    id: 'what_happens',
    question: 'What happens to recycled materials?',
    answer: 'Recycled materials are processed and transformed into new products. Paper becomes new paper products, plastic bottles become clothing or new containers, and aluminum cans become new cans or other aluminum products.'
  },
  {
    id: 'why_rejected',
    question: 'Why was my recycling rejected?',
    answer: 'Common reasons include contamination (food residue), wrong materials (non-recyclables), or improper preparation (caps still on bottles). Always check local guidelines and clean items properly.'
  },
  {
    id: 'electronics',
    question: 'Can I recycle electronics?',
    answer: 'Electronics require special recycling programs due to toxic materials. Many retailers and manufacturers offer e-waste collection programs. Never put electronics in regular recycling bins.'
  },
  {
    id: 'plastic_bags',
    question: 'How do I recycle plastic bags?',
    answer: 'Plastic bags should never go in curbside recycling. Instead, take them to collection bins at grocery stores and retailers. Many stores have dedicated plastic film recycling programs.'
  },
  {
    id: 'no_recycling',
    question: 'What if my area doesn\'t have recycling?',
    answer: 'Look for regional recycling centers, organize community collection drives, or contact local government about starting programs. Some materials can be mailed to specialized recycling companies.'
  }
];

const LearnRecycling = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(null);
  const [completedModules, setCompletedModules] = useState(new Set());
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Memoized calculations
  const learningProgress = useMemo(() => {
    const totalAvailablePoints = LEARNING_MODULES.reduce((sum, module) => sum + module.points, 0);
    const earnedPoints = Array.from(completedModules).reduce((sum, moduleId) => {
      const module = LEARNING_MODULES.find(m => m.id === moduleId);
      return sum + (module ? module.points : 0);
    }, 0);
    const progressPercentage = Math.round((completedModules.size / LEARNING_MODULES.length) * 100);
    const remainingModules = LEARNING_MODULES.length - completedModules.size;

    return {
      totalAvailablePoints,
      earnedPoints,
      progressPercentage,
      remainingModules,
      completedCount: completedModules.size
    };
  }, [completedModules]);

  // Memoized handlers
  const handlers = useMemo(() => ({
    openModule: (module) => setActiveModule(module),
    closeModule: () => setActiveModule(null),
    completeModule: async (moduleId) => {
      const module = LEARNING_MODULES.find(m => m.id === moduleId);
      if (!module) return;

      const newCompleted = new Set(completedModules);
      newCompleted.add(moduleId);
      setCompletedModules(newCompleted);
      setActiveModule(null);
      
      // Log learning activity to Firebase
      if (user?.userID) {
        try {
          await logLearningActivity(
            user.userID,
            module.title,
            module.points,
            {
              moduleId: module.id,
              duration: module.duration,
              difficulty: module.difficulty
            }
          );
        } catch (error) {
          console.error('Error logging learning activity:', error);
          // Don't fail the completion if activity logging fails
        }
      }
      
      alert(`Module completed! You earned ${module.points} points.`);
    },
    toggleFAQ: (index) => setExpandedFAQ(expandedFAQ === index ? null : index)
  }), [completedModules, expandedFAQ, user?.userID]);

  // Sub-components for better organization
  const LearningOverviewSection = () => (
    <section className="welcome-section">
      <div className="welcome-content">
        <h2 className="welcome-title">
          Master <span className="highlight">Recycling</span> Skills
        </h2>
        <p className="welcome-subtitle">
          {LEARNING_OVERVIEW.subtitle}
        </p>
        <div className="location-info">
          <Award className="location-icon" />
          <span>{LEARNING_OVERVIEW.pointsAvailable.replace('{points}', learningProgress.totalAvailablePoints)}</span>
        </div>
      </div>
      <div className="welcome-image">
        <div className="recycling-illustration">
          <Recycle className="illustration-icon" />
        </div>
      </div>
    </section>
  );

  const LearningProgressSection = () => (
    <section className="stats-section">
      <h3 className="section-title">Your Learning Progress</h3>
      <div className="stats-grid">
        <ProgressStatCard 
          title="Modules Completed"
          value={learningProgress.completedCount}
          icon={CheckCircle}
          color="primary"
        />
        <ProgressStatCard 
          title="Points Earned"
          value={learningProgress.earnedPoints}
          icon={Star}
          color="secondary"
        />
        <ProgressStatCard 
          title="Progress"
          value={`${learningProgress.progressPercentage}%`}
          icon={Target}
          color="accent"
        />
        <ProgressStatCard 
          title="Remaining"
          value={learningProgress.remainingModules}
          icon={Clock}
          color="primary"
        />
      </div>
    </section>
  );

  const ProgressStatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon-container2">
        <Icon className="stat-icon2" />
      </div>
      <div className="stat-content">
        <h4 className="stat-value">{value}</h4>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );

  {/*
  const LearningModulesSection = () => (
    <section className="activity-section">
      <h3 className="section-title">Learning Modules</h3>
      <div className="modules-grid">
        {LEARNING_MODULES.map((module) => (
          <ModuleCard 
            key={module.id} 
            module={module} 
            isCompleted={completedModules.has(module.id)}
            onStart={handlers.openModule}
          />
        ))}
      </div>
    </section>
  );
  */}

  const ModuleCard = ({ module, isCompleted, onStart }) => (
    <div className={`module-card ${isCompleted ? 'completed' : ''}`}>
      <div className="module-header">
        <div className={`module-icon ${module.color}`}>
          <module.icon className="icon" />
        </div>
        <div className="module-meta">
          <span className="module-duration">
            <Clock className="duration-icon" />
            {module.duration}
          </span>
          <span className="module-difficulty">{module.difficulty}</span>
          <span className="module-points">
            <Star className="points-icon" />
            {module.points} pts
          </span>
        </div>
      </div>
      
      <div className="module-content">
        <h4 className="module-title">{module.title}</h4>
        <p className="module-description">{module.description}</p>
      </div>
      
      <div className="module-actions">
        {isCompleted ? (
          <CompletionBadge />
        ) : (
          <StartButton onClick={() => onStart(module)} />
        )}
      </div>
    </div>
  );

  const CompletionBadge = () => (
    <div className="completion-badge">
      <CheckCircle className="completion-icon" />
      <span>Completed</span>
    </div>
  );

  const StartButton = ({ onClick }) => (
    <button className="start-button" onClick={onClick}>
      <Play className="play-icon" />
      Start Learning
    </button>
  );

  const QuickTipsSection = () => (
    <section className="actions-section">
      <h3 className="section-title">Quick Recycling Tips</h3>
      <div className="tips-grid">
        {RECYCLING_TIPS.map((tip) => (
          <TipCard key={tip.id} tip={tip} />
        ))}
      </div>
    </section>
  );

  const TipCard = ({ tip }) => (
    <div className="tip-card">
      <div className="tip-icon">
        <tip.icon className="tip-icon-svg" />
      </div>
      <div className="tip-content">
        <h4 className="tip-title">{tip.title}</h4>
        <p className="tip-description">{tip.description}</p>
        <small className="tip-impact">{tip.impact}</small>
      </div>
    </div>
  );

  const EnvironmentalImpactSection = () => (
    <section className="stats-section">
      <h3 className="section-title">Global Recycling Impact</h3>
      <div className="stats-grid">
        {IMPACT_STATS.map((stat) => (
          <ImpactStatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );

  const ImpactStatCard = ({ stat }) => (
    <div className={`stat-card stat-${stat.color}`}>
      <div className="stat-icon-container2">
        <stat.icon className="stat-icon2" />
      </div>
      <div className="stat-content">
        <h4 className="stat-value">{stat.value}</h4>
        <p className="stat-title">{stat.subtitle}</p>
      </div>
    </div>
  );

  const FAQSection = () => (
    <section className="activity-section">
      <h3 className="section-title">Frequently Asked Questions</h3>
      <div className="faq-list">
        {FAQS.map((faq, index) => (
          <FAQItem 
            key={faq.id} 
            faq={faq} 
            index={index}
            isExpanded={expandedFAQ === index}
            onToggle={handlers.toggleFAQ}
          />
        ))}
      </div>
    </section>
  );

  const FAQItem = ({ faq, index, isExpanded, onToggle }) => (
    <div className="faq-item">
      <button 
        className="faq-question"
        onClick={() => onToggle(index)}
      >
        <span>{faq.question}</span>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>
      {isExpanded && (
        <div className="faq-answer">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  );

  const ModuleModal = () => {
    if (!activeModule) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>{activeModule.title}</h3>
            <button 
              className="modal-close"
              onClick={handlers.closeModule}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          <div className="modal-body">
            <div className="module-details">
              <ModuleOverview content={activeModule.content} />
              <ModuleKeyPoints points={activeModule.content.keyPoints} />
              <ModuleProTips tips={activeModule.content.tips} />
              <ModuleCompletion points={activeModule.points} />
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="modal-button cancel"
              onClick={handlers.closeModule}
            >
              Close
            </button>
            <button 
              className="modal-button confirm"
              onClick={() => handlers.completeModule(activeModule.id)}
            >
              Mark as Complete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ModuleOverview = ({ content }) => (
    <div className="module-overview">
      <h4>Overview</h4>
      <p>{content.overview}</p>
    </div>
  );

  const ModuleKeyPoints = ({ points }) => (
    <div className="module-section">
      <h4>Key Learning Points</h4>
      <ul className="learning-points">
        {points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  );

  const ModuleProTips = ({ tips }) => (
    <div className="module-section">
      <h4>Pro Tips</h4>
      <ul className="pro-tips">
        {tips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </div>
  );

  const ModuleCompletion = ({ points }) => (
    <div className="module-completion">
      <div className="completion-info">
        <Star className="completion-star" />
        <span>Complete this module to earn {points} points!</span>
      </div>
    </div>
  );

  return (
    <div className="home-container">
      <HomeNavbar />

      <main className="home-main">
        <LearningOverviewSection />
        <LearningProgressSection />
        {/*<LearningModulesSection />*/}
        <QuickTipsSection />
        <EnvironmentalImpactSection />
        {/*<FAQSection />*/}
      </main>

      <ModuleModal />
      <HomeFooter />
    </div>
  );
};

export default LearnRecycling;