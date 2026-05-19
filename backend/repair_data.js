const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

  const langs = await prisma.patrimonialLanguage.findMany({ include: { mulemThemes: { include: { words: true } } } });

  for (const lang of langs) {

    for (const theme of lang.mulemThemes) {
      const words = theme.words;
      if (words.length === 0) continue;

      const categories = [...new Set(words.map(w => w.category || 'Basics'))];
      const unlockedCats = [categories[0], categories[1]].filter(Boolean);

      // Find users with ANY progress in this theme
      const userIdsWithProg = await prisma.userProgress.findMany({
        where: { mulemWord: { themeId: theme.id } },
        select: { userId: true },
        distinct: ['userId']
      });


      for (const { userId } of userIdsWithProg) {
        // 1. Ensure UserMulemThemeProgress exists
        await prisma.userMulemThemeProgress.upsert({
          where: { userId_themeId: { userId, themeId: theme.id } },
          update: {},
          create: { userId, themeId: theme.id, isCompleted: false, videoWatched: false }
        });

        // 2. Ensure ALL words for this theme exist in UserProgress for this user
        for (const word of words) {
          const isFirstTwo = unlockedCats.includes(word.category || 'Basics');
          await prisma.userProgress.upsert({
            where: { userId_mulemWordId: { userId, mulemWordId: word.id } },
            update: isFirstTwo ? { isUnlocked: true } : {},
            create: {
              userId,
              mulemWordId: word.id,
              isUnlocked: isFirstTwo,
              isCompleted: false,
              stars: 0
            }
          });
        }
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
