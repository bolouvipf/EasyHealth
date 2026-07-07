import { Controller, Post, Body, Patch, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
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
  @Post("login")
  @ApiOperation({ summary: "Connexion" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
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
  @Post("forgot-password")
  @ApiOperation({ summary: "Demander un email de réinitialisation" })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email)
  }

  @Public()
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
}
