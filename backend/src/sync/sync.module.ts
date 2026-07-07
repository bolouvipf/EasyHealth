import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SyncService } from "./sync.service"
import { SyncController } from "./sync.controller"
import { SyncOperation } from "./sync.entity"

@Module({
  imports: [TypeOrmModule.forFeature([SyncOperation])],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
