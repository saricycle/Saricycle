import { 
  updateAchievementProgress, 
  checkAndUpdateAchievements,
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_DEFINITIONS
} from '../firebase/achievements';

/**
 * Test utilities for achievement functionality
 * Use these functions to test achievement unlocking and progression
 */

/**
 * Test achievement unlocking with sample data
 * @param {string} userID - The user's ID to test with
 */
export const testAchievements = async (userID) => {
  if (!userID) {
    console.error('UserID required for testing achievements');
    return;
  }

  console.log('🎯 Testing achievements for user:', userID);

  // Test data for different achievement scenarios
  const testScenarios = [
    {
      name: 'New User (0 progress)',
      stats: {
        totalPointsEarned: 0,
        totalPointsRedeemed: 0,
        recyclingActivitiesCount: 0,
        learningActivitiesCount: 0,
        recyclingStreak: 0,
        totalWasteReduced: 0,
        consecutiveDays: 0,
        isEarlyAdopter: false
      }
    },
    {
      name: 'Active Recycler (partial progress)',
      stats: {
        totalPointsEarned: 500,
        totalPointsRedeemed: 100,
        recyclingActivitiesCount: 25,
        learningActivitiesCount: 5,
        recyclingStreak: 3,
        totalWasteReduced: 50,
        consecutiveDays: 15,
        isEarlyAdopter: false
      }
    },
    {
      name: 'Eco Warrior (multiple achievements)',
      stats: {
        totalPointsEarned: 1200,
        totalPointsRedeemed: 600,
        recyclingActivitiesCount: 60,
        learningActivitiesCount: 12,
        recyclingStreak: 8,
        totalWasteReduced: 120,
        consecutiveDays: 35,
        isEarlyAdopter: true
      }
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n📊 Testing scenario: ${scenario.name}`);
    try {
      const unlockedAchievements = await checkAndUpdateAchievements(userID, scenario.stats);
      console.log(`✅ Unlocked achievements:`, unlockedAchievements);
    } catch (error) {
      console.error(`❌ Error in scenario ${scenario.name}:`, error);
    }
  }
};

/**
 * Manually unlock a specific achievement for testing
 * @param {string} userID - The user's ID
 * @param {string} achievementType - Achievement type to unlock
 * @param {number} progress - Progress value (should meet threshold)
 */
export const forceUnlockAchievement = async (userID, achievementType, progress = null) => {
  if (!userID || !achievementType) {
    console.error('UserID and achievementType required');
    return;
  }

  const achievement = ACHIEVEMENT_DEFINITIONS[achievementType];
  if (!achievement) {
    console.error('Invalid achievement type:', achievementType);
    return;
  }

  const progressValue = progress !== null ? progress : achievement.criteria.threshold;

  console.log(`🔓 Force unlocking ${achievement.title} for user ${userID} with progress ${progressValue}`);

  try {
    const wasUnlocked = await updateAchievementProgress(userID, achievementType, progressValue);
    console.log(wasUnlocked ? '✅ Achievement unlocked!' : '⚠️ Achievement not unlocked (insufficient progress)');
    return wasUnlocked;
  } catch (error) {
    console.error('❌ Error unlocking achievement:', error);
    return false;
  }
};

/**
 * Test all achievements with incremental progress
 * @param {string} userID - The user's ID
 */
export const testProgressiveAchievements = async (userID) => {
  if (!userID) {
    console.error('UserID required');
    return;
  }

  console.log('📈 Testing progressive achievement unlocking for user:', userID);

  const achievementTests = [
    { type: ACHIEVEMENT_TYPES.ECO_WARRIOR, progressSteps: [0, 250, 500, 750, 1000, 1200] },
    { type: ACHIEVEMENT_TYPES.SMART_SPENDER, progressSteps: [0, 100, 250, 400, 500, 600] },
    { type: ACHIEVEMENT_TYPES.RECYCLING_MASTER, progressSteps: [0, 10, 25, 40, 50, 60] },
    { type: ACHIEVEMENT_TYPES.LEARNING_ENTHUSIAST, progressSteps: [0, 2, 5, 8, 10, 12] },
    { type: ACHIEVEMENT_TYPES.STREAK_CHAMPION, progressSteps: [0, 2, 4, 6, 7, 10] }
  ];

  for (const test of achievementTests) {
    console.log(`\n🎯 Testing ${test.type}:`);
    
    for (const progress of test.progressSteps) {
      try {
        const wasUnlocked = await updateAchievementProgress(userID, test.type, progress);
        const status = wasUnlocked ? '🔓 UNLOCKED' : `📊 ${progress} progress`;
        console.log(`  Progress ${progress}: ${status}`);
      } catch (error) {
        console.error(`  ❌ Error at progress ${progress}:`, error);
      }
    }
  }
};

/**
 * Get achievement progress summary for a user (for console logging)
 * @param {Array} achievements - User's achievements array
 */
export const logAchievementSummary = (achievements) => {
  if (!achievements || achievements.length === 0) {
    console.log('📊 No achievements found');
    return;
  }

  console.log('📊 Achievement Summary:');
  console.log(`   Total: ${achievements.length}`);
  console.log(`   Unlocked: ${achievements.filter(a => a.isUnlocked).length}`);
  console.log(`   In Progress: ${achievements.filter(a => !a.isUnlocked && a.progress.percentage > 0).length}`);
  console.log(`   Locked: ${achievements.filter(a => !a.isUnlocked && a.progress.percentage === 0).length}`);

  console.log('\n🏆 Unlocked Achievements:');
  achievements
    .filter(a => a.isUnlocked)
    .forEach(a => {
      console.log(`   ✅ ${a.title} - ${a.description}`);
    });

  console.log('\n📈 In Progress:');
  achievements
    .filter(a => !a.isUnlocked && a.progress.percentage > 0)
    .forEach(a => {
      console.log(`   🔄 ${a.title} - ${a.progress.current}/${a.progress.target} (${Math.round(a.progress.percentage)}%)`);
    });
};

/**
 * Reset all achievements for a user (for testing purposes)
 * WARNING: This will reset ALL achievement progress!
 * @param {string} userID - The user's ID
 */
export const resetAllAchievements = async (userID) => {
  if (!userID) {
    console.error('UserID required');
    return;
  }

  console.warn('⚠️ RESETTING ALL ACHIEVEMENTS for user:', userID);

  try {
    const resetPromises = Object.keys(ACHIEVEMENT_DEFINITIONS).map(achievementType => 
      updateAchievementProgress(userID, achievementType, 0)
    );

    await Promise.all(resetPromises);
    console.log('✅ All achievements reset to 0 progress');
  } catch (error) {
    console.error('❌ Error resetting achievements:', error);
  }
};

// Example usage functions that can be called from browser console
export const exampleUsage = {
  // Test basic functionality
  testBasic: (userID) => testAchievements(userID),
  
  // Test progressive unlocking
  testProgressive: (userID) => testProgressiveAchievements(userID),
  
  // Unlock specific achievement
  unlockEcoWarrior: (userID) => forceUnlockAchievement(userID, ACHIEVEMENT_TYPES.ECO_WARRIOR),
  unlockSmartSpender: (userID) => forceUnlockAchievement(userID, ACHIEVEMENT_TYPES.SMART_SPENDER),
  
  // Reset all (be careful!)
  resetAll: (userID) => resetAllAchievements(userID)
};

// Log available test functions
console.log('🧪 Achievement Test Utils Available:');
console.log('   testAchievements(userID)');
console.log('   forceUnlockAchievement(userID, achievementType)');
console.log('   testProgressiveAchievements(userID)');
console.log('   resetAllAchievements(userID)');
console.log('   logAchievementSummary(achievements)');
console.log('\n   Available achievement types:', Object.values(ACHIEVEMENT_TYPES)); 