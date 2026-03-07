import { Test, TestingModule } from '@nestjs/testing';
import { UserLanguageService } from './user-language.service';
import { PrismaService } from '../../auth/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserLanguageService', () => {
  let service: UserLanguageService;
  let prisma: any;

  const mockOfficialLanguages = [
    { id: 'official-1', name: 'French' },
    { id: 'official-2', name: 'English' },
  ];

  const mockPatrimonialLanguages = [
    { id: 'patrimonial-1', name: 'Duala' },
    { id: 'patrimonial-2', name: 'Bassa' },
  ];

  const mockUserLanguages = [
    {
      id: 'ul-1',
      userId: 'user-123',
      officialLanguageId: 'official-1',
      patrimonialLanguageId: null,
      officialLanguage: mockOfficialLanguages[0],
      patrimonialLanguage: null,
    },
  ];

  beforeEach(async () => {
    prisma = {
      userLanguage: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      officialLanguage: {
        findMany: jest.fn(),
      },
      patrimonialLanguage: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLanguageService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserLanguageService>(UserLanguageService);
  });

  describe('getUserLanguages', () => {
    it('should return all languages user is learning', async () => {
      prisma.userLanguage.findMany.mockResolvedValue(mockUserLanguages);

      const result = await service.getUserLanguages('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('ul-1');
      expect(result[0].officialLanguage.name).toBe('French');
    });
  });

  describe('addLanguage', () => {
    it('should add a new official language to user', async () => {
      prisma.userLanguage.findFirst.mockResolvedValue(null);
      prisma.userLanguage.create.mockResolvedValue({
        ...mockUserLanguages[0],
        officialLanguage: mockOfficialLanguages[0],
      });

      const result = await service.addLanguage('user-123', {
        officialLanguageId: 'official-1',
      });

      expect(result.officialLanguage.name).toBe('French');
      expect(prisma.userLanguage.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if language already added', async () => {
      prisma.userLanguage.findFirst.mockResolvedValue(mockUserLanguages[0]);

      await expect(
        service.addLanguage('user-123', { officialLanguageId: 'official-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeLanguage', () => {
    it('should remove language from user list', async () => {
      prisma.userLanguage.findFirst.mockResolvedValue(mockUserLanguages[0]);
      prisma.userLanguage.delete.mockResolvedValue(mockUserLanguages[0]);

      const result = await service.removeLanguage('user-123', 'ul-1');

      expect(result.success).toBe(true);
      expect(prisma.userLanguage.delete).toHaveBeenCalledWith({
        where: { id: 'ul-1' },
      });
    });

    it('should throw NotFoundException if language not found', async () => {
      prisma.userLanguage.findFirst.mockResolvedValue(null);

      await expect(
        service.removeLanguage('user-123', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return all available languages', async () => {
      prisma.officialLanguage.findMany.mockResolvedValue(mockOfficialLanguages);
      prisma.patrimonialLanguage.findMany.mockResolvedValue(
        mockPatrimonialLanguages,
      );

      const result = await service.getAvailableLanguages();

      expect(result.officialLanguages).toHaveLength(2);
      expect(result.patrimonialLanguages).toHaveLength(2);
    });
  });
});
