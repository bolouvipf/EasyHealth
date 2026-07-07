import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { ProfessionalService } from "./professional.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"
import { CurrentUser } from "../common/decorators/current-user.decorator"

@ApiTags("Professionnels")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("professionals")
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Get("pending")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Lister les demandes de vérification en attente (admin)" })
  findPending() {
    return this.professionalService.findPending()
  }

  @Post("verify/:id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Vérifier un professionnel de santé (admin)" })
  verify(@Param("id") id: string, @CurrentUser() user: any) {
    return this.professionalService.verify(id, user.sub)
  }

  @Post("reject/:id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Rejeter la vérification d'un professionnel (admin)" })
  reject(@Param("id") id: string, @Body("reason") reason: string) {
    return this.professionalService.reject(id, reason)
  }
}
