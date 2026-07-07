import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { SharingService } from "./sharing.service"
import { GenerateCodeDto } from "./dto/generate-code.dto"
import { AccessByCodeDto } from "./dto/access-by-code.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"
import { CurrentUser } from "../common/decorators/current-user.decorator"

@ApiTags("Partage")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("sharing")
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.PATIENT)
  @Post("generate")
  @ApiOperation({ summary: "Générer un code temporaire pour partager son dossier (patient)" })
  generateCode(@Body() dto: GenerateCodeDto, @CurrentUser() user: any) {
    return this.sharingService.generateCode(dto.patientRecordId, user.sub, dto.expiresInMinutes)
  }

  @Post("access")
  @ApiOperation({ summary: "Accéder à un dossier patient via code temporaire (professionnel connecté)" })
  accessByCode(@Body() dto: AccessByCodeDto, @CurrentUser() user: any) {
    return this.sharingService.accessByCode(dto.code, user.sub)
  }

  @Get("grant/:patientRecordId")
  @ApiOperation({ summary: "Vérifier un accès actif à un dossier (dans la fenêtre de 30 min)" })
  async checkGrant(@Param("patientRecordId") patientRecordId: string, @CurrentUser() user: any) {
    const grant = await this.sharingService.getActiveGrant(user.sub, patientRecordId)
    if (!grant) return { hasAccess: false }
    return { hasAccess: true, expiresAt: grant.expiresAt }
  }

  @Get("codes/:patientRecordId")
  @ApiOperation({ summary: "Historique des codes générés pour un dossier" })
  getCodes(@Param("patientRecordId") patientRecordId: string) {
    return this.sharingService.findByPatient(patientRecordId)
  }
}
