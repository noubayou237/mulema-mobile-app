import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';
import { CreateLevelDto } from './dto/create-level.dto';

@Injectable()
export class LevelService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLevelDto) {
    return this.prisma.level.create({
      data: {
        levelNumber: dto.levelNumber,
        title: dto.title,
        patrimonialLanguageId: dto.patrimonialLanguageId,
      },
    });
  }

  async findByLanguage(languageId: string) {
    return this.prisma.level.findMany({
      where: { patrimonialLanguageId: languageId },
      orderBy: { levelNumber: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getThemeWords(themeId: string, userId: string) {
    return this.prisma.mulemWord.findMany({
      where: { themeId },
      orderBy: { order: 'asc' },
      include: {
        userProgress: {
          where: { userId },
        },
      },
    });
  }

  async findThemesByLanguage(languageId: string, userId: string) {
    const themes = await this.prisma.mulemTheme.findMany({
      where: { patrimonialLanguageId: languageId },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { words: true } },
        exercises: { select: { id: true } },
        words: {
          orderBy: { order: 'asc' },
          include: {
            userProgress: {
              where: { userId, isCompleted: true },
            },
          },
        },
      },
    });

    return themes.map((t) => {
      const lessonsCompleted = t.words.reduce(
        (acc, word) => acc + (word.userProgress.length > 0 ? 1 : 0),
        0,
      );

      // exercisesCount: how many discrete exercises exist for this theme
      const exercisesCount = t.exercises.length || 3;

      // exercisesCompleted: words at order >= 2 that are completed map 1-to-1
      // to exercise sessions the user has passed (each session unlocks the next word).
      // Cap at exercisesCount so we never exceed the total.
      const exercisesCompleted = Math.min(
        exercisesCount,
        t.words.filter((w) => w.order >= 2 && w.userProgress.length > 0).length,
      );

      return {
        id: t.id,
        name: t.name_fr,
        nameLocal: t.name_local,
        code: t.code,
        order: t.order,
        icon: t.icon,
        color: t.color,
        locked: t.locked,
        lockHint: t.lock_hint,
        lessonsCount: t._count.words,
        lessonsCompleted,
        exercisesCount,
        exercisesCompleted,
      };
    });
  }
}
