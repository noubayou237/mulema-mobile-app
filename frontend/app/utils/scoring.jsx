/**
 * Scoring utilities for the exercise system
 * 
 * Features:
 * - Accuracy calculation based on hearts lost (cowries)
 * - XP/Shrimp scoring based on accuracy and time
 */

// Scoring matrix based on accuracy and time
const SCORING_MATRIX = {
  // Accuracy: 100% (0 hearts lost)
  100: {
    under2min: 700,
    over2min: 620
  },
  // Accuracy: 90% (1 heart lost)
  90: {
    under2min: 570,
    over2min: 520
  },
  // Accuracy: 79% (2 hearts lost)
  79: {
    under2min: 480,
    over2min: 420
  },
  // Accuracy: 59% (3 hearts lost)
  59: {
    under2min: 390,
    over2min: 340
  },
  // Accuracy: 45% (4 hearts lost)
  45: {
    under2min: 270,
    over2min: 230
  },
  // Accuracy: 0% (5 hearts lost - game over)
  0: {
    under2min: 0,
    over2min: 0
  }
};

// Accuracy mapping based on hearts lost
const ACCURACY_MAP = {
  0: 100,  // 0 hearts lost = 100%
  1: 90,   // 1 heart lost = 90%
  2: 79,   // 2 hearts lost = 79%
  3: 59,   // 3 hearts lost = 59%
  4: 45,   // 4 hearts lost = 45%
  5: 0     // 5 hearts lost = 0%
};

// Time threshold in seconds (2 minutes)
const TIME_THRESHOLD = 120; // 2 minutes = 120 seconds

/**
 * Calculate accuracy based on hearts lost
 * @param {number} heartsLost - Number of hearts/cowries lost (0-5)
 * @returns {number} Accuracy percentage
 */
export const calculateAccuracy = (heartsLost) => {
  const normalizedHearts = Math.min(5, Math.max(0, Math.round(heartsLost)));
  return ACCURACY_MAP[normalizedHearts] || 0;
};

/**
 * Get the XP/Shrimp score based on accuracy and time
 * @param {number} accuracy - Accuracy percentage (0-100)
 * @param {number} timeInSeconds - Time taken in seconds
 * @returns {number} XP/Shrimp points earned
 */
export const calculateXP = (accuracy, timeInSeconds) => {
  // Find the closest accuracy key
  let accuracyKey = 0;
  const accuracyKeys = Object.keys(SCORING_MATRIX).map(Number).sort((a, b) => b - a);
  
  for (const key of accuracyKeys) {
    if (accuracy >= key) {
      accuracyKey = key;
      break;
    }
  }
  
  const scoreData = SCORING_MATRIX[accuracyKey];
  if (!scoreData) return 0;
  
  // Check if time is under or over 2 minutes
  const isUnder2Min = timeInSeconds < TIME_THRESHOLD;
  
  return isUnder2Min ? scoreData.under2min : scoreData.over2min;
};

/**
 * Calculate total score with bonus for completion
 * @param {number} baseXP - Base XP earned
 * @param {boolean} completedAll - Whether all exercises were completed
 * @param {number} bonusPerExercise - Bonus XP per completed exercise
 * @returns {number} Total XP
 */
export const calculateTotalScore = (baseXP, completedAll = true, bonusPerExercise = 10) => {
  if (!completedAll) {
    return Math.floor(baseXP * 0.5); // 50% penalty for not completing
  }
  return baseXP;
};

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Get scoring breakdown for display
 * @param {number} heartsLost - Number of hearts lost
 * @param {number} timeInSeconds - Time taken in seconds
 * @returns {object} Breakdown of scoring
 */
export const getScoringBreakdown = (heartsLost, timeInSeconds) => {
  const accuracy = calculateAccuracy(heartsLost);
  const baseXP = calculateXP(accuracy, timeInSeconds);
  const totalXP = calculateTotalScore(baseXP, true);
  const isUnder2Min = timeInSeconds < TIME_THRESHOLD;
  
  return {
    heartsLost,
    accuracy,
    timeInSeconds,
    timeCategory: isUnder2Min ? "under2min" : "over2min",
    baseXP,
    totalXP,
    isUnder2Min
  };
};

export default {
  calculateAccuracy,
  calculateXP,
  calculateTotalScore,
  formatTime,
  getScoringBreakdown,
  TIME_THRESHOLD
};
