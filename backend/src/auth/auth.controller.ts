import { Controller, Post, Body, Get, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post("login")
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  // ✅ ROUTE PROTÉGÉE
  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: any) {
    return req.user;
  }

  @Post("refresh")
refresh(@Body("refreshToken") refreshToken: string) {
  return this.authService.refresh(refreshToken);
}

@Post("logout")
logout(@Body("refreshToken") refreshToken: string) {
  return this.authService.logout(refreshToken);
}

@Post("request-password-reset")
requestPasswordReset(@Body("email") email: string) {
  return this.authService.requestPasswordReset(email);
}

@Post("reset-password")
resetPassword(
  @Body()
  body: {
    email: string;
    otpCode: string;
    newPassword: string;
  }
) {
  return this.authService.resetPassword(body);
}


}
