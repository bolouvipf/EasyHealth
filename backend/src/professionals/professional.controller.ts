import { Controller, Get, Post, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles, UserRole } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ProfessionalService } from "./professional.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller("professionals")
export class ProfessionalController {
    constructor(private readonly professionalService: ProfessionalService) {}

    @Get("pending")
    async getPending() {
        return await this.professionalService.findPending();
    }

    @Get(":id")
    async getProfessional(@Param("id") id: string) {
        return await this.professionalService.findById(id);
    }

    @Post(":id/verify")
    async verify(@Param("id") id: string, @CurrentUser() user: { sub: string }) {
        return await this.professionalService.activateProfessional(id, user.sub);
    }

    @Post(":id/reject")
    async reject(@Param("id") id: string, @Body("reason") reason: string) {
        return await this.professionalService.rejectProfessional(id, reason);
    }

    @Patch("activate/:id")
    async activate(@Param("id") id: string, @CurrentUser() user: { sub: string }) {
        return await this.professionalService.activateProfessional(id, user.sub);
    }
}