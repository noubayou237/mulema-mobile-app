import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get, Patch, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: "Enregistrer un nouvel utilisateur" })
  @ApiResponse({ status: 201, description: "L'utilisateur a été créé avec succès et un token est retourné." })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: "Connecter un utilisateur" })
  @ApiResponse({ status: 200, description: "Connexion réussie, un token est retourné." })
  @ApiResponse({ status: 401, description: 'Identifiants invalides.' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: "Générer un OTP pour l'authentification" })
  @ApiResponse({ status: 201, description: "OTP généré avec succès." })
  @Post('otp/generate')
  async generateOtp(@Body('email') email: string) {
    return this.authService.generateOtp(email);
  }

  @ApiOperation({ summary: "Vérifier l'OTP et connecter l'utilisateur" })
  @ApiResponse({ status: 200, description: "Vérification réussie, tokens retournés." })
  @ApiResponse({ status: 401, description: "OTP invalide ou expiré." })
  @HttpCode(HttpStatus.OK)
  @Post('otp/verify')
  async verifyOtp(@Body() body: { email: string; otpCode: string }) {
    return this.authService.verifyOtp(body.email, body.otpCode);
  }

  @ApiOperation({ summary: "Rafraîchir les tokens d'accès" })
  @ApiResponse({ status: 200, description: "Nouveaux tokens générés." })
  @ApiResponse({ status: 401, description: "Refresh token invalide ou expiré." })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @ApiOperation({ summary: "Déconnecter l'utilisateur" })
  @ApiResponse({ status: 200, description: "Déconnexion réussie." })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Route protégée accessible uniquement par les administrateurs" })
  @ApiResponse({ status: 200, description: 'Accessible.' })
  @ApiResponse({ status: 401, description: 'Non autorisé (token manquant ou invalide).' })
  @ApiResponse({ status: 403, description: "Accès refusé (rôle insuffisant)." })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin-only')
  adminRoute() {
    return 'Accessible uniquement aux admins';
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer le profil de l'utilisateur connecté" })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour le profil de l'utilisateur connecté" })
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req, @Body() body: { name?: string; email?: string; username?: string; password?: string }) {
    return this.authService.updateProfile(req.user.userId, body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer tous les utilisateurs (Admin uniquement)" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN as any)
  @Get('users')
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer un utilisateur par ID (Admin uniquement)" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN as any)
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }
}
