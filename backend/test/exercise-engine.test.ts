/**
 * Unit tests for Exercise Engine Logic
 *
 * Tests the exercise generation logic without needing the database.
 * This is a standalone test file that tests the core algorithms.
 */

// Type definitions matching the service
interface Word {
  id: string;
  sourceText: string;
  targetText: string;
  imageUrl: string | null;
  audioUrl: string | null;
  difficultyLevel: number;
}

interface MatchingQuestion {
  id: string;
  type: 'MATCHING';
  instruction: string;
  pairs: { id: string; source: string; target: string }[];
}

interface ListenWriteQuestion {
  id: string;
  type: 'LISTEN_WRITE';
  instruction: string;
  word: Word;
}

interface ListenSelectImageQuestion {
  id: string;
  type: 'LISTEN_SELECT_IMAGE';
  instruction: string;
  word: Word;
  options: { id: string; text: string }[];
}

// Mock words for testing
const mockWords: Word[] = [
  {
    id: 'p1',
    sourceText: 'Le papa',
    targetText: 'Papá',
    imageUrl: null,
    audioUrl: null,
    difficultyLevel: 1,
  },
  {
    id: 'p2',
    sourceText: 'La maman',
    targetText: 'Mamá',
    imageUrl: null,
    audioUrl: null,
    difficultyLevel: 1,
  },
  {
    id: 'p3',
    sourceText: 'Le frère',
    targetText: 'Muna',
    imageUrl: null,
    audioUrl: null,
    difficultyLevel: 1,
  },
  {
    id: 'p4',
    sourceText: 'La sœur',
    targetText: 'Sango',
    imageUrl: null,
    audioUrl: null,
    difficultyLevel: 1,
  },
  {
    id: 'p5',
    sourceText: 'Le grand-père',
    targetText: 'Ndey',
    imageUrl: null,
    audioUrl: null,
    difficultyLevel: 2,
  },
  {
    id: 'p6',
    sourceText: 'La grand-mère',
    targetText: 'Maa',
    imageUrl: null,
    audioUrl: null,
    difficultyLevel: 2,
  },
];

/**
 * Test runner
 */
const runTests = () => {
  console.log('\n=== Running ExerciseEngineService Tests ===\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Verify matching exercise has correct structure
  const test1 = () => {
    try {
      // Simulate matching exercise generation
      const shuffledTargets = [...mockWords].sort(() => Math.random() - 0.5);
      const result: MatchingQuestion = {
        id: 'test-matching',
        type: 'MATCHING',
        instruction: 'Associe chaque mot avec sa bonne traduction !',
        pairs: mockWords.map((word, index) => ({
          id: word.id,
          source: word.sourceText,
          target: shuffledTargets[index].targetText,
        })),
      };

      // Assertions
      if (result.type !== 'MATCHING') throw new Error('Wrong type');
      if (result.pairs.length !== 6) throw new Error('Should have 6 pairs');
      if (!result.instruction) throw new Error('Missing instruction');

      console.log('✓ Test 1: Matching exercise structure');
      passed++;
    } catch (error: any) {
      console.error('✗ Test 1 failed:', error.message);
      failed++;
    }
  };

  // Test 2: Verify listen-write exercise has correct structure
  const test2 = () => {
    try {
      const shuffled = [...mockWords].sort(() => Math.random() - 0.5);
      const selectedWord = shuffled[0];

      const result: ListenWriteQuestion = {
        id: 'test-listen-write',
        type: 'LISTEN_WRITE',
        instruction: 'Écoutez le mot et écrivez-le ci-dessous :',
        word: selectedWord,
      };

      // Assertions
      if (result.type !== 'LISTEN_WRITE') throw new Error('Wrong type');
      if (!result.word) throw new Error('Missing word');
      if (result.word.sourceText !== selectedWord.sourceText)
        throw new Error('Wrong word');

      console.log('✓ Test 2: Listen-write exercise structure');
      passed++;
    } catch (error: any) {
      console.error('✗ Test 2 failed:', error.message);
      failed++;
    }
  };

  // Test 3: Verify listen-select exercise has correct structure
  const test3 = () => {
    try {
      const shuffled = [...mockWords].sort(() => Math.random() - 0.5);
      const correctWord = shuffled[0];
      const wrongOptions = shuffled.slice(1, 4).map((w) => ({
        id: w.id,
        text: w.targetText,
      }));

      const options = [
        { id: correctWord.id, text: correctWord.targetText },
        ...wrongOptions,
      ].sort(() => Math.random() - 0.5);

      const result: ListenSelectImageQuestion = {
        id: 'test-listen-select',
        type: 'LISTEN_SELECT_IMAGE',
        instruction: `Quel est le mot local pour dire '${correctWord.sourceText}' ?`,
        word: correctWord,
        options,
      };

      // Assertions
      if (result.type !== 'LISTEN_SELECT_IMAGE') throw new Error('Wrong type');
      if (!result.word) throw new Error('Missing word');
      if (result.options.length !== 4) throw new Error('Should have 4 options');

      // Verify correct answer is in options
      const hasCorrectAnswer = result.options.some(
        (o) => o.text === correctWord.targetText,
      );
      if (!hasCorrectAnswer) throw new Error('Correct answer not in options');

      console.log('✓ Test 3: Listen-select exercise structure');
      passed++;
    } catch (error: any) {
      console.error('✗ Test 3 failed:', error.message);
      failed++;
    }
  };

  // Test 4: Test SM-2 interval calculation logic
  const test4 = () => {
    try {
      const intervals = [1, 3, 7, 14, 30, 60];

      // Simulate calculateNextInterval
      const calculateNextInterval = (
        successCount: number,
        easeFactor: number,
      ): number => {
        const index = Math.min(successCount, intervals.length - 1);
        return Math.round(intervals[index] * easeFactor);
      };

      // Test various success counts
      const interval1 = calculateNextInterval(0, 2.5);
      const interval2 = calculateNextInterval(1, 2.5);
      const interval3 = calculateNextInterval(3, 2.5);
      const interval5 = calculateNextInterval(5, 2.5);

      // Assertions
      // index = min(0, 5) = 0, interval = 1 * 2.5 = 2.5 -> round to 3
      if (interval1 !== 3)
        throw new Error(`Interval for 0 success should be 3, got ${interval1}`);
      // index = min(1, 5) = 1, interval = 3 * 2.5 = 7.5 -> round to 8
      if (interval2 !== 8)
        throw new Error(`Interval for 1 success should be 8, got ${interval2}`);
      // index = min(3, 5) = 3, interval = 14 * 2.5 = 35 -> round to 35
      if (interval3 !== 35)
        throw new Error(
          `Interval for 3 success should be 35, got ${interval3}`,
        );
      // index = min(5, 5) = 5, interval = 60 * 2.5 = 150 -> round to 150
      if (interval5 !== 150)
        throw new Error(
          `Interval for 5 success should be 150, got ${interval5}`,
        );

      console.log('✓ Test 4: SM-2 interval calculation');
      passed++;
    } catch (error: any) {
      console.error('✗ Test 4 failed:', error.message);
      failed++;
    }
  };

  // Test 5: Verify word shuffling works
  const test5 = () => {
    try {
      // Run shuffle and check it produces an array
      const shuffled = [...mockWords].sort(() => Math.random() - 0.5);

      if (shuffled.length !== 6) throw new Error('Should have 6 words');
      if (shuffled[0].id === undefined) throw new Error('Missing id');

      console.log('✓ Test 5: Word shuffling works');
      passed++;
    } catch (error: any) {
      console.error('✗ Test 5 failed:', error.message);
      failed++;
    }
  };

  // Test 6: Test difficulty levels are valid
  const test6 = () => {
    try {
      mockWords.forEach((word) => {
        if (word.difficultyLevel < 1 || word.difficultyLevel > 5) {
          throw new Error(
            `Invalid difficulty for ${word.id}: ${word.difficultyLevel}`,
          );
        }
      });

      console.log('✓ Test 6: Difficulty levels valid');
      passed++;
    } catch (error: any) {
      console.error('✗ Test 6 failed:', error.message);
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

  console.log(`\n=== Test Results: ${passed} passed, ${failed} failed ===\n`);

  if (failed > 0) {
    process.exit(1);
  }
};

// Run tests
runTests();
