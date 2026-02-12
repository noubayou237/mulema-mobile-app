import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailService } from './email/email.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    this.logger.log(`Register request for email: ${body.email}`);
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    this.logger.log(`Login request for email: ${body.email}`);
    return this.authService.login(body);
  }

  // ✅ ROUTE PROTÉGÉE
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    this.logger.log(`Password reset request for email: ${email}`);
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body()
    body: {
      email: string;
      otpCode: string;
      newPassword: string;
    },
  ) {
    this.logger.log(`Reset password request for email: ${body.email}`);
    return this.authService.resetPassword(body);
  }

  @Post('request-otp')
  async requestOtp(@Body('email') email: string) {
    this.logger.log(`OTP request for email: ${email}`);
    return this.authService.requestOtp(email);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body()
    body: {
      email: string;
      otpCode: string;
    },
  ) {
    this.logger.log(`Email verification request for email: ${body.email}`);
    return this.authService.verifyEmail(body);
  }

  // Auto-login after email verification
  @Post('verify-email-and-login')
  async verifyEmailAndLogin(
    @Body()
    body: {
      email: string;
      otpCode: string;
    },
  ) {
    this.logger.log(`Verify and login request for email: ${body.email}`);
    return this.authService.verifyEmailAndLogin(body);
  }

  // Debug endpoint - remove in production
  @Post('test-email')
  async testEmail(@Body('email') email: string) {
    this.logger.log(`Test email request for: ${email}`);
    try {
      await this.emailService.sendTestEmail(email);
      return { success: true, message: 'Test email sent' };
    } catch (error) {
      this.logger.error('Test email failed', error);
      return { success: false, message: error.message };
    }
  }
}
