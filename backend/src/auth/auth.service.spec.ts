import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma/prisma.service';
import { EmailService } from './email/email.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let emailService: any;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    otp: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockEmailService = {
    sendOtp: jest.fn(),
    sendTestEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    emailService = module.get(EmailService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw BadRequestException if fields are missing', async () => {
      await expect(service.register({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a new user and send OTP', async () => {
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
      });
      mockPrisma.otp.create.mockResolvedValue({ id: 'otp-id' });
      mockEmailService.sendOtp.mockResolvedValue(true);

      const result = await service.register({
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        password: 'password123',
      });

      expect(result.email).toBe('test@example.com');
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.otp.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.register({
          email: 'existing@example.com',
          username: 'testuser',
          name: 'Test User',
          password: 'password123',
        }),
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should throw BadRequestException if credentials missing', async () => {
      await expect(service.login({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        passwordHash: 'hashedpassword',
      });
      // bcrypt.compare returns false
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on successful login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashedpassword',
        role: 'USER',
      });

      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'token-id' });

      const result = await service.login({
        email: 'test@example.com',
        password: 'correct',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('socialLogin', () => {
    const socialPayload = {
      provider: 'GOOGLE' as const,
      providerId: 'google-123',
      email: 'social@example.com',
      name: 'Social User',
      username: 'socialuser',
    };

    it('should throw BadRequestException if fields missing', async () => {
      await expect(service.socialLogin({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create new user for first-time social login', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'social@example.com',
        username: 'socialuser',
        name: 'Social User',
        role: 'USER',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'token-id' });

      const result = await service.socialLogin(socialPayload);

      expect(result.isNewUser).toBe(true);
      expect(result.user.email).toBe('social@example.com');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should login existing social user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-user-id',
        email: 'social@example.com',
        username: 'socialuser',
        name: 'Social User',
        role: 'USER',
        provider: 'GOOGLE',
        providerId: 'google-123',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'token-id' });

      const result = await service.socialLogin(socialPayload);

      expect(result.isNewUser).toBe(false);
      expect(result.accessToken).toBeDefined();
    });

    it('should update provider info for existing user without provider', async () => {
      const existingUser = {
        id: 'existing-user-id',
        email: 'social@example.com',
        username: 'socialuser',
        name: 'Social User',
        role: 'USER',
        provider: null,
        providerId: null,
      };
      mockPrisma.user.findFirst.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue({
        ...existingUser,
        provider: 'GOOGLE',
        providerId: 'google-123',
        isSocial: true,
        isVerified: true,
      });
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'token-id' });

      const result = await service.socialLogin(socialPayload);

      expect(mockPrisma.user.update).toHaveBeenCalled();
      expect(result.isNewUser).toBe(false);
    });
  });

  describe('verifyEmail', () => {
    it('should throw BadRequestException if fields missing', async () => {
      await expect(service.verifyEmail({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyEmail({
          email: 'notfound@example.com',
          otpCode: '123456',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if OTP invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrisma.otp.findFirst.mockResolvedValue(null);

      await expect(
        service.verifyEmail({ email: 'test@example.com', otpCode: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should verify email on valid OTP', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' });
      mockPrisma.otp.findFirst.mockResolvedValue({ id: 'otp-id' });
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-id',
        isVerified: true,
      });
      mockPrisma.otp.delete.mockResolvedValue({ id: 'otp-id' });

      const result = await service.verifyEmail({
        email: 'test@example.com',
        otpCode: '123456',
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { isVerified: true },
      });
    });
  });

  describe('refresh', () => {
    it('should throw BadRequestException if token missing', async () => {
      await expect(service.refresh('')).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if token invalid', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new access token on valid refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        tokenHash: 'valid-token',
        expiresAt: new Date(Date.now() + 86400000),
        user: { id: 'user-id', role: 'USER' },
      });

      const result = await service.refresh('valid-token');

      expect(result.accessToken).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should delete refresh token on logout', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('token-to-delete');

      expect(result.success).toBe(true);
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { tokenHash: 'token-to-delete' },
      });
    });
  });

  describe('requestPasswordReset', () => {
    it('should return success even if user not found (security)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.requestPasswordReset('notfound@example.com');

      expect(result.success).toBe(true);
    });

    it('should create OTP for existing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
      });
      mockPrisma.otp.create.mockResolvedValue({ id: 'otp-id' });
      mockEmailService.sendOtp.mockResolvedValue(true);

      const result = await service.requestPasswordReset('test@example.com');

      expect(result.success).toBe(true);
      expect(mockPrisma.otp.create).toHaveBeenCalled();
    });
  });
});
