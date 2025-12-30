import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';

@Injectable()
export class PatrimonialLanguageService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.patrimonialLanguage.findMany({
      include: {
        levels: true,
      },
    });
  }

  async create(name: string) {
    return this.prisma.patrimonialLanguage.create({
      data: { name },
    });
  }

  async selectForUser(userId: string, patrimonialLanguageId: string) {
    // Vérifier si déjà sélectionnée
    const exists = await this.prisma.userLanguage.findFirst({
      where: {
        userId,
        patrimonialLanguageId,
      },
    });

    if (exists)
      throw new BadRequestException('Language already selected');

    // Lier l'utilisateur à la langue
    return this.prisma.userLanguage.create({
      data: {
        userId,
        patrimonialLanguageId,
      },
    });
  }
}
