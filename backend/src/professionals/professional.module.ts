import { Module } from "@nestjs/common";
import { ProfessionalService } from "./professional.service";
import { ProfessionalController } from "./professional.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfessionalVerification } from "./professional.entity";
import { User } from "../auth/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ProfessionalVerification, User])],
  providers: [ProfessionalService],
  controllers: [ProfessionalController],
  exports: [ProfessionalService],
})
export class ProfessionalModule {}