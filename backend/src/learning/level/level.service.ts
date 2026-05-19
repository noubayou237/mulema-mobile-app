import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';
import { CreateLevelDto } from './dto/create-level.dto';

@Injectable()
export class LevelService {
  constructor(private prisma: PrismaService) { }

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

  async getThemeWords(themeId: string, userId: string) {
    if (!themeId || themeId === 'undefined') return [];

    // Basic UUID format check to avoid unnecessary DB searches for malformed IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(themeId) && !themeId.startsWith('virtual_')) {
      return [];
    }

    const words = await this.prisma.mulemWord.findMany({
      where: { themeId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        word_fr: true,
        word_local: true,
        hint: true,
        audio_url: true,
        audio_key: true,
        image_url: true,
        image_key: true,
        order: true,
        category: true,
        userProgress: {
          where: { userId },
          select: {
            id: true,
            isUnlocked: true,
            isCompleted: true,
            stars: true,
          },
        },
      },
    });

    // Group words by category
    const categories: string[] = [];
    const grouped: Record<string, any[]> = {};

    words.forEach((word) => {
      const cat = word.category || 'Basics';
      if (!grouped[cat]) {
        grouped[cat] = [];
        categories.push(cat);
      }
      grouped[cat].push({
        ...word,
        // Ensure image_url and audio_url fallback to keys for mapping in frontend AssetsMap
        image_url: word.image_url || word.image_key,
        audio_url: word.audio_url || word.audio_key,
      });
    });

    return categories.map((cat, idx) => {
      const catWords = grouped[cat];
      const isCompleted = catWords.every((w) => w.userProgress[0]?.isCompleted);
      const isUnlocked = catWords.some((w) => w.userProgress[0]?.isUnlocked);

      // Average stars for the category
      const totalStars = catWords.reduce(
        (acc, w) => acc + (w.userProgress[0]?.stars || 0),
        0,
      );
      const stars = Math.round(totalStars / catWords.length);

      return {
        id: `virtual_${cat.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        title: cat,
        order: idx,
        isUnlocked,
        isCompleted,
        stars,
        words: catWords,
        wordIdsByGroup: catWords.map((w) => w.id),
      };
    });
  }

  async findThemesByLanguage(languageId: string, userId: string) {
    const themes = await this.prisma.mulemTheme.findMany({
      where: { patrimonialLanguageId: languageId },
      orderBy: { order: 'asc' },
      include: {
        exercises: { select: { id: true } },
        userMulemThemeProgress: {
          where: { userId },
        },
        words: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            order: true,
            category: true,
            userProgress: {
              where: { userId },
              select: { isCompleted: true, isUnlocked: true },
            },
          },
        },
      },
    });

    return themes.map((t) => {
      const userThemeProg = t.userMulemThemeProgress[0];
      const e3Completed = userThemeProg?.isCompleted || false;
      const videoWatched = userThemeProg?.videoWatched || false;

      // Single-pass grouping to avoid O(N^2) complexity with multiple filters
      const catsMap = new Map<string, { 
        isUnlocked: boolean; 
        isCompleted: boolean; 
      }>();
      const catNames: string[] = [];

      t.words.forEach(w => {
        const catName = w.category || 'Basics';
        const prog = w.userProgress[0];
        const isUnlocked = prog?.isUnlocked || false;
        const isCompleted = prog?.isCompleted || false;

        if (!catsMap.has(catName)) {
          catNames.push(catName);
          catsMap.set(catName, { isUnlocked, isCompleted });
        } else {
          const current = catsMap.get(catName)!;
          catsMap.set(catName, {
            isUnlocked: current.isUnlocked || isUnlocked, // Category is unlocked if any word is unlocked
            isCompleted: current.isCompleted && isCompleted // Category is completed if all words are completed
          });
        }
      });

      let categories = catNames.map(name => ({
        name,
        ...catsMap.get(name)!
      }));

      // Second pass: sequential unlocking logic
      categories = categories.map((cat, idx) => {
        const isFirstTwo = idx < 2;
        const prevCompleted = idx > 0 && categories[idx - 1].isCompleted;
        return {
          ...cat,
          isUnlocked: cat.isUnlocked || isFirstTwo || prevCompleted
        };
      });

      const lessonsCount = categories.length;
      const symbolsCount = t.words.length; // Approximate count of distinct units
      const lessonsUnlockedCount = categories.filter(c => c.isUnlocked).length;
      const lessonsCompletedCount = categories.filter(c => c.isCompleted).length;



      // A theme unlocks only after the previous theme's final challenge is completed
      // AND its story video has been watched.
      let isThemeLocked = t.locked;
      if (t.order > 0) {
        const prevTheme = themes.find((prev) => prev.order === t.order - 1);
        const prevProg = prevTheme?.userMulemThemeProgress[0];
        isThemeLocked = !prevProg?.isCompleted || !prevProg?.videoWatched;
      }

      // exercisesCount: how many discrete exercises exist for this theme (Story mode)
      const exercisesCount = t.exercises.length || 3;
      // For progress bar: map completed lessons to exercises for UI consistency
      const exercisesCompleted = Math.min(
        exercisesCount,
        lessonsCompletedCount,
      );

      return {
        id: t.id,
        name: t.name_fr,
        nameLocal: t.name_local,
        code: t.code,
        order: t.order,
        icon: t.icon,
        color: t.color,
        locked: isThemeLocked,
        lockHint: t.lock_hint,
        lessonsCount,
        lessonsCompleted: lessonsCompletedCount,
        lessonsUnlocked: lessonsUnlockedCount,
        categories,
        exercisesCount,
        exercisesCompleted,
        e3Completed,
        videoWatched,
      };
    });
  }
}
