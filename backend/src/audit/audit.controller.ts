import { Controller, Get, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { AuditService } from "./audit.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"
import { CurrentUser } from "../common/decorators/current-user.decorator"

@ApiTags("Audit")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: "Lister tous les logs d'accès (admin)" })
  findAll() {
    return this.auditService.findAll()
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("patient/:patientRecordId")
  @ApiOperation({ summary: "Logs d'accès d'un patient (admin)" })
  findByPatient(@Param("patientRecordId") patientRecordId: string) {
    return this.auditService.findByPatient(patientRecordId)
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("user/:userId")
  @ApiOperation({ summary: "Logs d'accès d'un utilisateur (admin)" })
  findByUser(@Param("userId") userId: string) {
    return this.auditService.findByUser(userId)
  }

  @Get("my-logs")
  @ApiOperation({ summary: "Mon historique d'accès (patient)" })
  getMyLogs(@CurrentUser() user: any) {
    return this.auditService.findByPatientOwner(user.sub)
  }
}
