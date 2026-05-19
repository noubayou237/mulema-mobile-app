
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBassaThemes() {
  const bassa = await prisma.patrimonialLanguage.findFirst({
    where: { code: 'bassa' }
  });

  if (!bassa) {
    console.log('Bassa language not found');
    return;
  }

  const themes = await prisma.lesson.findMany({
    where: { patrimonialLanguageId: bassa.id },
    orderBy: { order: 'asc' }
  });

  console.log('Bassa Themes in DB:');
  themes.forEach(t => {
    console.log(`- ID: ${t.id}, Code: ${t.code}, Title: ${t.title}, Order: ${t.order}`);
  });
}

checkBassaThemes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
