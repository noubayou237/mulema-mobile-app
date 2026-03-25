/**
 * Tests for Spaced Repetition (SM-2 Algorithm)
 * 
 * Tests the core SM-2 algorithm functions without React dependencies.
 */

const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const INTERVALS = [1, 3, 7, 14, 30, 60];

/**
 * Calculate next review interval using SM-2 algorithm
 */
const calculateNextInterval = (successCount, easeFactor = 2.5) => {
  const index = Math.min(successCount, INTERVALS.length - 1);
  return Math.round(INTERVALS[index] * easeFactor);
};

/**
 * Update ease factor based on answer quality
 */
const updateEaseFactor = (currentEF, quality) => {
  const newEF = currentEF + (0.1 - (100 - quality) * (0.08 + (100 - quality) * 0.02));
  return Math.max(MIN_EASE_FACTOR, newEF);
};

/**
 * Format next review date
 */
const formatNextReview = (date) => {
  if (!date) return 'Not scheduled';
  
  const now = new Date();
  const reviewDate = new Date(date);
  const diffTime = reviewDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'Due now';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.round(diffDays / 7)} weeks`;
  return `In ${Math.round(diffDays / 30)} months`;
};

// Test runner
const runTests = () => {
  console.log('\n=== Running Spaced Repetition Tests ===\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Initial interval calculation
  const test1 = () => {
    try {
      // successCount = 0, easeFactor = 2.5
      // index = min(0, 5) = 0, interval = 1 * 2.5 = 2.5 -> round to 3
      const interval = calculateNextInterval(0, 2.5);
      console.assert(interval === 3, `Expected 3, got ${interval}`);
      
      console.log('✓ Test 1: Initial interval calculation');
      passed++;
    } catch (error) {
      console.error('✗ Test 1 failed:', error.message);
      failed++;
    }
  };

  // Test 2: Second success interval
  const test2 = () => {
    try {
      // successCount = 1, easeFactor = 2.5
      // index = min(1, 5) = 1, interval = 3 * 2.5 = 7.5 -> round to 8
      const interval = calculateNextInterval(1, 2.5);
      console.assert(interval === 8, `Expected 8, got ${interval}`);
      
      console.log('✓ Test 2: Second success interval');
      passed++;
    } catch (error) {
      console.error('✗ Test 2 failed:', error.message);
      failed++;
    }
  };

  // Test 3: Multiple successes
  const test3 = () => {
    try {
      // successCount = 3, easeFactor = 2.5
      // index = min(3, 5) = 3, interval = 14 * 2.5 = 35 -> round to 35
      const interval = calculateNextInterval(3, 2.5);
      console.assert(interval === 35, `Expected 35, got ${interval}`);
      
      console.log('✓ Test 3: Multiple successes interval');
      passed++;
    } catch (error) {
      console.error('✗ Test 3 failed:', error.message);
      failed++;
    }
  };

  // Test 4: Maximum interval
  const test4 = () => {
    try {
      // successCount = 10 (beyond array), easeFactor = 2.5
      // index = min(10, 5) = 5, interval = 60 * 2.5 = 150 -> round to 150
      const interval = calculateNextInterval(10, 2.5);
      console.assert(interval === 150, `Expected 150, got ${interval}`);
      
      console.log('✓ Test 4: Maximum interval');
      passed++;
    } catch (error) {
      console.error('✗ Test 4 failed:', error.message);
      failed++;
    }
  };

  // Test 5: Lower ease factor reduces interval
  const test5 = () => {
    try {
      // successCount = 3, easeFactor = 1.5 (lower)
      // index = min(3, 5) = 3, interval = 14 * 1.5 = 21 -> round to 21
      const interval = calculateNextInterval(3, 1.5);
      console.assert(interval === 21, `Expected 21, got ${interval}`);
      
      console.log('✓ Test 5: Lower ease factor');
      passed++;
    } catch (error) {
      console.error('✗ Test 5 failed:', error.message);
      failed++;
    }
  };

  // Test 6: Ease factor decreases on failure
  const test6 = () => {
    try {
      // currentEF = 2.5, quality = 0 (complete failure)
      const newEF = updateEaseFactor(2.5, 0);
      console.assert(newEF < 2.5, `Ease factor should decrease, got ${newEF}`);
      console.assert(newEF >= MIN_EASE_FACTOR, `Ease factor should not go below ${MIN_EASE_FACTOR}`);
      
      console.log('✓ Test 6: Ease factor decreases on failure');
      passed++;
    } catch (error) {
      console.error('✗ Test 6 failed:', error.message);
      failed++;
    }
  };

  // Test 7: Ease factor minimum
  const test7 = () => {
    try {
      // Multiple failures should not go below minimum
      let ef = 2.5;
      for (let i = 0; i < 20; i++) {
        ef = updateEaseFactor(ef, 0);
      }
      console.assert(ef === MIN_EASE_FACTOR, `Ease factor should be ${MIN_EASE_FACTOR}, got ${ef}`);
      
      console.log('✓ Test 7: Ease factor minimum');
      passed++;
    } catch (error) {
      console.error('✗ Test 7 failed:', error.message);
      failed++;
    }
  };

  // Test 8: Format next review - null date
  const test8 = () => {
    try {
      const result = formatNextReview(null);
      console.assert(result === 'Not scheduled', `Expected "Not scheduled", got ${result}`);
      
      console.log('✓ Test 8: Format null date');
      passed++;
    } catch (error) {
      console.error('✗ Test 8 failed:', error.message);
      failed++;
    }
  };

  // Test 9: Format next review - past date
  const test9 = () => {
    try {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      const result = formatNextReview(pastDate);
      console.assert(result === 'Due now', `Expected "Due now", got ${result}`);
      
      console.log('✓ Test 9: Format past date');
      passed++;
    } catch (error) {
      console.error('✗ Test 9 failed:', error.message);
      failed++;
    }
  };

  // Test 10: Format next review - tomorrow
  const test10 = () => {
    try {
      const tomorrow = new Date(Date.now() + 86400000); // Tomorrow
      const result = formatNextReview(tomorrow);
      console.assert(result === 'Tomorrow', `Expected "Tomorrow", got ${result}`);
      
      console.log('✓ Test 10: Format tomorrow');
      passed++;
    } catch (error) {
      console.error('✗ Test 10 failed:', error.message);
      failed++;
    }
  };

  // Run all tests
  test1();
  test2();
  test3();
  test4();
  test5();
  test6();
  test7();
  test8();
  test9();
  test10();

  console.log(`\n=== Test Results: ${passed} passed, ${failed} failed ===\n`);
  
  if (failed > 0) {
    process.exit(1);
  }
};

// Run tests
runTests();
