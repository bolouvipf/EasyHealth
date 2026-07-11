import "reflect-metadata"
import { DataSource } from "typeorm"
import * as bcrypt from "bcrypt"
import { config } from "dotenv"
import { User } from "./auth/user.entity"
import { PatientRecord } from "./patients/patient.entity"
import { ClinicalEntry } from "./patients/clinical-entry.entity"
import { AccessLog } from "./audit/audit.entity"
import { ProfessionalVerification } from "./professionals/professional.entity"
import { PasswordResetToken } from "./auth/password-reset.entity"
import { RefreshToken } from "./auth/refresh-token.entity"
import { SyncOperation } from "./sync/sync.entity"
import { SharingCode } from "./sharing/sharing.entity"
import { AccessGrant } from "./sharing/access-grant.entity"
import { UserRole } from "./common/decorators/roles.decorator"

config()

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  const entities = [User, PatientRecord, ClinicalEntry, AccessLog, ProfessionalVerification, PasswordResetToken, RefreshToken, SyncOperation, SharingCode, AccessGrant]
  const dataSource = new DataSource(
    databaseUrl
      ? {
          type: "postgres",
          url: databaseUrl,
          entities,
          ssl: { rejectUnauthorized: false },
        }
      : {
          type: (process.env.DB_TYPE === "postgres" ? "postgres" : "better-sqlite3") as any,
          database: process.env.DB_PATH || "./data/easyhealth.db",
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          entities,
        }
  )

  await dataSource.initialize()
  const userRepo = dataSource.getRepository(User)

  const existing = await userRepo.findOne({ where: { email: "admin@easyhealth.bj" } })
  if (existing) {
    console.log("Compte admin déjà existant.")
    await dataSource.destroy()
    return
  }

  const salt = await bcrypt.genSalt(12)
  const password = await bcrypt.hash("Admin@2026!", salt)

  await userRepo.save({
    email: "admin@easyhealth.bj",
    password,
    nom: "Administrateur",
    prenom: "EasyHealth",
    role: UserRole.ADMIN,
    professionalStatus: "verified",
    isActive: true,
  })

  console.log("Compte admin créé avec succès.")
  console.log("Email: admin@easyhealth.bj")
  console.log("Mot de passe: Admin@2026!")
  console.log()
  console.log("⚠️  CHANGEZ CE MOT DE PASSE APRÈS PREMIÈRE CONNEXION ⚠️")

  await dataSource.destroy()
}

seed().catch((err) => {
  console.error("Erreur:", err)
  process.exit(1)
})
