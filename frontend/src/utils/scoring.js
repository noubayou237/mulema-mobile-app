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
 * Calculate accuracy based on hearts lost (cauris) — DIRECTIVE MATCHING
 * 
 * - 0 lost: accuracy = 100%
 * - 1 lost: accuracy = 90%
 * - 2 lost: accuracy = 79%
 * - 3 lost: accuracy = 59%
 * - 4 lost: accuracy = 45%
 *
 * @param {number} heartsLost - Number of hearts lost during exercise
 * @returns {number} Accuracy percentage as per directives
 */
export const calculateAccuracy = (heartsLost) => {
  if (heartsLost <= 0) return 100;
  if (heartsLost === 1) return 90;
  if (heartsLost === 2) return 79;
  if (heartsLost === 3) return 59;
  return 45; // 4 or more hearts lost
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
 * Calculate XP score based on accuracy and time — DIRECTIVE MATCHING
 *
 * @param {number} accuracy - Accuracy percentage (100, 90, 79, 59, 45)
 * @param {number} timeInSeconds - Time in seconds
 * @returns {number} XP points earned
 */
export const calculateXP = (accuracy, timeInSeconds) => {
  const isFast = timeInSeconds < 120;
  
  if (accuracy >= 100) return isFast ? 700 : 620;
  if (accuracy >= 90)  return isFast ? 570 : 520;
  if (accuracy >= 79)  return isFast ? 480 : 420;
  if (accuracy >= 59)  return isFast ? 390 : 340;
  if (accuracy >= 45)  return isFast ? 270 : 230;
  
  return isFast ? 100 : 50; // Fallback
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
  const isUnder2Min = timeInSeconds < 120;

  return {
    xp,
    totalXP: xp, // for compatibility
    accuracy,
    timeCategory,
    isUnder2Min, // for endexos.jsx
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
  calculateSessionScore,
  getScoringBreakdown,
  getTimeCategory,
  XP_MATRIX
};
