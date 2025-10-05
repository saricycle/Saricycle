import { database } from './config';
import { ref, push, onValue } from 'firebase/database';

/**
 * Activity Types and their configurations
 */
export const ACTIVITY_TYPES = {
  RECYCLING: 'recycling',
  REDEMPTION: 'redemption',
  LEARNING: 'learning',
  BONUS: 'bonus',
  REGISTRATION: 'registration'
};

/**
 * Log a new activity for a user
 * @param {string} userID - The user's ID
 * @param {object} activityData - The activity data
 * @param {string} activityData.type - Activity type (recycling, redemption, etc.)
 * @param {string} activityData.title - Activity title
 * @param {string} activityData.description - Activity description
 * @param {number} activityData.pointsEarned - Points earned/spent (positive for earned, negative for spent)
 * @param {string} activityData.category - Optional category
 * @param {object} activityData.metadata - Optional additional data
 * @returns {Promise<string>} The activity ID
 */
export const logActivity = async (userID, activityData) => {
  try {
    if (!userID) {
      throw new Error('UserID is required to log activity');
    }

    // Put activities as subcategory under Users: Users/userID/activities/activityID
    const userActivitiesRef = ref(database, `Users/${userID}/activities`);
    
    const activity = {
      type: activityData.type,
      title: activityData.title,
      description: activityData.description,
      pointsEarned: activityData.pointsEarned || 0,
      category: activityData.category || null,
      metadata: activityData.metadata || {},
      timestamp: activityData.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const newActivityRef = await push(userActivitiesRef, activity);
    console.log('Activity logged successfully under Users/', userID, '/activities/', newActivityRef.key);
    return newActivityRef.key;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

/**
 * Get user activities with real-time updates
 * @param {string} userID - The user's ID
 * @param {number} limit - Maximum number of activities to fetch
 * @param {function} callback - Callback function to handle activity updates
 * @returns {function} Unsubscribe function
 */
export const getUserActivities = (userID, limit = 10, callback) => {
  if (!userID) {
    console.error('UserID is required to get activities');
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  console.log('Setting up real-time listener for user activities under Users path:', userID);
  
  // Activities are now under: Users/userID/activities
  const userActivitiesRef = ref(database, `Users/${userID}/activities`);

  const unsubscribe = onValue(userActivitiesRef, (snapshot) => {
    console.log('getUserActivities snapshot received for Users/' + userID + '/activities:', snapshot.exists());
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const activitiesList = Object.keys(data)
        .map(activityID => ({
          activityID,
          ...data[activityID],
          timestamp: new Date(data[activityID].timestamp)
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit); // Apply limit
      
      console.log('Processed activities from Users/' + userID + '/activities:', activitiesList);
      callback(activitiesList);
    } else {
      console.log('No activities found under Users/' + userID + '/activities');
      callback([]);
    }
  }, (error) => {
    console.error('Error in getUserActivities for Users/' + userID + '/activities:', error);
    callback([]);
  });

  return unsubscribe;
};

/**
 * Predefined activity templates for common actions
 */
export const ACTIVITY_TEMPLATES = {
  // Recycling activities
  PLASTIC_RECYCLED: (pointsEarned) => ({
    type: ACTIVITY_TYPES.RECYCLING,
    title: 'Plastic bottles recycled',
    description: 'Successfully recycled plastic bottles',
    pointsEarned,
    category: 'Plastic'
  }),

  PAPER_RECYCLED: (pointsEarned) => ({
    type: ACTIVITY_TYPES.RECYCLING,
    title: 'Paper recycled',
    description: 'Successfully recycled paper materials',
    pointsEarned,
    category: 'Paper'
  }),

  GLASS_RECYCLED: (pointsEarned) => ({
    type: ACTIVITY_TYPES.RECYCLING,
    title: 'Glass bottles recycled',
    description: 'Successfully recycled glass containers',
    pointsEarned,
    category: 'Glass'
  }),

  METAL_RECYCLED: (pointsEarned) => ({
    type: ACTIVITY_TYPES.RECYCLING,
    title: 'Metal cans recycled',
    description: 'Successfully recycled metal containers',
    pointsEarned,
    category: 'Metal'
  }),

  // Redemption activities
  REWARD_REDEEMED: (productName, pointsSpent) => ({
    type: ACTIVITY_TYPES.REDEMPTION,
    title: 'Reward redeemed',
    description: `Redeemed ${productName}`,
    pointsEarned: -Math.abs(pointsSpent), // Negative for spending
    category: 'Reward'
  }),

  // Learning activities
  MODULE_COMPLETED: (moduleName, pointsEarned) => ({
    type: ACTIVITY_TYPES.LEARNING,
    title: 'Learning module completed',
    description: `Completed "${moduleName}" module`,
    pointsEarned,
    category: 'Education'
  }),

  // Bonus activities
  DAILY_LOGIN: (pointsEarned) => ({
    type: ACTIVITY_TYPES.BONUS,
    title: 'Daily login bonus',
    description: 'Earned daily login bonus points',
    pointsEarned,
    category: 'Bonus'
  }),

  STREAK_BONUS: (days, pointsEarned) => ({
    type: ACTIVITY_TYPES.BONUS,
    title: `${days}-day streak bonus`,
    description: `Achieved ${days} consecutive days of recycling`,
    pointsEarned,
    category: 'Streak'
  }),

  // Registration activity
  ACCOUNT_CREATED: () => ({
    type: ACTIVITY_TYPES.REGISTRATION,
    title: 'Welcome to SariCycle!',
    description: 'Account successfully created',
    pointsEarned: 0,
    category: 'Registration'
  })
};

/**
 * Helper function to log recycling activity
 * @param {string} userID - The user's ID
 * @param {string} materialType - Type of material (plastic, paper, glass, metal)
 * @param {number} pointsEarned - Points earned from recycling
 * @param {object} metadata - Additional data (e.g., quantity, location)
 */
export const logRecyclingActivity = async (userID, materialType, pointsEarned, metadata = {}) => {
  const templates = {
    plastic: ACTIVITY_TEMPLATES.PLASTIC_RECYCLED,
    paper: ACTIVITY_TEMPLATES.PAPER_RECYCLED,
    glass: ACTIVITY_TEMPLATES.GLASS_RECYCLED,
    metal: ACTIVITY_TEMPLATES.METAL_RECYCLED
  };

  const template = templates[materialType.toLowerCase()];
  if (!template) {
    throw new Error(`Unknown material type: ${materialType}`);
  }

  const activityData = {
    ...template(pointsEarned),
    metadata
  };

  return await logActivity(userID, activityData);
};

/**
 * Helper function to log reward redemption activity
 * @param {string} userID - The user's ID
 * @param {string} productName - Name of the redeemed product
 * @param {number} pointsSpent - Points spent on the reward
 * @param {object} metadata - Additional data about the redemption
 */
export const logRewardRedemption = async (userID, productName, pointsSpent, metadata = {}) => {
  const activityData = {
    ...ACTIVITY_TEMPLATES.REWARD_REDEEMED(productName, pointsSpent),
    metadata
  };

  return await logActivity(userID, activityData);
};

/**
 * Helper function to log learning module completion
 * @param {string} userID - The user's ID
 * @param {string} moduleName - Name of the completed module
 * @param {number} pointsEarned - Points earned from module completion
 * @param {object} metadata - Additional data about the module
 */
export const logLearningActivity = async (userID, moduleName, pointsEarned, metadata = {}) => {
  const activityData = {
    ...ACTIVITY_TEMPLATES.MODULE_COMPLETED(moduleName, pointsEarned),
    metadata
  };

  return await logActivity(userID, activityData);
};

/**
 * Helper function to log account creation activity
 * @param {string} userID - The user's ID
 */
export const logAccountCreation = async (userID) => {
  const activityData = ACTIVITY_TEMPLATES.ACCOUNT_CREATED();
  return await logActivity(userID, activityData);
}; 