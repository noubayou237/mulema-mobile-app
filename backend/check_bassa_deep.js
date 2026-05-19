
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBassa() {
  const bassa = await prisma.patrimonialLanguage.findFirst({
    where: { name: { contains: 'Bassa', mode: 'insensitive' } }
  });

  if (!bassa) {
    console.log('Bassa language not found');
    return;
  }

  console.log(`Found Bassa: ${bassa.name} (Code: ${bassa.code}, ID: ${bassa.id})`);

  const themes = await prisma.lesson.findMany({
    where: { patrimonialLanguageId: bassa.id },
    orderBy: { order: 'asc' }
  });

  console.log('Bassa Themes:');
  themes.forEach(t => {
    console.log(`- ${t.title} (Code: ${t.code}, Locked: ${t.locked}, Order: ${t.order})`);
  });
}

checkBassa()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
