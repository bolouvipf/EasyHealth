import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuditService } from "./audit.service"
import { AuditController } from "./audit.controller"
import { AccessLog } from "./audit.entity"

@Module({
  imports: [TypeOrmModule.forFeature([AccessLog])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
