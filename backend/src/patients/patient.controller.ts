import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { PatientService } from "./patient.service"
import { CreatePatientDto } from "./dto/create-patient.dto"
import { UpdatePatientDto } from "./dto/update-patient.dto"
import { CreateClinicalEntryDto } from "./dto/create-clinical-entry.dto"
import { PaginationDto } from "../common/dto/pagination.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"
import { CurrentUser } from "../common/decorators/current-user.decorator"
import { AuditIp } from "../common/decorators/audit-ip.decorator"

@ApiTags("Patients")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("patients")
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MEDECIN, UserRole.INFIRMIER, UserRole.ADMIN)
  @ApiOperation({ summary: "Créer un dossier patient" })
  create(@Body() dto: CreatePatientDto, @CurrentUser() user: any, @AuditIp() ip: string) {
    return this.patientService.create(dto, user.sub, user.role, ip)
  }

  @Get()
  @ApiOperation({ summary: "Lister les dossiers patients" })
  findAll(@CurrentUser() user: any, @Query() pagination: PaginationDto) {
    return this.patientService.findAll(user.sub, user.role, pagination)
  }

  @Get(":id")
  @ApiOperation({ summary: "Consulter un dossier patient" })
  findOne(@Param("id") id: string, @CurrentUser() user: any, @AuditIp() ip: string) {
    return this.patientService.findOne(id, user.sub, user.role, ip)
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.MEDECIN, UserRole.INFIRMIER, UserRole.ADMIN)
  @ApiOperation({ summary: "Modifier un dossier patient" })
  update(@Param("id") id: string, @Body() dto: UpdatePatientDto, @CurrentUser() user: any, @AuditIp() ip: string) {
    return this.patientService.update(id, dto, user.sub, user.role, ip)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Désactiver un dossier patient (admin)" })
  remove(@Param("id") id: string, @CurrentUser() user: any, @AuditIp() ip: string) {
    return this.patientService.remove(id, user.sub, ip)
  }

  @Post(":id/entries")
  @UseGuards(RolesGuard)
  @Roles(UserRole.MEDECIN, UserRole.INFIRMIER, UserRole.ADMIN)
  @ApiOperation({ summary: "Ajouter une entrée clinique (append-only)" })
  addClinicalEntry(
    @Param("id") id: string,
    @Body() dto: CreateClinicalEntryDto,
    @CurrentUser() user: any,
    @AuditIp() ip: string,
  ) {
    return this.patientService.addClinicalEntry(id, dto, user.sub, user.role, ip)
  }

  @Get(":id/entries")
  @ApiOperation({ summary: "Lister les entrées cliniques d'un dossier" })
  getClinicalEntries(@Param("id") id: string, @CurrentUser() user: any, @Query() pagination: PaginationDto) {
    return this.patientService.getClinicalEntries(id, user.sub, user.role, pagination)
  }
}
