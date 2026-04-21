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
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    this.logger.log(`Register request for email: ${body.email}`);
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    this.logger.log(`Login request for identifier: ${body.identifier}`);
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


  // Social Login Endpoints
  @Post('google')
  async googleLogin(@Body() body: any) {
    this.logger.log(`Google login request for email: ${body.email}`);
    return this.authService.socialLogin(body, 'GOOGLE');
  }

  @Post('facebook')
  async facebookLogin(@Body() body: any) {
    this.logger.log(`Facebook login request for facebookId: ${body.facebookId}`);
    return this.authService.socialLogin(body, 'FACEBOOK');
  }

  @Post('apple')
  async appleLogin(@Body() body: any) {
    this.logger.log(`Apple login request for user: ${body.user}`);
    return this.authService.socialLogin(body, 'APPLE');
  }
}
