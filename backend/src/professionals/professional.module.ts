import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProfessionalService } from "./professional.service"
import { ProfessionalController } from "./professional.controller"
import { ProfessionalVerification } from "./professional.entity"

@Module({
  imports: [TypeOrmModule.forFeature([ProfessionalVerification])],
  controllers: [ProfessionalController],
  providers: [ProfessionalService],
  exports: [ProfessionalService],
})
export class ProfessionalsModule {}
