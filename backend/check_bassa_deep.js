
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBassa() {
  const bassa = await prisma.patrimonialLanguage.findFirst({
    where: { name: { contains: 'Bassa', mode: 'insensitive' } }
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

checkBassa()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
