import { Controller, Get, Patch, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles, UserRole } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ProfessionalService } from "./professional.service";

@Controller("professionals")
export class ProfessionalController {
    constructor(private readonly professionalService: ProfessionalService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMINISTRATIF)
    @Get("pending")
    async getPending() {
        return await this.professionalService.findPending();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMINISTRATIF)
    @Get(":id")
    async getProfessional(@Param("id") id: string) {
        return await this.professionalService.findById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMINISTRATIF)
    @Patch("activate/:id")
    async activate(@Param("id") id: string, @CurrentUser() user: { sub: string }) {
        return await this.professionalService.activateProfessional(id, user.sub);
    }
}