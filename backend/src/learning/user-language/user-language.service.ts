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
    // Check if already added
    if (data.officialLanguageId) {
      const existing = await this.prisma.userLanguage.findFirst({
        where: {
          userId,
          officialLanguageId: data.officialLanguageId,
        },
      });

      if (existing) {
        throw new BadRequestException('Language already added');
      }
    }

    if (data.patrimonialLanguageId) {
      const existing = await this.prisma.userLanguage.findFirst({
        where: {
          userId,
          patrimonialLanguageId: data.patrimonialLanguageId,
        },
      });

      if (existing) {
        throw new BadRequestException('Language already added');
      }
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

    return {
      id: userLanguage.id,
      officialLanguage: userLanguage.officialLanguage,
      patrimonialLanguage: userLanguage.patrimonialLanguage,
    };
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
