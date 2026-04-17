import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../auth/prisma/prisma.service';
import { R2StorageService } from '../storage/r2-storage.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private r2Storage: R2StorageService,
  ) {}

  // =====================
  // GET DASHBOARD
  // =====================
  async getDashboard(userId: string) {
    const [stats, streak, cowry, userLanguages] = await Promise.all([
      this.prisma.statistics.findUnique({ where: { userId } }),
      this.prisma.rootsStreak.findUnique({ where: { userId } }),
      this.prisma.cowry.findUnique({ where: { userId } }),
      this.prisma.userLanguage.findMany({
        where: { userId, patrimonialLanguageId: { not: null } },
        include: { patrimonialLanguage: true },
      }),
    ]);

    // Trouver la langue patrimoniale active
    const activeLang = userLanguages[0]?.patrimonialLanguage ?? null;

    // Premier thème non terminé à continuer (si langue active)
    let continueTheme = null;
    if (activeLang) {
      const firstTheme = await this.prisma.mulemTheme.findFirst({
        where: { patrimonialLanguageId: activeLang.id },
        orderBy: { order: 'asc' },
      });
      if (firstTheme) {
        continueTheme = { id: firstTheme.id, name: firstTheme.name_fr };
      }
    }

    const totalMinutes = Math.round((stats?.totalLearningTime ?? 0) / 60);
    const dailyGoalMinutes = 40;
    const progressPercent = Math.min(
      100,
      Math.round((totalMinutes / dailyGoalMinutes) * 100),
    );

    return {
      streakDays: streak?.daysConnected ?? 0,
      totalPoints: stats?.totalPrawns ?? 0,
      progressPercent,
      totalTimeMinutes: totalMinutes,
      hearts: cowry?.currentCowries ?? 5,
      continueTheme,
    };
  }

  // =====================
  // GET PROFILE
  // =====================
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isVerified: true,
        totalPrawns: true,
        language: true,
        avatar: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate signed URL for avatar if it exists
    let avatarWithSignedUrl = user.avatar;
    if (user.avatar?.imageUrl) {
      try {
        const key = this.r2Storage.extractKey(user.avatar.imageUrl);
        const signedUrl = await this.r2Storage.getSignedUrl(key, 3600); // 1 hour expiry
        avatarWithSignedUrl = {
          id: user.avatar.id,
          imageUrl: signedUrl,
        };
      } catch (error) {
        this.logger.warn(`Failed to generate signed URL for avatar: ${error}`);
        // Keep original URL if signed URL fails
      }
    }

    return {
      ...user,
      avatar: typeof avatarWithSignedUrl === 'string' ? avatarWithSignedUrl : avatarWithSignedUrl?.imageUrl || null,
    };
  }

  // =====================
  // UPDATE PROFILE
  // =====================
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
    },
  ) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If email is being changed, check for uniqueness
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isVerified: true,
        avatar: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...updatedUser,
      avatar: updatedUser.avatar?.imageUrl || null,
    };
  }

  // =====================
  // UPDATE PROFILE PICTURE
  // =====================
  async updateProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { avatar: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    // Upload file to R2 storage
    const result = await this.r2Storage.uploadFile(
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      },
      'avatars',
    );

    // If user already has an avatar, delete the old one from R2
    if (existingUser.avatar) {
      const oldKey = this.r2Storage.extractKey(existingUser.avatar.imageUrl);
      try {
        await this.r2Storage.deleteFile(oldKey);
      } catch (error) {
        // Log but don't fail if old file deletion fails
        this.logger.warn(`Failed to delete old avatar: ${error}`);
      }

      // Update avatar record
      await this.prisma.avatar.update({
        where: { userId },
        data: { imageUrl: result.url },
      });
    } else {
      // Create new avatar record
      await this.prisma.avatar.create({
        data: {
          userId,
          imageUrl: result.url,
        },
      });
    }

    this.logger.log(`Profile picture updated for user ${userId}`);

    // Return signed URL for immediate display
    const signedUrl = await this.r2Storage.getSignedUrl(result.key, 3600);
    return { imageUrl: signedUrl };
  }

  // =====================
  // DELETE PROFILE PICTURE
  // =====================
  // DELETE PROFILE PICTURE
  // =====================
  // DELETE PROFILE PICTURE
  // =====================
  async deleteProfilePicture(userId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { avatar: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (!existingUser.avatar) {
      throw new BadRequestException('No profile picture to delete');
    }

    // Delete file from R2 storage
    const key = this.r2Storage.extractKey(existingUser.avatar.imageUrl);
    try {
      await this.r2Storage.deleteFile(key);
    } catch (error) {
      // Log but don't fail if file deletion fails
      this.logger.warn(`Failed to delete avatar from R2: ${error}`);
    }

    // Delete avatar record
    await this.prisma.avatar.delete({
      where: { userId },
    });

    return { success: true };
  }

  // =====================
  // UPDATE LANGUAGE
  // =====================
  async updateLanguage(userId: string, language: string) {
    // Validate language
    const validLanguages = ['en', 'fr'];
    if (!validLanguages.includes(language)) {
      throw new BadRequestException('Invalid language. Must be "en" or "fr".');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { language },
      select: {
        id: true,
        language: true,
      },
    });

    this.logger.log(`Language updated to ${language} for user ${userId}`);
    return user;
  }

  // =====================
  // DELETE ACCOUNT
  // =====================
  async deleteAccount(userId: string) {
    this.logger.log(`Delete account request for user: ${userId}`);

    // Check if user exists and get avatar info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { avatar: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 1. Delete avatar from R2 if it exists
    if (user.avatar?.imageUrl) {
      try {
        const key = this.r2Storage.extractKey(user.avatar.imageUrl);
        await this.r2Storage.deleteFile(key);
      } catch (error) {
        // Log but don't fail account deletion if file deletion fails
        this.logger.warn(
          `Failed to delete avatar from R2 during account deletion: ${error}`,
        );
      }
    }

    // 2. Delete user from Prisma
    // (Cascading deletes handle Statistics, RootsStreak, UserLanguage, UserProgress, Cowry, Avatar, Settings, RefreshToken, Otp)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    this.logger.log(`Account deleted successfully for user: ${userId}`);
    return { success: true };
  }

  // =====================
  // CHANGE PASSWORD
  // =====================
  async changePassword(
    userId: string,
    data: { oldPassword?: string; newPassword?: string },
  ) {
    const { oldPassword, newPassword } = data;
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Old and new passwords are required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Social users don't have passwords in Mulema usually, or should manage it via provider
    if (user.isSocial) {
      throw new BadRequestException(
        'Social accounts cannot change password here.',
      );
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    this.logger.log(`Password updated for user ${userId}`);
    return { success: true };
  }
}
