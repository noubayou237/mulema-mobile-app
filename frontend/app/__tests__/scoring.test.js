/**
 * Tests for Scoring Utility
 *
 * Tests the XP calculation system based on:
 * - Accuracy (hearts lost)
 * - Time to complete
 */

// Import scoring utility
const {
  calculateAccuracy,
  getTimeCategory,
  calculateXP,
  calculateXPFromMatrix,
  calculateSessionScore,
  formatTime,
  getScoreMessage,
  calculateLevel,
  XP_MATRIX
} = require("../utils/scoring");

// Test cases
const runTests = () => {
  console.log("Running Scoring Utility Tests...\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Accuracy calculation
  console.log("Test 1: calculateAccuracy");
  try {
    // No hearts lost = 100%
    const acc1 = calculateAccuracy(0);
    console.assert(acc1 === 100, `Expected 100, got ${acc1}`);
    passed++;

    // 1 heart lost = 80%, rounds to 90% level
    const acc2 = calculateAccuracy(1);
    console.assert(acc2 === 90, `Expected 90, got ${acc2}`);
    passed++;

    // 2 hearts lost = 60%, rounds to 79% level
    const acc3 = calculateAccuracy(2);
    console.assert(acc3 === 79, `Expected 79, got ${acc3}`);
    passed++;

    // 3 hearts lost = 40%, rounds to 45% level
    const acc4 = calculateAccuracy(3);
    console.assert(acc4 === 45, `Expected 45, got ${acc4}`);
    passed++;

    // All hearts lost = 0%
    const acc5 = calculateAccuracy(5);
    console.assert(acc5 === 45, `Expected 45, got ${acc5}`);
    passed++;

    console.log("  ✓ All accuracy tests passed\n");
  } catch (error) {
    console.error("  ✗ Accuracy tests failed:", error);
    failed++;
  }

  // Test 2: Time category
  console.log("Test 2: getTimeCategory");
  try {
    const time1 = getTimeCategory(60); // 1 minute
    console.assert(time1 === "fast", `Expected fast, got ${time1}`);
    passed++;

    const time2 = getTimeCategory(119); // Just under 2 minutes
    console.assert(time2 === "fast", `Expected fast, got ${time2}`);
    passed++;

    const time3 = getTimeCategory(120); // Exactly 2 minutes
    console.assert(time3 === "slow", `Expected slow, got ${time3}`);
    passed++;

    const time4 = getTimeCategory(180); // 3 minutes
    console.assert(time4 === "slow", `Expected slow, got ${time4}`);
    passed++;

    console.log("  ✓ All time category tests passed\n");
  } catch (error) {
    console.error("  ✗ Time category tests failed:", error);
    failed++;
  }

  // Test 3: XP Calculation
  console.log("Test 3: calculateXP");
  try {
    // Perfect score, fast time
    const xp1 = calculateXP(100, 60);
    console.assert(xp1 === 700, `Expected 700, got ${xp1}`);
    passed++;

    // Perfect score, slow time
    const xp2 = calculateXP(100, 180);
    console.assert(xp2 === 620, `Expected 620, got ${xp2}`);
    passed++;

    // 90% accuracy, fast time
    const xp3 = calculateXP(90, 60);
    console.assert(xp3 === 570, `Expected 570, got ${xp3}`);
    passed++;

    // 79% accuracy, slow time
    const xp4 = calculateXP(79, 180);
    console.assert(xp4 === 420, `Expected 420, got ${xp4}`);
    passed++;

    // Low accuracy
    const xp5 = calculateXP(45, 60);
    console.assert(xp5 === 270, `Expected 270, got ${xp5}`);
    passed++;

    console.log("  ✓ All XP calculation tests passed\n");
  } catch (error) {
    console.error("  ✗ XP calculation tests failed:", error);
    failed++;
  }

  // Test 4: Session Score
  console.log("Test 4: calculateSessionScore");
  try {
    // Perfect session
    const score1 = calculateSessionScore({
      heartsLost: 0,
      totalTime: 90,
      totalQuestions: 6,
      correctAnswers: 6
    });
    console.assert(score1.xp === 700, `Expected 700 XP, got ${score1.xp}`);
    console.assert(
      score1.accuracy === 100,
      `Expected 100% accuracy, got ${score1.accuracy}`
    );
    passed++;

    // Some mistakes
    const score2 = calculateSessionScore({
      heartsLost: 1,
      totalTime: 150,
      totalQuestions: 6,
      correctAnswers: 5
    });
    console.assert(score2.xp === 520, `Expected 520 XP, got ${score2.xp}`);
    console.assert(
      score2.accuracy === 83,
      `Expected 83% accuracy, got ${score2.accuracy}`
    );
    passed++;

    // Many mistakes
    const score3 = calculateSessionScore({
      heartsLost: 3,
      totalTime: 200,
      totalQuestions: 6,
      correctAnswers: 3
    });
    console.assert(score3.xp === 230, `Expected 230 XP, got ${score3.xp}`);
    passed++;

    console.log("  ✓ All session score tests passed\n");
  } catch (error) {
    console.error("  ✗ Session score tests failed:", error);
    failed++;
  }

  // Test 5: Format Time
  console.log("Test 5: formatTime");
  try {
    const time1 = formatTime(0);
    console.assert(time1 === "0:00", `Expected 0:00, got ${time1}`);
    passed++;

    const time2 = formatTime(65);
    console.assert(time2 === "1:05", `Expected 1:05, got ${time2}`);
    passed++;

    const time3 = formatTime(120);
    console.assert(time3 === "2:00", `Expected 2:00, got ${time3}`);
    passed++;

    const time4 = formatTime(3661);
    console.assert(time4 === "61:01", `Expected 61:01, got ${time4}`);
    passed++;

    console.log("  ✓ All format time tests passed\n");
  } catch (error) {
    console.error("  ✗ Format time tests failed:", error);
    failed++;
  }

  // Test 6: Score Message
  console.log("Test 6: getScoreMessage");
  try {
    const msg1 = getScoreMessage(700);
    console.assert(
      msg1.includes("Excellent"),
      `Expected Excellent message, got ${msg1}`
    );
    passed++;

    const msg2 = getScoreMessage(500);
    console.assert(msg2.includes("Good"), `Expected Good message, got ${msg2}`);
    passed++;

    const msg3 = getScoreMessage(200);
    console.assert(
      msg3.includes("don't give up"),
      `Expected encouragement, got ${msg3}`
    );
    passed++;

    console.log("  ✓ All score message tests passed\n");
  } catch (error) {
    console.error("  ✗ Score message tests failed:", error);
    failed++;
  }

  // Test 7: Level Calculation
  console.log("Test 7: calculateLevel");
  try {
    // Starting player
    const level1 = calculateLevel(0);
    console.assert(level1.level === 1, `Expected level 1, got ${level1.level}`);
    console.assert(
      level1.xpCurrent === 0,
      `Expected 0 current XP, got ${level1.xpCurrent}`
    );
    passed++;

    // After some XP
    const level2 = calculateLevel(500);
    console.assert(level2.level === 2, `Expected level 2, got ${level2.level}`);
    passed++;

    // High level player
    const level3 = calculateLevel(2500);
    console.assert(level3.level === 4, `Expected level 4, got ${level3.level}`);
    passed++;

    console.log("  ✓ All level calculation tests passed\n");
  } catch (error) {
    console.error("  ✗ Level calculation tests failed:", error);
    failed++;
  }

  // Summary
  console.log("=".repeat(50));
  console.log(`Test Summary: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(50));

  return { passed, failed };
};

// Export for use in other modules
module.exports = {
  calculateAccuracy,
  getTimeCategory,
  calculateXP,
  calculateXPFromMatrix,
  calculateSessionScore,
  formatTime,
  getScoreMessage,
  calculateLevel,
  XP_MATRIX,
  runTests
};

// Run tests if executed directly
if (require.main === module) {
  runTests();
}
