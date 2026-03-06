/**
 * Scoring Utility for Mulema Language Learning App
 *
 * Implements the XP (Crevettes) system based on:
 * - Accuracy (based on hearts lost)
 * - Time to complete exercise
 *
 * XP Matrix:
 * | Time    | Accuracy | Score |
 * |---------|----------|-------|
 * | < 2 min | 100%     | 700   |
 * | > 2 min | 100%     | 620   |
 * | < 2 min | 90%      | 570   |
 * | > 2 min | 90%      | 520   |
 * | < 2 min | 79%      | 480   |
 * | > 2 min | 79%      | 420   |
 * | < 2 min | 59%      | 390   |
 * | > 2 min | 59%      | 340   |
 * | < 2 min | 45%      | 270   |
 * | > 2 min | 45%      | 230   |
 */

// XP Matrix based on accuracy and time
const XP_MATRIX = {
  // 100% accuracy
  100: { fast: 700, slow: 620 }, // < 2 min = 700, > 2 min = 620
  // 90% accuracy
  90: { fast: 570, slow: 520 },
  // 79% accuracy
  79: { fast: 480, slow: 420 },
  // 59% accuracy
  59: { fast: 390, slow: 340 },
  // 45% accuracy
  45: { fast: 270, slow: 230 },
  // Below 45%
  0: { fast: 100, slow: 50 }
};

/**
 * Calculate accuracy based on hearts lost (cauris)
 *
 * @param {number} heartsLost - Number of hearts lost during exercise
 * @param {number} maxHearts - Maximum hearts (default: 5)
 * @returns {number} Accuracy percentage (0-100)
 */
export const calculateAccuracy = (heartsLost, maxHearts = 5) => {
  // If no hearts lost, accuracy is 100%
  if (heartsLost === 0) return 100;

  // Calculate accuracy based on hearts remaining
  const heartsRemaining = maxHearts - heartsLost;
  const accuracy = Math.round((heartsRemaining / maxHearts) * 100);

  // Map to predefined accuracy levels
  if (accuracy >= 90) return 100;
  if (accuracy >= 70) return 90;
  if (accuracy >= 50) return 79;
  if (accuracy >= 30) return 59;
  return 45;
};

/**
 * Determine if time is "fast" or "slow"
 *
 * @param {number} timeInSeconds - Time in seconds
 * @returns {string} "fast" if < 120 seconds, "slow" otherwise
 */
export const getTimeCategory = (timeInSeconds) => {
  return timeInSeconds < 120 ? "fast" : "slow";
};

/**
 * Calculate XP score based on accuracy and time
 *
 * @param {number} accuracy - Accuracy percentage (0-100)
 * @param {number} timeInSeconds - Time in seconds
 * @returns {number} XP points earned
 */
export const calculateXP = (accuracy, timeInSeconds) => {
  // Round accuracy to nearest known value
  let accuracyLevel;
  if (accuracy >= 90) accuracyLevel = 100;
  else if (accuracy >= 70) accuracyLevel = 90;
  else if (accuracy >= 50) accuracyLevel = 79;
  else if (accuracy >= 30) accuracyLevel = 59;
  else accuracyLevel = 45;

  const timeCategory = getTimeCategory(timeInSeconds);
  const xp =
    XP_MATRIX[accuracyLevel]?.[timeCategory] || XP_MATRIX[0][timeCategory];

  return xp;
};

/**
 * Alternative XP calculation using full matrix lookup
 *
 * @param {number} accuracyPercent - Exact accuracy percentage
 * @param {number} timeInSeconds - Time in seconds
 * @returns {number} XP points
 */
export const calculateXPFromMatrix = (accuracyPercent, timeInSeconds) => {
  const timeCategory = timeInSeconds < 120 ? "fast" : "slow";

  // Find the closest accuracy level
  const accuracyLevels = [100, 90, 79, 59, 45, 0];
  let closestLevel = 0;

  for (const level of accuracyLevels) {
    if (accuracyPercent >= level) {
      closestLevel = level;
      break;
    }
  }

  return XP_MATRIX[closestLevel]?.[timeCategory] || XP_MATRIX[0][timeCategory];
};

/**
 * Calculate score for a completed exercise session
 *
 * @param {Object} sessionData - Session data object
 * @param {number} sessionData.heartsLost - Hearts lost during session
 * @param {number} sessionData.totalTime - Total time in seconds
 * @param {number} sessionData.totalQuestions - Total questions attempted
 * @param {number} sessionData.correctAnswers - Correct answers
 * @returns {Object} Score result with XP and details
 */
export const calculateSessionScore = (sessionData) => {
  const {
    heartsLost = 0,
    totalTime = 0,
    totalQuestions = 0,
    correctAnswers = 0
  } = sessionData;

  // Calculate accuracy percentage
  const accuracyPercent =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  // Get accuracy level
  const accuracyLevel = calculateAccuracy(heartsLost);

  // Calculate XP
  const xp = calculateXP(accuracyLevel, totalTime);

  return {
    xp,
    accuracy: accuracyPercent,
    accuracyLevel,
    timeCategory: getTimeCategory(totalTime),
    timeInSeconds: totalTime,
    heartsLost,
    totalQuestions,
    correctAnswers
  };
};

/**
 * Get scoring breakdown for display
 *
 * @param {number} heartsLost - Number of hearts lost
 * @param {number} timeInSeconds - Time taken
 * @returns {Object} Breakdown object
 */
export const getScoringBreakdown = (heartsLost, timeInSeconds) => {
  const accuracy = calculateAccuracy(heartsLost);
  const xp = calculateXP(accuracy, timeInSeconds);
  const timeCategory = getTimeCategory(timeInSeconds);

  return {
    xp,
    accuracy,
    timeCategory,
    timeFormatted:
      timeInSeconds < 60
        ? `${timeInSeconds}s`
        : `${Math.floor(timeInSeconds / 60)}m ${timeInSeconds % 60}s`,
    heartsLost,
    bonus: timeCategory === "fast" ? "Speed bonus!" : null
  };
};

export default {
  calculateAccuracy,
  calculateXP,
  calculateXPFromMatrix,
  calculateSessionScore,
  getScoringBreakdown,
  getTimeCategory,
  XP_MATRIX
};
