import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SharingService } from "./sharing.service"
import { SharingController } from "./sharing.controller"
import { SharingCode } from "./sharing.entity"
import { PatientRecord } from "../patients/patient.entity"
import { AuditModule } from "../audit/audit.module"

@Module({
  imports: [TypeOrmModule.forFeature([SharingCode, PatientRecord]), AuditModule],
  controllers: [SharingController],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {}
