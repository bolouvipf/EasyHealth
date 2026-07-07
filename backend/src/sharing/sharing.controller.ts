import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { SharingService } from "./sharing.service"
import { GenerateCodeDto } from "./dto/generate-code.dto"
import { AccessByCodeDto } from "./dto/access-by-code.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"
import { Public } from "../common/decorators/public.decorator"
import { CurrentUser } from "../common/decorators/current-user.decorator"

@ApiTags("Partage")
@Controller("sharing")
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  @Post("generate")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Générer un code temporaire pour partager son dossier (patient)" })
  generateCode(@Body() dto: GenerateCodeDto, @CurrentUser() user: any) {
    return this.sharingService.generateCode(dto.patientRecordId, user.sub, dto.expiresInMinutes)
  }

  @Public()
  @Post("access")
  @ApiOperation({ summary: "Accéder à un dossier patient via code temporaire" })
  accessByCode(@Body() dto: AccessByCodeDto, @CurrentUser() user: any) {
    const userId = user?.sub || "anonymous"
    return this.sharingService.accessByCode(dto.code, userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get("codes/:patientRecordId")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Historique des codes générés pour un dossier" })
  getCodes(@Param("patientRecordId") patientRecordId: string) {
    return this.sharingService.findByPatient(patientRecordId)
  }
}
