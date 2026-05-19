const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const themes = await prisma.mulemTheme.findMany({
    include: {
      _count: {
        select: { words: true }
      }
    }
  });

  themes.forEach(t => {
  });

  const sampleWords = await prisma.mulemWord.findMany({
    take: 5,
    include: {
      theme: true
    }
  });
  sampleWords.forEach(w => {
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
