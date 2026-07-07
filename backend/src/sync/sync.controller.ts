import { Controller, Post, Get, Body, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger"
import { SyncService } from "./sync.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("Synchronisation")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("sync")
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post("push")
  @ApiOperation({ summary: "Pousser les opérations locales vers le serveur" })
  push(@Body("deviceId") deviceId: string, @Body("operations") operations: any[]) {
    return this.syncService.push(deviceId, operations)
  }

  @Get("pull")
  @ApiOperation({ summary: "Récupérer les modifications depuis le serveur" })
  @ApiQuery({ name: "since", required: false })
  pull(@Query("deviceId") deviceId: string, @Query("since") since?: string) {
    return this.syncService.pull(deviceId, since || "")
  }
}
