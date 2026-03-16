import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';

/**
 * Exercise Engine Service
 *
 * Dynamically generates exercises from word pools stored in the database.
 * This ensures pedagogical consistency - the same words are used across
 * all exercise types for proper repetition and memorization.
 */

export interface Word {
  id: string;
  sourceText: string;
  targetText: string;
  imageUrl: string | null;
  audioUrl: string | null;
  difficultyLevel: number;
}

export interface MatchingQuestion {
  id: string;
  type: 'MATCHING';
  pairs: { id: string; source: string; target: string }[];
  instruction: string;
}

export interface ListenWriteQuestion {
  id: string;
  type: 'LISTEN_WRITE';
  word: Word;
  instruction: string;
}

export interface ListenSelectImageQuestion {
  id: string;
  type: 'LISTEN_SELECT_IMAGE';
  word: Word;
  options: { id: string; text: string }[];
  instruction: string;
}

export interface GeneratedExercise {
  id: string;
  type: 'MATCHING' | 'LISTEN_WRITE' | 'LISTEN_SELECT_IMAGE';
  questions: (
    | MatchingQuestion
    | ListenWriteQuestion
    | ListenSelectImageQuestion
  )[];
}

@Injectable()
export class ExerciseEngineService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate exercises for a learning block
   * Uses the 6 words from the block to create all exercise types
   */
  async generateBlockExercises(blockId: string): Promise<GeneratedExercise[]> {
    // Get words from the block
    const block = await this.prisma.learningBlock.findUnique({
      where: { id: blockId },
      include: {
        words: true,
      },
    });

    if (!block || block.words.length === 0) {
      throw new Error(`Block not found or has no words: ${blockId}`);
    }

    const words = block.words as unknown as Word[];

    // Generate all 3 exercise types with the same words
    const exercises: GeneratedExercise[] = [
      this.createMatchingExercise(words) as unknown as GeneratedExercise,
      this.createListenWriteExercise(words) as unknown as GeneratedExercise,
      this.createListenSelectImageExercise(
        words,
      ) as unknown as GeneratedExercise,
    ];

    return exercises;
  }

  /**
   * Generate exercises for a theme (all blocks)
   */
  async generateThemeExercises(themeId: string): Promise<GeneratedExercise[]> {
    const blocks = await this.prisma.learningBlock.findMany({
      where: { themeId },
      include: { words: true },
      orderBy: { blockOrder: 'asc' },
    });

    const exercises: GeneratedExercise[] = [];

    for (const block of blocks) {
      const blockExercises = await this.generateBlockExercises(block.id);
      exercises.push(...blockExercises);
    }

    return exercises;
  }

  /**
   * Create a matching exercise (exos1)
   * Uses ALL words from the pool
   */
  private createMatchingExercise(words: Word[]): MatchingQuestion {
    // Shuffle the target words for the right column
    const shuffledTargets = [...words].sort(() => Math.random() - 0.5);

    return {
      id: `matching-${Date.now()}`,
      type: 'MATCHING',
      instruction: 'Associe chaque mot avec sa bonne traduction !',
      pairs: words.map((word, index) => ({
        id: word.id,
        source: word.sourceText,
        target: shuffledTargets[index].targetText,
      })),
    };
  }

  /**
   * Create a listen-and-write exercise (exos2)
   * Uses a subset of words (3-4) from the pool
   */
  private createListenWriteExercise(words: Word[]): ListenWriteQuestion {
    // Pick 3 random words for this exercise
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, Math.min(4, words.length));

    return {
      id: `listen-write-${Date.now()}`,
      type: 'LISTEN_WRITE',
      instruction: 'Écoutez le mot et écrivez-le ci-dessous :',
      word: selectedWords[0], // Use first word for single-question exercise
    };
  }

  /**
   * Create a listen-and-select-image exercise (exos3)
   * Uses a subset of words (2-3) from the pool
   */
  private createListenSelectImageExercise(
    words: Word[],
  ): ListenSelectImageQuestion {
    // Pick 1 correct word and 3 wrong options
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const correctWord = shuffled[0];
    const wrongOptions = shuffled
      .slice(1, Math.min(4, words.length))
      .map((w) => ({
        id: w.id,
        text: w.targetText,
      }));

    // Combine and shuffle options
    const options = [
      { id: correctWord.id, text: correctWord.targetText },
      ...wrongOptions,
    ].sort(() => Math.random() - 0.5);

    return {
      id: `listen-select-${Date.now()}`,
      type: 'LISTEN_SELECT_IMAGE',
      instruction: `Quel est le mot local pour dire '${correctWord.sourceText}' ?`,
      word: correctWord,
      options,
    };
  }

  /**
   * Get words for spaced repetition review
   * Returns words due for review based on the user's progress
   */
  async getWordsForReview(userId: string, limit: number = 10): Promise<Word[]> {
    const now = new Date();

    // Get words where nextReview is in the past or null
    const wordProgress = await this.prisma.wordProgress.findMany({
      where: {
        userId,
        OR: [{ nextReview: { lte: now } }, { nextReview: null }],
      },
      include: { word: true },
      orderBy: { nextReview: 'asc' },
      take: limit,
    });

    return wordProgress.map((wp) => wp.word as unknown as Word);
  }

  /**
   * Update word progress after an answer
   * Uses SM-2 algorithm for spaced repetition
   */
  async updateWordProgress(
    userId: string,
    wordId: string,
    isCorrect: boolean,
  ): Promise<void> {
    const existing = await this.prisma.wordProgress.findUnique({
      where: {
        userId_wordId: { userId, wordId },
      },
    });

    if (isCorrect) {
      // Increase success count and extend interval
      const newSuccessCount = (existing?.successCount || 0) + 1;
      const interval = this.calculateNextInterval(
        newSuccessCount,
        existing?.easeFactor || 2.5,
      );
      const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

      await this.prisma.wordProgress.upsert({
        where: {
          userId_wordId: { userId, wordId },
        },
        update: {
          successCount: newSuccessCount,
          failureCount: existing?.failureCount || 0,
          lastReviewed: new Date(),
          nextReview,
          interval,
        },
        create: {
          userId,
          wordId,
          successCount: 1,
          failureCount: 0,
          lastReviewed: new Date(),
          nextReview,
          interval,
        },
      });
    } else {
      // Increase failure count and reset interval
      const newFailureCount = (existing?.failureCount || 0) + 1;
      const nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000); // Review tomorrow

      await this.prisma.wordProgress.upsert({
        where: {
          userId_wordId: { userId, wordId },
        },
        update: {
          successCount: existing?.successCount || 0,
          failureCount: newFailureCount,
          lastReviewed: new Date(),
          nextReview,
          interval: 1,
          easeFactor: Math.max(1.3, (existing?.easeFactor || 2.5) - 0.2),
        },
        create: {
          userId,
          wordId,
          successCount: 0,
          failureCount: 1,
          lastReviewed: new Date(),
          nextReview,
          interval: 1,
          easeFactor: 2.3,
        },
      });
    }
  }

  /**
   * Calculate next review interval using SM-2 algorithm
   */
  private calculateNextInterval(
    successCount: number,
    easeFactor: number,
  ): number {
    const intervals = [1, 3, 7, 14, 30, 60]; // Days
    const index = Math.min(successCount, intervals.length - 1);
    return Math.round(intervals[index] * easeFactor);
  }
}
