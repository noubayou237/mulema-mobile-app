import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async initializeProgress(userId: string, levelId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { levelId },
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < lessons.length; i++) {
      await this.prisma.userProgress.create({
        data: {
          userId,
          lessonId: lessons[i].id,
          isUnlocked: i === 0,
        },
      });
    }
  }

  async completeLesson(userId: string, lessonId: string, stars: number) {
    const progress = await this.prisma.userProgress.update({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      data: {
        isCompleted: true,
        stars,
      },
    });

    // 🔓 Débloquer la prochaine lesson
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    const nextLesson = await this.prisma.lesson.findFirst({
      where: {
        levelId: lesson.levelId,
        order: lesson.order + 1,
      },
    });

    if (nextLesson) {
      await this.prisma.userProgress.update({
        where: {
          userId_lessonId: { userId, lessonId: nextLesson.id },
        },
        data: { isUnlocked: true },
      });
    }

    return progress;
  }
}
