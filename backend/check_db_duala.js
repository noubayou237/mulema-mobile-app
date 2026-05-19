const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const words = await prisma.mulemWord.findMany({
    where: { language: { name: 'Duala' } },
    include: { theme: true }
  });
  const map = {};
  words.forEach(w => {
    if (!map[w.theme.name_fr]) map[w.theme.name_fr] = new Set();
    map[w.theme.name_fr].add(w.category);
  });
  for (const [theme, cats] of Object.entries(map)) {
  }
}

main().finally(() => prisma.$disconnect());
