import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { EmailService } from "./email/email.service";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  // =====================
  // REGISTER
  // =====================
  async register(body: {
    email: string;
    username: string;
    name: string;
    password: string;
  }) {
    if (!body?.email || !body?.password || !body?.username || !body?.name) {
      throw new BadRequestException("Missing fields");
    }

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

  // =====================
  // LOGIN
  // =====================
  async login(body: { email: string; password: string }) {
    if (!body?.email || !body?.password) {
      throw new BadRequestException("Email or password missing");
    }

    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = (jwt as any).sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 15 } // 15 min
    );

    const refreshToken = randomBytes(64).toString("hex");

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // =====================
  // REFRESH TOKEN
  // =====================
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException("Refresh token missing");
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const newAccessToken = (jwt as any).sign(
      { sub: storedToken.user.id, role: storedToken.user.role },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 15 }
    );

    return { accessToken: newAccessToken };
  }

  // =====================
  // LOGOUT
  // =====================
  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException("Refresh token missing");
    }

    await this.prisma.refreshToken.deleteMany({
      where: { tokenHash: refreshToken },
    });

    return { success: true };
  }

  // =====================
  // REQUEST PASSWORD RESET (OTP)
  // =====================
  async requestPasswordReset(email: string) {
    if (!email) {
      throw new BadRequestException("Email missing");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Sécurité : réponse neutre même si user inexistant
    if (!user) {
      return { success: true };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.otp.create({
      data: {
        code: otpCode,
        purpose: "RESET_PASSWORD",
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 min
      },
    });

    await this.emailService.sendOtp(user.email, otpCode);

    return { success: true };
  }

  // =====================
  // RESET PASSWORD
  // =====================
  async resetPassword(body: {
    email: string;
    otpCode: string;
    newPassword: string;
  }) {
    const { email, otpCode, newPassword } = body;

    if (!email || !otpCode || !newPassword) {
      throw new BadRequestException("Missing fields");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid request");
    }

    const otp = await this.prisma.otp.findFirst({
      where: {
        userId: user.id,
        code: otpCode,
        purpose: "RESET_PASSWORD",
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      throw new UnauthorizedException("Invalid or expired OTP");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await this.prisma.otp.delete({
      where: { id: otp.id },
    });

    return { success: true };
  }
}
