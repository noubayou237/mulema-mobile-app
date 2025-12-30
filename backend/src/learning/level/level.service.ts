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
}
