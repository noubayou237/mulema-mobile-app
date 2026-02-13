import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seedUsers() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      {
        email: "admin@test.com",
        username: "admin",
        name: "Admin",
        passwordHash: hashedPassword,
        role: "ADMIN",
        isVerified: true,
      },
      {
        email: "user@test.com",
        username: "user",
        name: "User",
        passwordHash: hashedPassword,
        role: "USER",
        isVerified: true,
      },
    ],
  });
}
