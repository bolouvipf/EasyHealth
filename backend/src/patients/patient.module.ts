import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PatientService } from "./patient.service"
import { PatientController } from "./patient.controller"
import { PatientRecord } from "./patient.entity"
import { AuditModule } from "../audit/audit.module"

@Module({
  imports: [TypeOrmModule.forFeature([PatientRecord]), AuditModule],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientsModule {}
