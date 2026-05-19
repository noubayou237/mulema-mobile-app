const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const themes = await prisma.mulemTheme.findMany({
    where: { patrimonialLanguage: { name: { contains: 'Bassa' } } },
    include: { words: true }
  });

  for (const t of themes) {
    const cats = [...new Set(t.words.map(w => w.category || 'Basics'))];
    if (t.words.length > 0) {
    }
  }
}

main().finally(() => prisma.$disconnect());
