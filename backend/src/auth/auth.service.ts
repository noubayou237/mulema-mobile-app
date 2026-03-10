import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { EmailService } from './email/email.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
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
      throw new BadRequestException('Missing fields');
    }

    try {
      const passwordHash = await bcrypt.hash(body.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          username: body.username,
          name: body.name,
          passwordHash,
        },
      });

      // Generate and send OTP for email verification
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      await this.prisma.otp.create({
        data: {
          code: otpCode,
          purpose: 'VERIFY_EMAIL',
          userId: user.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 min
        },
      });

      // Send OTP email
      try {
        await this.emailService.sendOtp(user.email, otpCode, 'verification');
        this.logger.log(`OTP sent to ${user.email} for registration`);
      } catch (emailError) {
        this.logger.error(`Failed to send OTP to ${user.email}:`, emailError);
        // Don't fail registration if email fails
      }

      return {
        id: user.id,
        email: user.email,
        message:
          'Registration successful. Please check your email for verification code.',
      };
    } catch (error) {
      // Handle Prisma P2002 error (unique constraint violation)
      if (error.code === 'P2002') {
        throw new ConflictException('Un compte avec cet email existe déjà');
      }
      throw error;
    }
  }

  // =====================
  // LOGIN
  // =====================
  async login(body: { email: string; password: string }) {
    if (!body?.email || !body?.password) {
      throw new BadRequestException('Email or password missing');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = (jwt as any).sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 15 }, // 15 min
    );

    const refreshToken = randomBytes(64).toString('hex');

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
      throw new BadRequestException('Refresh token missing');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = (jwt as any).sign(
      { sub: storedToken.user.id, role: storedToken.user.role },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 15 },
    );

    return { accessToken: newAccessToken };
  }

  // =====================
  // LOGOUT
  // =====================
  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token missing');
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
      throw new BadRequestException('Email missing');
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
        purpose: 'RESET_PASSWORD',
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
      throw new BadRequestException('Missing fields');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid request');
    }

    const otp = await this.prisma.otp.findFirst({
      where: {
        userId: user.id,
        code: otpCode,
        purpose: 'RESET_PASSWORD',
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
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

  // =====================
  // REQUEST OTP (for email verification)
  // =====================
  async requestOtp(email: string) {
    if (!email) {
      throw new BadRequestException('Email missing');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: true };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.otp.create({
      data: {
        code: otpCode,
        purpose: 'VERIFY_EMAIL',
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 min
      },
    });

    await this.emailService.sendOtp(user.email, otpCode);

    return { success: true };
  }

  // =====================
  // VERIFY EMAIL (OTP)
  // =====================
  async verifyEmail(body: { email: string; otpCode: string }) {
    const { email, otpCode } = body;

    if (!email || !otpCode) {
      throw new BadRequestException('Missing fields');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid request');
    }

    const otp = await this.prisma.otp.findFirst({
      where: {
        userId: user.id,
        code: otpCode,
        purpose: 'VERIFY_EMAIL',
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark user as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    await this.prisma.otp.delete({
      where: { id: otp.id },
    });

    return { success: true };
  }

  // =====================
  // VERIFY EMAIL AND LOGIN (auto-login after email verification)
  // =====================
  async verifyEmailAndLogin(body: { email: string; otpCode: string }) {
    const { email, otpCode } = body;

    if (!email || !otpCode) {
      throw new BadRequestException('Missing fields');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid request');
    }

    const otp = await this.prisma.otp.findFirst({
      where: {
        userId: user.id,
        code: otpCode,
        purpose: 'VERIFY_EMAIL',
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark user as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Delete used OTP
    await this.prisma.otp.delete({
      where: { id: otp.id },
    });

    // Generate tokens (auto-login)
    const accessToken = (jwt as any).sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 15 }, // 15 min
    );

    const refreshToken = randomBytes(64).toString('hex');

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
      user: { id: user.id, email: user.email, username: user.username },
    };
  }

  // =====================
  // SOCIAL LOGIN
  // =====================
  async socialLogin(body: {
    provider: 'GOOGLE' | 'FACEBOOK' | 'APPLE';
    providerId: string;
    email: string;
    name: string;
    username?: string;
  }) {
    const { provider, providerId, email, name, username } = body;

    if (!provider || !providerId || !email || !name) {
      throw new BadRequestException('Missing required fields');
    }

    // Check if user exists with this provider
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email, provider },
          { providerId, provider },
        ],
      },
    });

    const isNewUser = !user;

    if (user) {
      // Update existing user's provider info if needed
      if (!user.provider) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider,
            providerId,
            isSocial: true,
            isVerified: true, // Social login means email is verified
          },
        });
      }
    } else {
      // Create new user
      const generatedUsername = username || `${name.toLowerCase().replace(/\s+/g, '_')}_${provider.toLowerCase()}`;
      
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          username: generatedUsername,
          passwordHash: null, // No password for social login
          provider,
          providerId,
          isSocial: true,
          isVerified: true, // Email verified by social provider
        },
      });

      this.logger.log(`New social user created: ${email} via ${provider}`);
    }

    // Generate JWT tokens
    const accessToken = (jwt as any).sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 15 }, // 15 min
    );

    const refreshToken = randomBytes(64).toString('hex');

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
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      isNewUser, // Flag to indicate if this is a new registration
    };
  }

  // =====================
  // GENERATE TOKENS (helper)
  // =====================
  private generateTokens(user: any) {
    const accessToken = (jwt as any).sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 15 }, // 15 min
    );

    const refreshToken = randomBytes(64).toString('hex');

    return { accessToken, refreshToken };
  }
}
