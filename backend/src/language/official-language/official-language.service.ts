import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';

@Injectable()
export class OfficialLanguageService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.officialLanguage.findMany();
  }

  async create(name: string) {
    return this.prisma.officialLanguage.create({
      data: { name },
    });
  }

  async assignToUser(userId: string, languageId: string) {
    if (!languageId) throw new BadRequestException('ID de langue manquant');

    const language = await this.prisma.officialLanguage.findUnique({
      where: { id: languageId },
    });

    if (!language) throw new NotFoundException('Language not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { officialLanguageId: languageId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        officialLanguageId: true,
      },
    });
  }
}
