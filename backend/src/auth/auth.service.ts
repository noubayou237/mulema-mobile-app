import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';
import { MailService } from './email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        role: Role.USER,
      },
      // Sélectionner les champs à retourner pour ne pas exposer le mot de passe
      select: { id: true, name: true, email: true, username: true, role: true, createdAt: true, totalPrawns: true },
    });

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier },
          { username: dto.identifier },
        ],
      },
    });


    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Mot de passe incorrect');

    // Générer les tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);
    return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.delete({
      where: {
        token: refreshToken,
      },
    });
  }

  async generateOtp(email: string) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Génère un code à 6 chiffres
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expire dans 5 minutes

    // Hash the OTP before storing it
    const saltRounds = 10;
    const hashedOtpCode = await bcrypt.hash(otpCode, saltRounds);

    await this.prisma.user.update({
      where: { email: email },
      data: {
        otpCode: hashedOtpCode,
        otpExpiresAt: otpExpiresAt,
      },
    });

    // TODO: Envoyer l'OTP par email/SMS ici (implémentation à ajouter)
    await this.mailService.sendOtp(email, otpCode);
    console.log(`OTP généré pour ${email}: ${otpCode}`);
    return otpCode; // Retourner l'OTP non hashé pour le développement (à supprimer en production)
  }

  async verifyOtp(email: string, otpCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new UnauthorizedException('Code OTP invalide ou expiré');
    }

    const isOtpValid = await bcrypt.compare(otpCode, user.otpCode);

    if (!isOtpValid) {
      throw new UnauthorizedException('Code OTP incorrect');
    }

    if (user.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('Code OTP expiré');
    }

    // Clear OTP after successful verification
    await this.prisma.user.update({
      where: { email: email },
      data: {
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    // Générer les tokens après la vérification OTP
    const tokens = await this.getTokens(user.id, user.email, user.role);
    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    const storedRefreshToken = await this.prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
    });
    if (!storedRefreshToken) throw new UnauthorizedException('Accès refusé');
    if (storedRefreshToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      });
      throw new UnauthorizedException('Accès refusé');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: storedRefreshToken.userId,
      },
    });
    if (!user) throw new UnauthorizedException('Accès refusé');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    return tokens;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        totalPrawns: true,
      },
    });

    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string; username?: string; password?: string }) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: data,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        totalPrawns: true,
      },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, username: true, role: true, createdAt: true, totalPrawns: true },
    });
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        totalPrawns: true,
      },
    });

    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    return user;
  }

  async getTokens(userId: string, email: string, role: Role) {
    const jwtPayload = {
      sub: userId,
      email: email,
      role: role,
    };
    return {
      access_token: await this.jwtService.signAsync(jwtPayload, {
        secret: 'at-secret', //process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '15m',
      }),
      refresh_token: await this.generateRefreshToken(userId, email, role),
    };
  }

  async generateRefreshToken(userId: string, email: string, role: Role) {
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        userId: userId,
        token: uuidv4(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });
    return refreshToken.token;
  }
}
