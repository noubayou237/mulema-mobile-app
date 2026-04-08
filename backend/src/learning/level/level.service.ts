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

  async getThemeWords(themeId: string) {
    return this.prisma.mulemWord.findMany({
      where: { themeId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
        word_fr: true,
        word_local: true,
        hint: true,
        audio_url: true,
        image_url: true,
      },
    });
  }

  async findThemesByLanguage(languageId: string) {
    const themes = await this.prisma.mulemTheme.findMany({
      where: { patrimonialLanguageId: languageId },
      orderBy: { order: 'asc' },
      include: { _count: { select: { words: true } } },
    });

    return themes.map((t) => ({
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
      lessonsCompleted: 0,
    }));
  }
}
