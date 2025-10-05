import { 
  logActivity, 
  logRecyclingActivity, 
  logRewardRedemption, 
  logLearningActivity,
  ACTIVITY_TYPES 
} from '../firebase/activities';

/**
 * Add sample activities for a user (for testing purposes)
 * @param {string} userID - The user's ID to add sample activities for
 */
export const addSampleActivities = async (userID) => {
  try {
    console.log('Adding sample activities for user:', userID);

    // Sample recycling activities (2 hours ago)
    await logRecyclingActivity(userID, 'plastic', 50, {
      quantity: 5,
      location: 'Home recycling center'
    });

    // Add activity with custom timestamp (1 day ago)
    await logActivity(userID, {
      type: ACTIVITY_TYPES.REDEMPTION,
      title: 'Reward redeemed',
      description: 'Redeemed Eco-friendly water bottle',
      pointsEarned: -25,
      category: 'Reward',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        productName: 'Eco-friendly water bottle',
        originalPoints: 25
      }
    });

    // Learning activity with custom timestamp
    await logActivity(userID, {
      type: ACTIVITY_TYPES.LEARNING,
      title: 'Learning module completed',
      description: 'Completed "Paper recycling basics" module',
      pointsEarned: 20,
      category: 'Education',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      metadata: {
        moduleId: 2,
        duration: '12 min',
        difficulty: 'Beginner'
      }
    });

    // Glass recycling activity with custom timestamp
    await logActivity(userID, {
      type: ACTIVITY_TYPES.RECYCLING,
      title: 'Glass bottles recycled',
      description: 'Successfully recycled glass containers',
      pointsEarned: 30,
      category: 'Glass',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      metadata: {
        quantity: 3,
        location: 'Community center'
      }
    });

    await logActivity(userID, {
      type: ACTIVITY_TYPES.BONUS,
      title: '7-day streak bonus',
      description: 'Achieved 7 consecutive days of recycling',
      pointsEarned: 100,
      category: 'Streak',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      metadata: {
        streakDays: 7,
        bonusType: 'weekly_streak'
      }
    });

    console.log('Sample activities added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample activities:', error);
    return false;
  }
};

/**
 * Add a quick test activity (for immediate testing)
 * @param {string} userID - The user's ID
 */
export const addQuickTestActivity = async (userID) => {
  try {
    await logActivity(userID, {
      type: ACTIVITY_TYPES.RECYCLING,
      title: 'Test recycling activity',
      description: 'This is a test activity added just now',
      pointsEarned: 25,
      category: 'Test',
      metadata: {
        isTest: true,
        addedAt: new Date().toISOString()
      }
    });
    
    console.log('Quick test activity added!');
    return true;
  } catch (error) {
    console.error('Error adding test activity:', error);
    return false;
  }
};

/**
 * Helper function to be used in browser console for testing
 * Usage: window.addSampleData('userID_here')
 */
if (typeof window !== 'undefined') {
  window.addSampleData = addSampleActivities;
  window.addTestActivity = addQuickTestActivity;
} 