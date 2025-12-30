import { PrismaClient } from '@prisma/client';
import { seedLanguages } from './seeders/languages.seeder';
import { seedUsers } from './seeders/users.seeder';
import { seedOfficialLanguages } from './seeders/official-languages.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- 1. CLEANUP ---
  // L'ordre est crucial pour respecter les contraintes de clés étrangères.
  // On supprime du plus dépendant au moins dépendant.
  console.log('🧹 Cleaning database...');
  await prisma.question.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.level.deleteMany();
  await prisma.story.deleteMany();
  await prisma.patrimonialLanguage.deleteMany();
  
  // Nettoyage des langues officielles et leurs dépendances
  await prisma.userLanguage.deleteMany();
  await prisma.community.deleteMany();
  await prisma.officialLanguage.deleteMany();

  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Database cleaned.');

  // --- 2. SEEDING ---
  // L'ordre est également important ici.
  // On crée les entités indépendantes en premier.
  await seedOfficialLanguages(prisma);
  await seedUsers(prisma);
  await seedLanguages(prisma);

  console.log(`🚀 Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
