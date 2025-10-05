import { database } from './config';
import { ref, push, onValue, set, update } from 'firebase/database';

/**
 * Achievement Types and their configurations
 */
export const ACHIEVEMENT_TYPES = {
  ECO_WARRIOR: 'eco_warrior',
  SMART_SPENDER: 'smart_spender',
  RECYCLING_MASTER: 'recycling_master',
  LEARNING_ENTHUSIAST: 'learning_enthusiast',
  STREAK_CHAMPION: 'streak_champion',
  COMMUNITY_HELPER: 'community_helper',
  GREEN_PIONEER: 'green_pioneer',
  CONSISTENCY_KING: 'consistency_king'
};

/**
 * Achievement criteria and metadata
 */
export const ACHIEVEMENT_DEFINITIONS = {
  [ACHIEVEMENT_TYPES.ECO_WARRIOR]: {
    id: ACHIEVEMENT_TYPES.ECO_WARRIOR,
    title: 'Eco Warrior',
    description: 'Earn 1000 total points',
    icon: 'Star',
    criteria: {
      type: 'total_points_earned',
      threshold: 1000
    },
    rewards: {
      points: 100,
      badge: 'eco_warrior_badge'
    }
  },
  [ACHIEVEMENT_TYPES.SMART_SPENDER]: {
    id: ACHIEVEMENT_TYPES.SMART_SPENDER,
    title: 'Smart Spender',
    description: 'Redeem 500 points wisely',
    icon: 'Target',
    criteria: {
      type: 'total_points_redeemed',
      threshold: 500
    },
    rewards: {
      points: 50,
      badge: 'smart_spender_badge'
    }
  },
  [ACHIEVEMENT_TYPES.RECYCLING_MASTER]: {
    id: ACHIEVEMENT_TYPES.RECYCLING_MASTER,
    title: 'Recycling Master',
    description: 'Complete 50 recycling activities',
    icon: 'Recycle',
    criteria: {
      type: 'recycling_activities_count',
      threshold: 50
    },
    rewards: {
      points: 200,
      badge: 'recycling_master_badge'
    }
  },
  [ACHIEVEMENT_TYPES.LEARNING_ENTHUSIAST]: {
    id: ACHIEVEMENT_TYPES.LEARNING_ENTHUSIAST,
    title: 'Learning Enthusiast',
    description: 'Complete 10 learning modules',
    icon: 'BookOpen',
    criteria: {
      type: 'learning_activities_count',
      threshold: 10
    },
    rewards: {
      points: 150,
      badge: 'learning_enthusiast_badge'
    }
  },
  [ACHIEVEMENT_TYPES.STREAK_CHAMPION]: {
    id: ACHIEVEMENT_TYPES.STREAK_CHAMPION,
    title: 'Streak Champion',
    description: 'Maintain a 7-day recycling streak',
    icon: 'Flame',
    criteria: {
      type: 'recycling_streak',
      threshold: 7
    },
    rewards: {
      points: 300,
      badge: 'streak_champion_badge'
    }
  },
  [ACHIEVEMENT_TYPES.COMMUNITY_HELPER]: {
    id: ACHIEVEMENT_TYPES.COMMUNITY_HELPER,
    title: 'Community Helper',
    description: 'Help reduce 100kg of waste',
    icon: 'Users',
    criteria: {
      type: 'total_waste_reduced',
      threshold: 100
    },
    rewards: {
      points: 250,
      badge: 'community_helper_badge'
    }
  },
  [ACHIEVEMENT_TYPES.GREEN_PIONEER]: {
    id: ACHIEVEMENT_TYPES.GREEN_PIONEER,
    title: 'Green Pioneer',
    description: 'One of the first 100 users',
    icon: 'Trophy',
    criteria: {
      type: 'early_adopter',
      threshold: 100
    },
    rewards: {
      points: 500,
      badge: 'green_pioneer_badge'
    }
  },
  [ACHIEVEMENT_TYPES.CONSISTENCY_KING]: {
    id: ACHIEVEMENT_TYPES.CONSISTENCY_KING,
    title: 'Consistency King',
    description: 'Recycle for 30 consecutive days',
    icon: 'Calendar',
    criteria: {
      type: 'consecutive_days',
      threshold: 30
    },
    rewards: {
      points: 400,
      badge: 'consistency_king_badge'
    }
  }
};

/**
 * Unlock an achievement for a user
 * @param {string} userID - The user's ID
 * @param {string} achievementType - The achievement type
 * @param {object} progress - Current progress data
 * @returns {Promise<string>} The achievement ID
 */
export const unlockAchievement = async (userID, achievementType, progress = {}) => {
  try {
    if (!userID) {
      throw new Error('UserID is required to unlock achievement');
    }

    const achievementDef = ACHIEVEMENT_DEFINITIONS[achievementType];
    if (!achievementDef) {
      throw new Error(`Unknown achievement type: ${achievementType}`);
    }

    // Check if user already has this achievement
    const userAchievementRef = ref(database, `Users/${userID}/achievements/${achievementType}`);
    
    const achievement = {
      achievementID: achievementType,
      title: achievementDef.title,
      description: achievementDef.description,
      icon: achievementDef.icon,
      unlockedAt: new Date().toISOString(),
      progress: {
        current: progress.current || achievementDef.criteria.threshold,
        target: achievementDef.criteria.threshold,
        percentage: 100
      },
      rewards: achievementDef.rewards,
      criteria: achievementDef.criteria,
      isUnlocked: true
    };

    await set(userAchievementRef, achievement);
    console.log('Achievement unlocked successfully:', achievementType, 'for user:', userID);
    return achievementType;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    throw error;
  }
};

/**
 * Update achievement progress for a user
 * @param {string} userID - The user's ID
 * @param {string} achievementType - The achievement type
 * @param {number} currentProgress - Current progress value
 * @returns {Promise<boolean>} Whether achievement was unlocked
 */
export const updateAchievementProgress = async (userID, achievementType, currentProgress) => {
  try {
    if (!userID) {
      throw new Error('UserID is required to update achievement progress');
    }

    const achievementDef = ACHIEVEMENT_DEFINITIONS[achievementType];
    if (!achievementDef) {
      throw new Error(`Unknown achievement type: ${achievementType}`);
    }

    const userAchievementRef = ref(database, `Users/${userID}/achievements/${achievementType}`);
    const threshold = achievementDef.criteria.threshold;
    const percentage = Math.min((currentProgress / threshold) * 100, 100);
    const isUnlocked = currentProgress >= threshold;

    const achievementData = {
      achievementID: achievementType,
      title: achievementDef.title,
      description: achievementDef.description,
      icon: achievementDef.icon,
      progress: {
        current: currentProgress,
        target: threshold,
        percentage: percentage
      },
      criteria: achievementDef.criteria,
      isUnlocked: isUnlocked,
      ...(isUnlocked && {
        unlockedAt: new Date().toISOString(),
        rewards: achievementDef.rewards
      })
    };

    await set(userAchievementRef, achievementData);
    console.log('Achievement progress updated:', achievementType, 'progress:', currentProgress, 'unlocked:', isUnlocked);
    
    return isUnlocked;
  } catch (error) {
    console.error('Error updating achievement progress:', error);
    throw error;
  }
};

/**
 * Get user achievements with real-time updates
 * @param {string} userID - The user's ID
 * @param {function} callback - Callback function to handle achievement updates
 * @returns {function} Unsubscribe function
 */
export const getUserAchievements = (userID, callback) => {
  if (!userID) {
    console.error('UserID is required to get achievements');
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  console.log('Setting up real-time listener for user achievements:', userID);
  
  // Achievements are under: Users/userID/achievements
  const userAchievementsRef = ref(database, `Users/${userID}/achievements`);

  const unsubscribe = onValue(userAchievementsRef, (snapshot) => {
    console.log('getUserAchievements snapshot received for Users/' + userID + '/achievements:', snapshot.exists());
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const achievementsList = Object.keys(data)
        .map(achievementID => ({
          achievementID,
          ...data[achievementID]
        }))
        .sort((a, b) => {
          // Sort by unlocked status first, then by unlock date
          if (a.isUnlocked && !b.isUnlocked) return -1;
          if (!a.isUnlocked && b.isUnlocked) return 1;
          if (a.isUnlocked && b.isUnlocked) {
            return new Date(b.unlockedAt) - new Date(a.unlockedAt);
          }
          return b.progress.percentage - a.progress.percentage;
        });
      
      console.log('Processed achievements from Users/' + userID + '/achievements:', achievementsList);
      callback(achievementsList);
    } else {
      console.log('No achievements found under Users/' + userID + '/achievements');
      callback([]);
    }
  }, (error) => {
    console.error('Error in getUserAchievements for Users/' + userID + '/achievements:', error);
    callback([]);
  });

  return unsubscribe;
};

/**
 * Check and update all achievements for a user based on their activities
 * @param {string} userID - The user's ID
 * @param {object} userStats - User statistics for checking criteria
 */
export const checkAndUpdateAchievements = async (userID, userStats) => {
  try {
    const {
      totalPointsEarned = 0,
      totalPointsRedeemed = 0,
      recyclingActivitiesCount = 0,
      learningActivitiesCount = 0,
      recyclingStreak = 0,
      totalWasteReduced = 0,
      consecutiveDays = 0,
      isEarlyAdopter = false
    } = userStats;

    const achievementsToCheck = [
      {
        type: ACHIEVEMENT_TYPES.ECO_WARRIOR,
        progress: totalPointsEarned
      },
      {
        type: ACHIEVEMENT_TYPES.SMART_SPENDER,
        progress: totalPointsRedeemed
      },
      {
        type: ACHIEVEMENT_TYPES.RECYCLING_MASTER,
        progress: recyclingActivitiesCount
      },
      {
        type: ACHIEVEMENT_TYPES.LEARNING_ENTHUSIAST,
        progress: learningActivitiesCount
      },
      {
        type: ACHIEVEMENT_TYPES.STREAK_CHAMPION,
        progress: recyclingStreak
      },
      {
        type: ACHIEVEMENT_TYPES.COMMUNITY_HELPER,
        progress: totalWasteReduced
      },
      {
        type: ACHIEVEMENT_TYPES.CONSISTENCY_KING,
        progress: consecutiveDays
      }
    ];

    // Add early adopter achievement if applicable
    if (isEarlyAdopter) {
      achievementsToCheck.push({
        type: ACHIEVEMENT_TYPES.GREEN_PIONEER,
        progress: 1
      });
    }

    const unlockedAchievements = [];

    for (const achievement of achievementsToCheck) {
      const wasUnlocked = await updateAchievementProgress(
        userID, 
        achievement.type, 
        achievement.progress
      );
      
      if (wasUnlocked) {
        unlockedAchievements.push(achievement.type);
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error('Error checking and updating achievements:', error);
    throw error;
  }
};

/**
 * Get achievement statistics for a user
 * @param {string} userID - The user's ID
 * @returns {Promise<object>} Achievement statistics
 */
export const getAchievementStats = async (userID) => {
  return new Promise((resolve, reject) => {
    if (!userID) {
      reject(new Error('UserID is required'));
      return;
    }

    const userAchievementsRef = ref(database, `Users/${userID}/achievements`);
    
    onValue(userAchievementsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const achievements = Object.values(data);
        
        const stats = {
          total: achievements.length,
          unlocked: achievements.filter(a => a.isUnlocked).length,
          inProgress: achievements.filter(a => !a.isUnlocked && a.progress.percentage > 0).length,
          completionRate: achievements.length > 0 
            ? (achievements.filter(a => a.isUnlocked).length / achievements.length * 100)
            : 0
        };
        
        resolve(stats);
      } else {
        resolve({
          total: 0,
          unlocked: 0,
          inProgress: 0,
          completionRate: 0
        });
      }
    }, reject, { onlyOnce: true });
  });
};

/**
 * Initialize default achievements for a new user
 * @param {string} userID - The user's ID
 */
export const initializeUserAchievements = async (userID) => {
  try {
    if (!userID) {
      throw new Error('UserID is required to initialize achievements');
    }

    // Initialize all achievements with 0 progress
    const promises = Object.keys(ACHIEVEMENT_DEFINITIONS).map(achievementType => 
      updateAchievementProgress(userID, achievementType, 0)
    );

    await Promise.all(promises);
    console.log('Initialized achievements for user:', userID);
  } catch (error) {
    console.error('Error initializing user achievements:', error);
    throw error;
  }
}; 