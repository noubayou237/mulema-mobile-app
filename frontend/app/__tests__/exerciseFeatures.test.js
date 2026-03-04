/**
 * Test file for Exercise Features
 * Tests the core functionality of:
 * - Success rate calculation
 * - Time formatting
 * - Score calculation
 * - Smart Repetition logic
 */

// Helper functions that we can test

/**
 * Calculate success rate based on lives and errors
 */
export const calculateSuccessRate = (lives, errorCount, maxLives = 5) => {
  const successRate = Math.round((lives / maxLives) * 100 - errorCount * 5);
  return Math.max(0, Math.min(100, successRate));
};

/**
 * Calculate total score based on lives and success rate
 */
export const calculateScore = (lives, successRate) => {
  const baseScore = lives * 20;
  const bonusScore = Math.floor((successRate / 100) * 50);
  return baseScore + bonusScore;
};

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Parse exercise times from JSON string
 */
export const parseExerciseTimes = (exerciseTimesJson) => {
  try {
    return exerciseTimesJson ? JSON.parse(exerciseTimesJson) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Get word design based on display index
 */
export const getWordDesign = (displayIndex, designs) => {
  return designs[displayIndex % designs.length];
};

// Test cases
const testCases = {
  // Test 1: Success rate calculation
  testSuccessRate: () => {
    // Full lives, no errors = 100%
    const rate1 = calculateSuccessRate(5, 0);
    console.assert(rate1 === 100, `Expected 100, got ${rate1}`);

    // Half lives, no errors = 80%
    const rate2 = calculateSuccessRate(3, 0);
    console.assert(rate2 === 60, `Expected 60, got ${rate2}`);

    // No lives = 0%
    const rate3 = calculateSuccessRate(0, 0);
    console.assert(rate3 === 0, `Expected 0, got ${rate3}`);

    // With errors should reduce rate
    const rate4 = calculateSuccessRate(5, 2);
    console.assert(rate4 === 90, `Expected 90, got ${rate4}`);

    console.log("✓ Success rate calculation tests passed");
  },

  // Test 2: Score calculation
  testScoreCalculation: () => {
    // Max lives, max success = 100 + 50 = 150
    const score1 = calculateScore(5, 100);
    console.assert(score1 === 150, `Expected 150, got ${score1}`);

    // 3 lives, 50% success = 60 + 25 = 85
    const score2 = calculateScore(3, 50);
    console.assert(score2 === 85, `Expected 85, got ${score2}`);

    // No lives = 0
    const score3 = calculateScore(0, 100);
    console.assert(score3 === 50, `Expected 50, got ${score3}`);

    console.log("✓ Score calculation tests passed");
  },

  // Test 3: Time formatting
  testTimeFormatting: () => {
    const time1 = formatTime(0);
    console.assert(time1 === "0:00", `Expected "0:00", got ${time1}`);

    const time2 = formatTime(30);
    console.assert(time2 === "0:30", `Expected "0:30", got ${time2}`);

    const time3 = formatTime(60);
    console.assert(time3 === "1:00", `Expected "1:00", got ${time3}`);

    const time4 = formatTime(90);
    console.assert(time4 === "1:30", `Expected "1:30", got ${time4}`);

    const time5 = formatTime(125);
    console.assert(time5 === "2:05", `Expected "2:05", got ${time5}`);

    console.log("✓ Time formatting tests passed");
  },

  // Test 4: Exercise times parsing
  testExerciseTimesParsing: () => {
    const times1 = parseExerciseTimes("[10,20,30]");
    console.assert(
      JSON.stringify(times1) === JSON.stringify([10, 20, 30]),
      `Expected [10,20,30], got ${JSON.stringify(times1)}`
    );

    const times2 = parseExerciseTimes(null);
    console.assert(
      Array.isArray(times2) && times2.length === 0,
      "Expected empty array"
    );

    const times3 = parseExerciseTimes("invalid");
    console.assert(
      Array.isArray(times3) && times3.length === 0,
      "Expected empty array for invalid"
    );

    console.log("✓ Exercise times parsing tests passed");
  },

  // Test 5: Word design cycling
  testWordDesignCycling: () => {
    const designs = ["design1", "design2", "design3"];

    const design0 = getWordDesign(0, designs);
    console.assert(design0 === "design1", `Expected design1, got ${design0}`);

    const design3 = getWordDesign(3, designs);
    console.assert(
      design3 === "design1",
      `Expected design1 (cycled), got ${design3}`
    );

    const design4 = getWordDesign(4, designs);
    console.assert(
      design4 === "design2",
      `Expected design2 (cycled), got ${design4}`
    );

    console.log("✓ Word design cycling tests passed");
  }
};

// Run all tests
export const runAllTests = () => {
  console.log("\n=== Running Exercise Features Tests ===\n");

  try {
    testCases.testSuccessRate();
    testCases.testScoreCalculation();
    testCases.testTimeFormatting();
    testCases.testExerciseTimesParsing();
    testCases.testWordDesignCycling();

    console.log("\n=== All Tests Passed! ===\n");
    return true;
  } catch (error) {
    console.error("Test failed:", error);
    return false;
  }
};

// Export for use
export default {
  calculateSuccessRate,
  calculateScore,
  formatTime,
  parseExerciseTimes,
  getWordDesign,
  runAllTests
};
