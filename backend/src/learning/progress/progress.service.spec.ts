import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { PrismaService } from '../../auth/prisma/prisma.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let prisma: any;

  const mockLessons = [
    { id: 'lesson-1', title: 'Lesson 1', order: 1, levelId: 'level-1' },
    { id: 'lesson-2', title: 'Lesson 2', order: 2, levelId: 'level-1' },
    { id: 'lesson-3', title: 'Lesson 3', order: 3, levelId: 'level-1' },
  ];

  const mockUserProgress = [
    { lessonId: 'lesson-1', isUnlocked: true, isCompleted: true, stars: 3 },
    { lessonId: 'lesson-2', isUnlocked: true, isCompleted: false, stars: 0 },
    { lessonId: 'lesson-3', isUnlocked: false, isCompleted: false, stars: 0 },
  ];

  beforeEach(async () => {
    prisma = {
      lesson: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      userProgress: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  describe('initializeProgress', () => {
    it('should create progress for all lessons and unlock only first lesson', async () => {
      prisma.lesson.findMany.mockResolvedValue(mockLessons);

      await service.initializeProgress('user-123', 'level-1');

      // Should create progress for all 3 lessons
      expect(prisma.userProgress.create).toHaveBeenCalledTimes(3);

      // First lesson should be unlocked
      expect(prisma.userProgress.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          lessonId: 'lesson-1',
          isUnlocked: true,
        },
      });
    });
  });

  describe('completeLesson', () => {
    it('should mark lesson as completed and unlock next lesson', async () => {
      prisma.userProgress.update.mockResolvedValue({
        lessonId: 'lesson-1',
        isCompleted: true,
        stars: 3,
      });

      prisma.lesson.findUnique.mockResolvedValue(mockLessons[0]);
      prisma.lesson.findFirst.mockResolvedValue(mockLessons[1]);

      await service.completeLesson('user-123', 'lesson-1', 3);

      // Should mark lesson as completed
      expect(prisma.userProgress.update).toHaveBeenCalledWith({
        where: {
          userId_lessonId: { userId: 'user-123', lessonId: 'lesson-1' },
        },
        data: { isCompleted: true, stars: 3 },
      });

      // Should unlock next lesson
      expect(prisma.userProgress.update).toHaveBeenCalledWith({
        where: {
          userId_lessonId: { userId: 'user-123', lessonId: 'lesson-2' },
        },
        data: { isUnlocked: true },
      });
    });

    it('should not fail if there is no next lesson', async () => {
      prisma.userProgress.update.mockResolvedValue({
        lessonId: 'lesson-3',
        isCompleted: true,
        stars: 3,
      });

      prisma.lesson.findUnique.mockResolvedValue(mockLessons[2]);
      prisma.lesson.findFirst.mockResolvedValue(null);

      await service.completeLesson('user-123', 'lesson-3', 3);

      // Should still mark as completed but not try to unlock next
      expect(prisma.userProgress.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProgressForLevel', () => {
    it('should return progress for all lessons in a level', async () => {
      prisma.lesson.findMany.mockResolvedValue(
        mockLessons.map((lesson, index) => ({
          ...lesson,
          userProgress: [mockUserProgress[index]],
        })),
      );

      const result = await service.getProgressForLevel('user-123', 'level-1');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 'lesson-1',
        title: 'Lesson 1',
        order: 1,
        isUnlocked: true,
        isCompleted: true,
        stars: 3,
      });
      expect(result[1]).toEqual({
        id: 'lesson-2',
        title: 'Lesson 2',
        order: 2,
        isUnlocked: true,
        isCompleted: false,
        stars: 0,
      });
      expect(result[2]).toEqual({
        id: 'lesson-3',
        title: 'Lesson 3',
        order: 3,
        isUnlocked: false,
        isCompleted: false,
        stars: 0,
      });
    });

    it('should return unlocked: false for lessons without progress', async () => {
      prisma.lesson.findMany.mockResolvedValue(
        mockLessons.map((lesson) => ({
          ...lesson,
          userProgress: [],
        })),
      );

      const result = await service.getProgressForLevel('user-123', 'level-1');

      expect(result[0].isUnlocked).toBe(false);
      expect(result[0].isCompleted).toBe(false);
      expect(result[0].stars).toBe(0);
    });
  });
});
