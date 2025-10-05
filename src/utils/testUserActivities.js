import { logActivity, ACTIVITY_TYPES } from '../firebase/activities';

/**
 * Add test activities for the specific user from Firebase
 * User ID: -0VprdxLBz43emWhUU61 (from the screenshot)
 */
export const addTestActivitiesForUser = async () => {
  const userID = '-0VprdxLBz43emWhUU61'; // The user ID from your Firebase
  
  try {
    console.log('Adding test activities for user:', userID);

    // Activity 1: Recent recycling (2 hours ago)
    await logActivity(userID, {
      type: ACTIVITY_TYPES.RECYCLING,
      title: 'Plastic bottles recycled',
      description: 'Successfully recycled 5 plastic bottles',
      pointsEarned: 50,
      category: 'Plastic',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: {
        quantity: 5,
        location: 'Home recycling center'
      }
    });

    // Activity 2: Reward redemption (1 day ago)
    await logActivity(userID, {
      type: ACTIVITY_TYPES.REDEMPTION,
      title: 'Reward redeemed',
      description: 'Redeemed Eco-friendly water bottle',
      pointsEarned: -25,
      category: 'Reward',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        productName: 'Eco-friendly water bottle',
        pointsSpent: 25
      }
    });

    // Activity 3: Learning module (3 days ago)
    await logActivity(userID, {
      type: ACTIVITY_TYPES.LEARNING,
      title: 'Learning module completed',
      description: 'Completed "Paper recycling basics" module',
      pointsEarned: 20,
      category: 'Education',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        moduleId: 2,
        moduleName: 'Paper recycling basics',
        duration: '12 min'
      }
    });

    // Activity 4: Glass recycling (5 days ago)
    await logActivity(userID, {
      type: ACTIVITY_TYPES.RECYCLING,
      title: 'Glass bottles recycled',
      description: 'Successfully recycled glass containers',
      pointsEarned: 30,
      category: 'Glass',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        quantity: 3,
        location: 'Community center'
      }
    });

    // Activity 5: Welcome activity (when account was created)
    await logActivity(userID, {
      type: ACTIVITY_TYPES.REGISTRATION,
      title: 'Welcome to SariCycle!',
      description: 'Account successfully created',
      pointsEarned: 0,
      category: 'Registration',
      timestamp: '2025-07-23T06:00:38.885Z', // Use the actual creation time from Firebase
      metadata: {
        isWelcome: true
      }
    });

    console.log('✅ Test activities added successfully for user:', userID);
    console.log('🔄 You should now see activities in the Recent Activity section');
    return true;
  } catch (error) {
    console.error('❌ Error adding test activities:', error);
    return false;
  }
};

/**
 * Add a single quick test activity
 */
export const addQuickTestForUser = async () => {
  const userID = '-0VprdxLBz43emWhUU61';
  
  try {
    await logActivity(userID, {
      type: ACTIVITY_TYPES.RECYCLING,
      title: 'Test activity',
      description: 'This is a test activity added just now',
      pointsEarned: 25,
      category: 'Test',
      metadata: {
        isTest: true,
        addedAt: new Date().toISOString()
      }
    });
    
    console.log('✅ Quick test activity added for user:', userID);
    return true;
  } catch (error) {
    console.error('❌ Error adding quick test activity:', error);
    return false;
  }
};

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  window.addTestActivitiesForUser = addTestActivitiesForUser;
  window.addQuickTestForUser = addQuickTestForUser;
  
  console.log('🔧 Test functions available:');
  console.log('  - window.addTestActivitiesForUser() - Add multiple test activities');
  console.log('  - window.addQuickTestForUser() - Add single test activity');
} 