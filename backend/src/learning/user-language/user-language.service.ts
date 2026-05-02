import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';

@Injectable()
export class UserLanguageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all languages a user is learning
   */
  async getUserLanguages(userId: string) {
    const userLanguages = await this.prisma.userLanguage.findMany({
      where: { userId },
      include: {
        officialLanguage: true,
        patrimonialLanguage: true,
      },
    });

    return userLanguages.map((ul) => ({
      id: ul.id,
      officialLanguage: ul.officialLanguage
        ? { id: ul.officialLanguage.id, name: ul.officialLanguage.name }
        : null,
      patrimonialLanguage: ul.patrimonialLanguage
        ? { id: ul.patrimonialLanguage.id, name: ul.patrimonialLanguage.name }
        : null,
    }));
  }

  /**
   * Add a language to user's learning list
   * Preserves existing languages - doesn't delete anything
   */
  async addLanguage(
    userId: string,
    data: { officialLanguageId?: string; patrimonialLanguageId?: string },
  ) {
    // 1. If official language, update the direct field on User model too
    if (data.officialLanguageId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { officialLanguageId: data.officialLanguageId },
      });
    }

    // 2. Check if already added in UserLanguage join table
    if (data.officialLanguageId) {
      const existing = await this.prisma.userLanguage.findFirst({
        where: { userId, officialLanguageId: data.officialLanguageId },
        include: { officialLanguage: true, patrimonialLanguage: true },
      });
      if (existing) return existing;
    }

    if (data.patrimonialLanguageId) {
      const existing = await this.prisma.userLanguage.findFirst({
        where: { userId, patrimonialLanguageId: data.patrimonialLanguageId },
        include: { officialLanguage: true, patrimonialLanguage: true },
      });
      if (existing) return existing;
    }

    const userLanguage = await this.prisma.userLanguage.create({
      data: {
        userId,
        officialLanguageId: data.officialLanguageId,
        patrimonialLanguageId: data.patrimonialLanguageId,
      },
      include: {
        officialLanguage: true,
        patrimonialLanguage: true,
      },
    });

    return userLanguage;
  }

  /**
   * Remove a language from user's learning list
   * This doesn't delete their progress - just removes from active list
   */
  async removeLanguage(userId: string, languageId: string) {
    const userLanguage = await this.prisma.userLanguage.findFirst({
      where: {
        id: languageId,
        userId,
      },
    });

    if (!userLanguage) {
      throw new NotFoundException('Language not found in your list');
    }

    await this.prisma.userLanguage.delete({
      where: { id: languageId },
    });

    return { success: true };
  }

  /**
   * Get available languages to add
   */
  async getAvailableLanguages() {
    const [official, patrimonial] = await Promise.all([
      this.prisma.officialLanguage.findMany(),
      this.prisma.patrimonialLanguage.findMany(),
    ]);

    return {
      officialLanguages: official,
      patrimonialLanguages: patrimonial,
    };
  }
}
