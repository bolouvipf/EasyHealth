import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { PatientService } from "./patient.service"
import { CreatePatientDto } from "./dto/create-patient.dto"
import { UpdatePatientDto } from "./dto/update-patient.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"
import { CurrentUser } from "../common/decorators/current-user.decorator"

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
  create(@Body() dto: CreatePatientDto, @CurrentUser() user: any) {
    return this.patientService.create(dto, user.sub, user.role)
  }

  @Get()
  @ApiOperation({ summary: "Lister les dossiers patients" })
  findAll(@CurrentUser() user: any) {
    return this.patientService.findAll(user.sub, user.role)
  }

  @Get(":id")
  @ApiOperation({ summary: "Consulter un dossier patient" })
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.patientService.findOne(id, user.sub, user.role)
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.MEDECIN, UserRole.INFIRMIER, UserRole.ADMIN)
  @ApiOperation({ summary: "Modifier un dossier patient" })
  update(@Param("id") id: string, @Body() dto: UpdatePatientDto, @CurrentUser() user: any) {
    return this.patientService.update(id, dto, user.sub, user.role)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Désactiver un dossier patient (admin)" })
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.patientService.remove(id, user.sub)
  }
}
