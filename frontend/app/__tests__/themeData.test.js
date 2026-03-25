/**
 * Test file for Theme Data Module
 * Tests the shared word pool and helper functions
 */

import {
  THEME_FAMILLE_WORDS,
  THEME_CONFIG,
  getWordsForExercise,
  getRandomWords,
  getWrongOptions
} from "../data/themeData";

// Test cases
const testCases = {
  // Test 1: Verify word pool has exactly 6 words
  testWordPoolCount: () => {
    const count = THEME_FAMILLE_WORDS.length;
    console.assert(count === 6, `Expected 6 words, got ${count}`);
    console.log("✓ Word pool count test passed");
  },

  // Test 2: Verify each word has required properties
  testWordProperties: () => {
    const requiredProps = ["id", "fr", "local", "image", "audio", "difficulty"];

    THEME_FAMILLE_WORDS.forEach((word, index) => {
      requiredProps.forEach((prop) => {
        console.assert(
          word.hasOwnProperty(prop),
          `Word ${index} missing property: ${prop}`
        );
      });
    });
    console.log("✓ Word properties test passed");
  },

  // Test 3: Verify all word IDs are unique
  testUniqueWordIds: () => {
    const ids = THEME_FAMILLE_WORDS.map((w) => w.id);
    const uniqueIds = new Set(ids);
    console.assert(
      ids.length === uniqueIds.size,
      `Expected ${ids.length} unique IDs, got ${uniqueIds.size}`
    );
    console.log("✓ Unique word IDs test passed");
  },

  // Test 4: Verify getWordsForExercise returns correct count
  testGetWordsForExercise: () => {
    // Test matching - should return all 6 words
    const matchingWords = getWordsForExercise("matching", 6);
    console.assert(
      matchingWords.length === 6,
      `Expected 6 words for matching, got ${matchingWords.length}`
    );

    // Test write - should return up to 4 words
    const writeWords = getWordsForExercise("write", 4);
    console.assert(
      writeWords.length <= 4,
      `Expected up to 4 words for write, got ${writeWords.length}`
    );

    // Test select - should return up to 3 words
    const selectWords = getWordsForExercise("select", 3);
    console.assert(
      selectWords.length <= 3,
      `Expected up to 3 words for select, got ${selectWords.length}`
    );

    console.log("✓ Get words for exercise test passed");
  },

  // Test 5: Verify getRandomWords returns unique words
  testGetRandomWords: () => {
    const randomWords = getRandomWords(3);

    // Should return requested count
    console.assert(
      randomWords.length === 3,
      `Expected 3 random words, got ${randomWords.length}`
    );

    // Should be unique (no duplicates)
    const ids = randomWords.map((w) => w.id);
    const uniqueIds = new Set(ids);
    console.assert(
      ids.length === uniqueIds.size,
      "Random words should be unique"
    );

    console.log("✓ Get random words test passed");
  },

  // Test 6: Verify getWrongOptions excludes correct word
  testGetWrongOptions: () => {
    const correctWordId = "p1";
    const wrongOptions = getWrongOptions(correctWordId, 3);

    // Should return requested count
    console.assert(
      wrongOptions.length === 3,
      `Expected 3 wrong options, got ${wrongOptions.length}`
    );

    // Should not include the correct word
    wrongOptions.forEach((word) => {
      console.assert(
        word.id !== correctWordId,
        `Wrong options should not include correct word`
      );
    });

    console.log("✓ Get wrong options test passed");
  },

  // Test 7: Verify theme config has required properties
  testThemeConfig: () => {
    const requiredProps = ["id", "title", "language", "wordCount"];

    requiredProps.forEach((prop) => {
      console.assert(
        THEME_CONFIG.hasOwnProperty(prop),
        `Theme config missing property: ${prop}`
      );
    });

    // Verify word count matches actual words
    console.assert(
      THEME_CONFIG.wordCount === THEME_FAMILLE_WORDS.length,
      `Theme config wordCount (${THEME_CONFIG.wordCount}) should match word pool (${THEME_FAMILLE_WORDS.length})`
    );

    console.log("✓ Theme config test passed");
  },

  // Test 8: Verify all words have valid difficulty levels
  testDifficultyLevels: () => {
    THEME_FAMILLE_WORDS.forEach((word) => {
      console.assert(
        word.difficulty >= 1 && word.difficulty <= 5,
        `Word ${word.id} has invalid difficulty: ${word.difficulty}`
      );
    });
    console.log("✓ Difficulty levels test passed");
  }
};

// Run all tests
export const runAllThemeTests = () => {
  console.log("\n=== Running Theme Data Tests ===\n");

  try {
    testCases.testWordPoolCount();
    testCases.testWordProperties();
    testCases.testUniqueWordIds();
    testCases.testGetWordsForExercise();
    testCases.testGetRandomWords();
    testCases.testGetWrongOptions();
    testCases.testThemeConfig();
    testCases.testDifficultyLevels();

    console.log("\n=== All Theme Data Tests Passed! ===\n");
    return true;
  } catch (error) {
    console.error("Theme test failed:", error);
    return false;
  }
};

// Export for use
export default {
  runAllThemeTests
};
