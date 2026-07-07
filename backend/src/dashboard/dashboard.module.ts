import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DashboardController } from "./dashboard.controller"
import { DashboardService } from "./dashboard.service"
import { PatientRecord } from "../patients/patient.entity"
import { ClinicalEntry } from "../patients/clinical-entry.entity"
import { User } from "../auth/user.entity"
import { AccessLog } from "../audit/audit.entity"

@Module({
  imports: [TypeOrmModule.forFeature([PatientRecord, ClinicalEntry, User, AccessLog])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
