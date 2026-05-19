
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBassaThemes() {
  const bassa = await prisma.patrimonialLanguage.findFirst({
    where: { code: 'bassa' }
  });

  if (!bassa) {
    return;
  }

  const themes = await prisma.lesson.findMany({
    where: { patrimonialLanguageId: bassa.id },
    orderBy: { order: 'asc' }
  });

  themes.forEach(t => {
  });
}

checkBassaThemes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
