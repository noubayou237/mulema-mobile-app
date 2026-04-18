import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  /**
   * Initialise le progrès pour un thème Mulem.
   * Débloque les 2 premiers mots par défaut.
   */
  async initializeMulemProgress(userId: string, themeId: string) {
    const words = await this.prisma.mulemWord.findMany({
      where: { themeId },
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < words.length; i++) {
      await this.prisma.userProgress.upsert({
        where: {
          userId_mulemWordId: { userId, mulemWordId: words[i].id },
        },
        update: {},
        create: {
          userId,
          mulemWordId: words[i].id,
          isUnlocked: i < 2, // Les 2 premières leçons sont débloquées par défaut
          isCompleted: false,
          stars: 0,
        },
      });
    }
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
      },
      create: {
        userId,
        totalLearningTime: 120,
        lessonsCompleted: 1,
        exercisesCompleted: 0,
        totalPrawns: 0,
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
      orderBy: { order: 'asc' },
    });

    // Pour l'instant, on débloque tout le thème si un exercice est réussi avec succès
    // (A affiner selon si on veut un déblocage granulaire)
    for (const word of words) {
      await this.prisma.userProgress.update({
        where: {
          userId_mulemWordId: { userId, mulemWordId: word.id },
        },
        data: { isUnlocked: true },
      });
    }
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
    // 1) Mark the CURRENT lesson as completed
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
      },
      create: {
        userId,
        totalLearningTime: 300,
        lessonsCompleted: 0,
        exercisesCompleted: 1,
        totalPrawns: 0,
      },
    });

    return { unlockedWordId: nextWord.id, order: nextWord.order };
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
