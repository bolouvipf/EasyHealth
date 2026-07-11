import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import Database from "better-sqlite3"
import * as path from "path"
import { config } from "dotenv"

config()

async function seed() {
  const dbPath = path.resolve(process.env.DB_PATH || "./data/easyhealth.db")
  console.log("Base de données:", dbPath)

  const db = new Database(dbPath)

  const existing = db.prepare(`SELECT id FROM users WHERE email = 'admin@easyhealth.bj'`).get()
  if (existing) {
    console.log("Compte admin déjà existant.")
    db.close()
    return
  }

  const salt = bcrypt.genSaltSync(12)
  const password = bcrypt.hashSync("Admin@2026!", salt)
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  db.prepare(
    `INSERT INTO users (id, email, password, nom, prenom, role, professionalStatus, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 'admin', 'verified', 1, ?, ?)`
  ).run(id, "admin@easyhealth.bj", password, "Administrateur", "EasyHealth", now, now)

  db.close()
  console.log("")
  console.log("✅ Compte admin créé avec succès !")
  console.log("")
  console.log("   Email:    admin@easyhealth.bj")
  console.log("   Mot de passe: Admin@2026!")
  console.log("")
  console.log("⚠️  CHANGEZ CE MOT DE PASSE APRÈS PREMIÈRE CONNEXION ⚠️")
}

seed().catch((err) => {
  console.error("Erreur:", err)
  process.exit(1)
})
