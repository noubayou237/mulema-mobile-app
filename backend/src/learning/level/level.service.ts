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
        words: {
          include: {
            userProgress: {
              where: { userId, isCompleted: true },
            },
          },
        },
      },
    });

    return themes.map((t) => {
      // Compter combien de mots ont un userProgress indiquant isCompleted: true
      const lessonsCompleted = t.words.reduce((acc, word) => {
        return acc + (word.userProgress.length > 0 ? 1 : 0);
      }, 0);

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
      };
    });
  }
}
