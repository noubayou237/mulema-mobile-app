
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLanguages() {
  try {
    const langs = await prisma.patrimonialLanguage.findMany();
    for (const lang of langs) {
      const themes = await prisma.mulemTheme.findMany({ where: { patrimonialLanguageId: lang.id } });
      for (const t of themes) {
        const words = await prisma.mulemWord.count({ where: { themeId: t.id } });
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkLanguages();
