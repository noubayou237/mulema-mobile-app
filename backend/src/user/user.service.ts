import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
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

    return user;
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

    return updatedUser;
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
    return { imageUrl: result.url };
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
}
