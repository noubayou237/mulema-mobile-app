import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Crée des utilisateurs de test (un admin et un utilisateur standard).
 */
export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding users...');

  const saltRounds = 10;
  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  // Upsert permet d'éviter les erreurs si l'utilisateur existe déjà,
  // il le mettra à jour au lieu de planter.
  await prisma.user.upsert({
    where: { email: 'admin@mulema.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@mulema.com',
      username: 'admin',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@mulema.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@mulema.com',
      username: 'testuser',
      password: hashedPassword,
    },
  });

  console.log('✅ Users seeded.');
}