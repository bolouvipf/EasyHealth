import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { AdminController } from "./admin.controller"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { User } from "./user.entity"
import { PasswordResetToken } from "./password-reset.entity"
import { RefreshToken } from "./refresh-token.entity"
import { PatientRecord } from "../patients/patient.entity"
import { AuditModule } from "../audit/audit.module"
import { ProfessionalsModule } from "../professionals/professional.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordResetToken, RefreshToken, PatientRecord]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("JWT_SECRET")
        if (!secret) {
          throw new Error("JWT_SECRET est obligatoire dans tous les environnements")
        }
        return {
          secret,
          signOptions: { expiresIn: config.get<string>("JWT_EXPIRATION", "15m") as any },
        }
      },
    }),
    AuditModule,
    ProfessionalsModule,
  ],
  controllers: [AuthController, AdminController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
