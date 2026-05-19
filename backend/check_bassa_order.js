
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const words = await prisma.mulemWord.findMany({
    where: { theme: { code: 'fondations' } },
    orderBy: { order: 'asc' },
    select: { category: true, order: true }
  });
  
  const categories = Array.from(new Set(words.map(w => w.category)));
  console.log('Bassa Foundations Categories:');
  categories.forEach((cat, index) => {
    console.log(`${index}: ${cat}`);
  });
}

check().then(() => prisma.$disconnect());
