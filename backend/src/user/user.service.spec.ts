import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../auth/prisma/prisma.service';
import { R2StorageService } from '../storage/r2-storage.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: any;
  let r2Storage: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    role: 'USER',
    isVerified: true,
    totalPrawns: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAvatar = {
    id: 'avatar-123',
    userId: 'user-123',
    imageUrl: 'https://r2.example.com/avatars/test.jpg',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      avatar: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    r2Storage = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      extractKey: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: R2StorageService, useValue: r2Storage },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        avatar: mockAvatar,
      });

      const result = await service.getProfile('user-123');

      expect(result).toEqual({
        ...mockUser,
        avatar: mockAvatar,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      const result = await service.updateProfile('user-123', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw BadRequestException if email already in use', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({
          id: 'other-user',
          email: 'taken@example.com',
        });

      await expect(
        service.updateProfile('user-123', { email: 'taken@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('nonexistent', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfilePicture', () => {
    const mockFile = {
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test image content'),
      size: 1024,
    };

    it('should upload profile picture to R2', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        avatar: null,
      });
      r2Storage.uploadFile.mockResolvedValue({
        url: 'https://r2.example.com/avatars/new-avatar.jpg',
        key: 'avatars/new-avatar.jpg',
      });
      prisma.avatar.create.mockResolvedValue({
        id: 'new-avatar',
        userId: 'user-123',
        imageUrl: 'https://r2.example.com/avatars/new-avatar.jpg',
      });

      const result = await service.updateProfilePicture(
        'user-123',
        mockFile as Express.Multer.File,
      );

      expect(result.imageUrl).toBe(
        'https://r2.example.com/avatars/new-avatar.jpg',
      );
      expect(r2Storage.uploadFile).toHaveBeenCalled();
    });

    it('should delete old avatar when updating', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        avatar: mockAvatar,
      });
      r2Storage.uploadFile.mockResolvedValue({
        url: 'https://r2.example.com/avatars/new-avatar.jpg',
        key: 'avatars/new-avatar.jpg',
      });
      r2Storage.extractKey.mockReturnValue('avatars/test.jpg');
      prisma.avatar.update.mockResolvedValue({
        ...mockAvatar,
        imageUrl: 'https://r2.example.com/avatars/new-avatar.jpg',
      });

      await service.updateProfilePicture(
        'user-123',
        mockFile as Express.Multer.File,
      );

      expect(r2Storage.deleteFile).toHaveBeenCalledWith('avatars/test.jpg');
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'application/pdf',
      };

      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        avatar: null,
      });

      await expect(
        service.updateProfilePicture(
          'user-123',
          invalidFile as Express.Multer.File,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for file too large', async () => {
      const largeFile = {
        ...mockFile,
        size: 10 * 1024 * 1024, // 10MB
      };

      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        avatar: null,
      });

      await expect(
        service.updateProfilePicture(
          'user-123',
          largeFile as Express.Multer.File,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfilePicture(
          'nonexistent',
          mockFile as Express.Multer.File,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProfilePicture', () => {
    it('should delete profile picture from R2', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        avatar: mockAvatar,
      });
      r2Storage.extractKey.mockReturnValue('avatars/test.jpg');
      prisma.avatar.delete.mockResolvedValue(mockAvatar);

      const result = await service.deleteProfilePicture('user-123');

      expect(result.success).toBe(true);
      expect(r2Storage.deleteFile).toHaveBeenCalledWith('avatars/test.jpg');
      expect(prisma.avatar.delete).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should throw BadRequestException if no avatar exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        avatar: null,
      });

      await expect(service.deleteProfilePicture('user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteProfilePicture('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
