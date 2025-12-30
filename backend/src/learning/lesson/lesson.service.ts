import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: dto,
    });
  }

  async getLessonsWithProgress(levelId: string, userId: string) {
    return this.prisma.lesson.findMany({
      where: { levelId },
      orderBy: { order: 'asc' },
      include: {
        userProgress: {
          where: { userId },
        },
      },
    });
  }

  //5-Debloquer la prochaine lecon unefois la precedente terminee
async unlockNextLesson(userId: string, currentLessonId: string) {
  const currentLesson = await this.prisma.lesson.findUnique({
    where: { id: currentLessonId },
  });

  if (!currentLesson) return;

  const nextLesson = await this.prisma.lesson.findFirst({
    where: {
      levelId: currentLesson.levelId,
      order: currentLesson.order + 1,
    },
  });

  if (!nextLesson) return;

  await this.prisma.userProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId: nextLesson.id,
      },
    },
    update: { isUnlocked: true },
    create: {
      userId,
      lessonId: nextLesson.id,
      isUnlocked: true,
    },
  });
}
}
