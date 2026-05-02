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

    // Strategy: Batch check existing to only create missing ones, or use a transaction
    // createMany is faster but doesn't support "on conflict skip" easily in all Prisma versions without specific args
    // We'll use a transaction for safety and speed compared to a loose loop.
    await this.prisma.$transaction(
      words.map((word, i) =>
        this.prisma.userProgress.upsert({
          where: {
            userId_mulemWordId: { userId, mulemWordId: word.id },
          },
          update: {},
          create: {
            userId,
            mulemWordId: word.id,
            isUnlocked: i < 2, 
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
    // Mark the CURRENT lesson as completed
    const currentWord = await this.prisma.mulemWord.findFirst({
      where: { themeId, order: completedLessonOrder + 1 },
      orderBy: { order: 'asc' },
    });

    if (currentWord) {
      await this.prisma.userProgress.upsert({
        where: { userId_mulemWordId: { userId, mulemWordId: currentWord.id } },
        update: { isCompleted: true, stars: 3 }, // Give full stars if exercise was passed
        create: {
          userId,
          mulemWordId: currentWord.id,
          isUnlocked: true,
          isCompleted: true,
          stars: 3,
        },
      });
    }

    // 2) Unlock the NEXT lesson
    const nextWord = await this.prisma.mulemWord.findFirst({
      where: { themeId, order: completedLessonOrder + 2 },
      orderBy: { order: 'asc' },
    });

    if (!nextWord) {
      return { message: 'Theme complete — no next lesson to unlock', unlockedWordId: null };
    }

    await this.prisma.userProgress.upsert({
      where: { userId_mulemWordId: { userId, mulemWordId: nextWord.id } },
      update: { isUnlocked: true },
      create: {
        userId,
        mulemWordId: nextWord.id,
        isUnlocked: true,
        isCompleted: false,
        stars: 0,
      },
    });

    await this.prisma.statistics.upsert({
      where: { userId },
      update: {
        totalLearningTime: { increment: 300 },
        exercisesCompleted: { increment: 1 },
        totalPrawns: { increment: 30 }, // Award 30 XP for exercise
      },
      create: {
        userId,
        totalLearningTime: 300,
        lessonsCompleted: 0,
        exercisesCompleted: 1,
        totalPrawns: 30,
      },
    });

    return { unlockedWordId: nextWord.id, order: nextWord.order };
  }

  async markThemeCompleted(userId: string, themeId: string, completedLessonOrder?: number) {
    // Mark the last lesson word as completed so progress reaches 100%
    if (completedLessonOrder != null) {
      const lastWord = await this.prisma.mulemWord.findFirst({
        where: { themeId, order: completedLessonOrder + 1 },
      });
      if (lastWord) {
        await this.prisma.userProgress.upsert({
          where: { userId_mulemWordId: { userId, mulemWordId: lastWord.id } },
          update: { isCompleted: true, stars: 3 },
          create: {
            userId,
            mulemWordId: lastWord.id,
            isUnlocked: true,
            isCompleted: true,
            stars: 3,
          },
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
