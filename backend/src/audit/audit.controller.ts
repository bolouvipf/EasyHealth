import { Controller, Get, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { AuditService } from "./audit.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"

@ApiTags("Audit")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: "Lister tous les logs d'accès (admin)" })
  findAll() {
    return this.auditService.findAll()
  }

  @Get("patient/:patientRecordId")
  @ApiOperation({ summary: "Logs d'accès d'un patient (admin)" })
  findByPatient(@Param("patientRecordId") patientRecordId: string) {
    return this.auditService.findByPatient(patientRecordId)
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Logs d'accès d'un utilisateur (admin)" })
  findByUser(@Param("userId") userId: string) {
    return this.auditService.findByUser(userId)
  }
}
