import { PrismaClient } from '@prisma/client';

export async function seedOfficialLanguages(prisma: PrismaClient) {
  console.log('Seeding official languages...');

  const languages = ['Français', 'Anglais'];

  for (const name of languages) {
    // On vérifie si la langue existe déjà pour éviter les doublons
    const exists = await prisma.officialLanguage.findFirst({
      where: { name },
    });

    if (!exists) {
      await prisma.officialLanguage.create({
        data: { name },
      });
    }
  }

  console.log('✅ Official languages seeded.');
}
