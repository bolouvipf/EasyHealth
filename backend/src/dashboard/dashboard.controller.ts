import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { DashboardService } from "./dashboard.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"
import { CurrentUser } from "../common/decorators/current-user.decorator"

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: "Dashboard adapté au rôle de l'utilisateur connecté" })
  getDashboard(@CurrentUser() user: any) {
    switch (user.role) {
      case UserRole.MEDECIN:
        return this.dashboardService.getMedecinDashboard(user.sub)
      case UserRole.INFIRMIER:
        return this.dashboardService.getInfirmierDashboard(user.sub)
      case UserRole.AGENT_COMMUNAUTAIRE:
        return this.dashboardService.getAgentDashboard(user.sub)
      case UserRole.ADMINISTRATIF:
        return this.dashboardService.getAdministratifDashboard()
      case UserRole.PATIENT:
        return this.dashboardService.getPatientDashboard(user.sub)
      default:
        return this.dashboardService.getAdministratifDashboard()
    }
  }
}
