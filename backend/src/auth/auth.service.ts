import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(body: {
    email: string;
    username: string;
    name: string;
    password: string;
  }) {
    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        name: body.name,
        passwordHash,
      },
    });

    return { id: user.id, email: user.email };
  }

  async login(body: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // ✅ CAST EN any → PLUS AUCUNE ERREUR TS
    const token = (jwt as any).sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { accessToken: token };
  }
}
