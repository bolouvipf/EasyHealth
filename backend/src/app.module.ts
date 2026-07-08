import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler"
import { APP_GUARD } from "@nestjs/core"
import { AuthModule } from "./auth/auth.module"
import { PatientsModule } from "./patients/patient.module"
import { ProfessionalsModule } from "./professionals/professional.module"
import { SharingModule } from "./sharing/sharing.module"
import { AuditModule } from "./audit/audit.module"
import { SyncModule } from "./sync/sync.module"
import { EncryptionModule } from "./crypto/encryption.module"
import { DashboardModule } from "./dashboard/dashboard.module"
import { I18nModule } from "./i18n/i18n.module"
import { MailModule } from "./mail/mail.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<string>("DB_TYPE") === "postgres" ? "postgres" : "better-sqlite3",
        database: config.get<string>("DB_PATH", "./data/easyhealth.db"),
        host: config.get<string>("DB_HOST"),
        port: config.get<number>("DB_PORT"),
        username: config.get<string>("DB_USERNAME"),
        password: config.get<string>("DB_PASSWORD"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        subscribers: [],
        synchronize: true,
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EncryptionModule,
    AuthModule,
    PatientsModule,
    ProfessionalsModule,
    SharingModule,
    AuditModule,
    SyncModule,
    DashboardModule,
    I18nModule,
    MailModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
