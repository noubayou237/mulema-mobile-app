import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) { }

  /**
   * Initialise le progrès pour un thème Mulem.
   * Débloque les 2 premiers mots par défaut.
   */
  async initializeMulemProgress(userId: string, themeId: string) {
    const words = await this.prisma.mulemWord.findMany({
      where: { themeId },
      orderBy: { order: 'asc' },
    });

    if (words.length === 0) return;

    // Identify the first two categories
    const categories = Array.from(new Set(words.map(w => w.category || 'Basics')));
    const unlockedCategories = [categories[0], categories[1]].filter(Boolean);

    await this.prisma.$transaction(
      words.map((word) =>
        this.prisma.userProgress.upsert({
          where: {
            userId_mulemWordId: { userId, mulemWordId: word.id },
          },
          update: {
            ...(unlockedCategories.includes(word.category || 'Basics') ? { isUnlocked: true } : {})
          },
          create: {
            userId,
            mulemWordId: word.id,
            // Unlock first two categories by default
            isUnlocked: unlockedCategories.includes(word.category || 'Basics'),
            isCompleted: false,
            stars: 0,
          },
        })
      )
    );
  }

  async completeMulemWord(userId: string, wordId: string, stars: number) {
    const progress = await this.prisma.userProgress.update({
      where: {
        userId_mulemWordId: { userId, mulemWordId: wordId },
      },
      data: {
        isCompleted: true,
        stars,
      },
    });

    await this.prisma.statistics.upsert({
      where: { userId },
      update: {
        totalLearningTime: { increment: 120 },
        lessonsCompleted: { increment: 1 },
        totalPrawns: { increment: 15 }, // Award 15 XP for lesson
      },
      create: {
        userId,
        totalLearningTime: 120,
        lessonsCompleted: 1,
        exercisesCompleted: 0,
        totalPrawns: 15,
      },
    });

    // Note : Le déblocage des leçons suivantes (>2) se fait via les exercices
    return progress;
  }

  /**
   * Débloque les leçons suivantes pour un thème après réussite d'un exercice.
   */
  async unlockLessonsAfterExercise(userId: string, themeId: string) {
    const words = await this.prisma.mulemWord.findMany({
      where: { themeId },
      select: { id: true },
    });

    const wordIds = words.map((w) => w.id);

    // Optimized: Single updateMany call instead of a loop
    await this.prisma.userProgress.updateMany({
      where: {
        userId,
        mulemWordId: { in: wordIds },
      },
      data: { isUnlocked: true },
    });
  }

  /**
   * Débloque uniquement la leçon suivante après réussite d'un exercice.
   * @param completedLessonOrder - Index 0-based de la dernière leçon terminée
   *   DB order is 1-indexed, so next lesson = completedLessonOrder + 2
   */
  async unlockNextLessonAfterExercise(
    userId: string,
    themeId: string,
    completedLessonOrder: number,
  ) {
    const allWords = await this.prisma.mulemWord.findMany({
      where: { themeId },
      orderBy: { order: 'asc' },
    });

    // Group words by category, keeping the order they first appear
    const categories: string[] = [];
    const groupedWords: Record<string, string[]> = {};

    allWords.forEach((word) => {
      const cat = word.category || 'Basics';
      if (!groupedWords[cat]) {
        groupedWords[cat] = [];
        categories.push(cat);
      }
      groupedWords[cat].push(word.id);
    });

    // 1) Mark CURRENT category as completed
    const completedCategoryName = categories[completedLessonOrder];
    if (completedCategoryName && groupedWords[completedCategoryName]) {
      const wordIds = groupedWords[completedCategoryName];
      // Ensure records exist
      await this.prisma.userProgress.createMany({
        data: wordIds.map((id) => ({
          userId,
          mulemWordId: id,
          isUnlocked: true,
        })),
        skipDuplicates: true,
      });

      await this.prisma.userProgress.updateMany({
        where: {
          userId,
          mulemWordId: { in: wordIds },
        },
        data: { isCompleted: true, isUnlocked: true, stars: 3 },
      });
    }

    // 2) Unlock the NEXT category
    const nextCategoryName = categories[completedLessonOrder + 1];
    if (!nextCategoryName) {
      return { message: 'Theme complete — no next category to unlock' };
    }

    const nextWordIds = groupedWords[nextCategoryName];
    // Ensure records exist
    await this.prisma.userProgress.createMany({
      data: nextWordIds.map((id) => ({
        userId,
        mulemWordId: id,
        isUnlocked: true,
      })),
      skipDuplicates: true,
    });

    await this.prisma.userProgress.updateMany({
      where: {
        userId,
        mulemWordId: { in: nextWordIds },
      },
      data: { isUnlocked: true },
    });

    // Also update statistics
    await this.prisma.statistics.upsert({
      where: { userId },
      update: {
        totalLearningTime: { increment: 300 },
        exercisesCompleted: { increment: 1 },
        totalPrawns: { increment: 30 },
      },
      create: {
        userId,
        totalLearningTime: 300,
        lessonsCompleted: 0,
        exercisesCompleted: 1,
        totalPrawns: 30,
      },
    });

    return { 
      message: `Unlocked category: ${nextCategoryName}`,
      unlockedWordIds: nextWordIds 
    };
  }

  async markThemeCompleted(userId: string, themeId: string, completedLessonOrder?: number) {
    // Mark the last category as completed if provided
    if (completedLessonOrder != null) {
      const allWords = await this.prisma.mulemWord.findMany({
        where: { themeId },
        orderBy: { order: 'asc' },
      });

      const categories: string[] = [];
      const groupedWords: Record<string, string[]> = {};
      allWords.forEach((word) => {
        const cat = word.category || 'Basics';
        if (!groupedWords[cat]) {
          groupedWords[cat] = [];
          categories.push(cat);
        }
        groupedWords[cat].push(word.id);
      });

      const lastCategoryName = categories[completedLessonOrder];
      if (lastCategoryName && groupedWords[lastCategoryName]) {
        const wordIds = groupedWords[lastCategoryName];
        // Ensure records exist
        await this.prisma.userProgress.createMany({
          data: wordIds.map((id) => ({
            userId,
            mulemWordId: id,
            isUnlocked: true,
          })),
          skipDuplicates: true,
        });

        await this.prisma.userProgress.updateMany({
          where: {
            userId,
            mulemWordId: { in: wordIds },
          },
          data: { isCompleted: true, isUnlocked: true, stars: 3 },
        });
      }
    }

    return this.prisma.userMulemThemeProgress.upsert({
      where: { userId_themeId: { userId, themeId } },
      update: { isCompleted: true },
      create: { userId, themeId, isCompleted: true, videoWatched: false },
    });
  }

  async markVideoWatched(userId: string, themeId: string) {
    return this.prisma.userMulemThemeProgress.upsert({
      where: { userId_themeId: { userId, themeId } },
      update: { videoWatched: true },
      create: { userId, themeId, isCompleted: true, videoWatched: true },
    });
  }

  async getProgressForTheme(userId: string, themeId: string) {
    const words = await this.prisma.mulemWord.findMany({
      where: { themeId },
      orderBy: { order: 'asc' },
      include: {
        userProgress: {
          where: { userId },
        },
      },
    });

    return words.map((word) => ({
      id: word.id,
      title: word.word_fr,
      order: word.order,
      isUnlocked: word.userProgress[0]?.isUnlocked ?? false,
      isCompleted: word.userProgress[0]?.isCompleted ?? false,
      stars: word.userProgress[0]?.stars ?? 0,
    }));
  }

  // --- Legacy Compatibility ---
  async initializeProgress(userId: string, levelId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { levelId },
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < lessons.length; i++) {
      await this.prisma.userProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: lessons[i].id } },
        update: {},
        create: {
          userId,
          lessonId: lessons[i].id,
          isUnlocked: i === 0,
        },
      });
    }
  }

  async completeLesson(userId: string, lessonId: string, stars: number) {
    return this.prisma.userProgress.update({
      where: { userId_lessonId: { userId, lessonId } },
      data: { isCompleted: true, stars },
    });
  }
}
