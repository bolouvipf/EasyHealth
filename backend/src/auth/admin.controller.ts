import { Controller, Get, Patch, Post, Delete, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { RolesGuard } from "./guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"
import { CurrentUser } from "../common/decorators/current-user.decorator"

@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Get("stats")
  @ApiOperation({ summary: "Statistiques du tableau de bord (admin)" })
  getStats() {
    return this.authService.getStats()
  }

  @Get("users")
  @ApiOperation({ summary: "Lister tous les utilisateurs (admin)" })
  findAllUsers() {
    return this.authService.findAllUsers()
  }

  @Patch("users/:id/toggle-active")
  @ApiOperation({ summary: "Activer/désactiver un utilisateur (admin)" })
  toggleUserActive(@Param("id") id: string) {
    return this.authService.toggleUserActive(id)
  }

  @Delete("users/:id")
  @ApiOperation({ summary: "Supprimer un utilisateur (admin)" })
  deleteUser(@Param("id") id: string) {
    return this.authService.deleteUser(id)
  }
}
