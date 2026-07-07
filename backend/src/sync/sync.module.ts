import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SyncService } from "./sync.service"
import { SyncController } from "./sync.controller"
import { SyncOperation } from "./sync.entity"
import { ClinicalEntry } from "../patients/clinical-entry.entity"
import { ClinicalEntrySyncService } from "./clinical-entry-sync.service"

@Module({
  imports: [TypeOrmModule.forFeature([SyncOperation, ClinicalEntry])],
  controllers: [SyncController],
  providers: [SyncService, ClinicalEntrySyncService],
  exports: [SyncService],
})
export class SyncModule {}
