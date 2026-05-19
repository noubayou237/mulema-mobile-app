
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ghomala = await prisma.patrimonialLanguage.findFirst({ where: { name: 'Ghomálá' } });
  if (!ghomala) {
    return;
  }

  const themes = await prisma.mulemTheme.findMany({
    where: { patrimonialLanguageId: ghomala.id },
    include: { _count: { select: { words: true } } }
  });

  themes.forEach(t => {
  });

  const allWords = await prisma.mulemWord.findMany({
    where: { theme: { patrimonialLanguageId: ghomala.id } }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
