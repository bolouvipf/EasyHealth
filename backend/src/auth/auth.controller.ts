import { Controller, Post, Get, Body, Patch, Param, UseGuards, Req, Headers } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import { AuthService } from "./auth.service"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"
import { ForgotPasswordDto } from "./dto/forgot-password.dto"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { RolesGuard } from "./guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"
import { CurrentUser } from "../common/decorators/current-user.decorator"
import { Public } from "../common/decorators/public.decorator"

@ApiTags("Authentification")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Inscription (patient ou professionnel)" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  @ApiOperation({ summary: "Connexion" })
  login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = req.headers["x-forwarded-for"] || req.ip
    return this.authService.login(dto, ip)
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("admin-login")
  @ApiOperation({ summary: "Connexion administrateur (réservée)" })
  adminLogin(@Body() dto: LoginDto, @Req() req: any) {
    const ip = req.headers["x-forwarded-for"] || req.ip
    return this.authService.adminLogin(dto, ip)
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("refresh")
  @ApiOperation({ summary: "Rafraîchir le token d'accès" })
  refresh(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Révoquer le refresh token" })
  logout(@Body("refreshToken") refreshToken: string) {
    return this.authService.logout(refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout-all")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Révoquer tous les tokens (force la reconnexion)" })
  logoutAll(@CurrentUser() user: any) {
    return this.authService.logoutAll(user.sub)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch("verify/:id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Vérifier un compte professionnel (admin)" })
  verifyProfessional(@Param("id") id: string) {
    return this.authService.verifyProfessional(id)
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("forgot-password")
  @ApiOperation({ summary: "Demander un email de réinitialisation" })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email)
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post("reset-password")
  @ApiOperation({ summary: "Réinitialiser le mot de passe avec un token" })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword)
  }

  @UseGuards(JwtAuthGuard)
  @Post("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer le profil connecté" })
  getProfile(@CurrentUser() user: any) {
    return this.authService.findById(user.sub)
  }

  // --- Admin endpoints ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("users")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lister tous les utilisateurs (admin)" })
  findAllUsers() {
    return this.authService.findAllUsers()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch("users/:id/toggle-active")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Activer/désactiver un utilisateur (admin)" })
  toggleUserActive(@Param("id") id: string) {
    return this.authService.toggleUserActive(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("stats")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Statistiques du tableau de bord (admin)" })
  getStats() {
    return this.authService.getStats()
  }
}
