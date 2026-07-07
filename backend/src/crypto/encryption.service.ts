import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const TAG_LENGTH = 16
const PBKDF2_ITERATIONS = 600000
const KEY_LENGTH = 32
const ACTIVE_VERSION = 1

interface KeyEntry {
  version: number
  key: Buffer
}

@Injectable()
export class EncryptionService {
  private readonly keys: KeyEntry[] = []
  private readonly activeVersion: number

  constructor(configService: ConfigService) {
    const activeVersion = ACTIVE_VERSION
    this.activeVersion = activeVersion

    const keyV1 = configService.get<string>("ENCRYPTION_KEY_V1")
    if (!keyV1) {
      throw new Error("ENCRYPTION_KEY_V1 est obligatoire")
    }
    this.keys.push({ version: 1, key: this.deriveKey(keyV1) })
  }

  private deriveKey(secret: string): Buffer {
    const salt = crypto.createHash("sha256").update("EasyHealth:v1:" + secret).digest().subarray(0, 16)
    return crypto.pbkdf2Sync(secret, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha512")
  }

  encrypt(plaintext: string): string {
    const keyEntry = this.keys.find((k) => k.version === this.activeVersion)!
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, keyEntry.key, iv)
    let encrypted = cipher.update(plaintext, "utf8", "hex")
    encrypted += cipher.final("hex")
    const authTag = cipher.getAuthTag().toString("hex")
    return `v${keyEntry.version}:${iv.toString("hex")}:${authTag}:${encrypted}`
  }

  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(":")
    let version: number
    let ivHex: string
    let authTagHex: string
    let encrypted: string

    if (ciphertext.startsWith("v") && parts.length >= 4) {
      version = parseInt(parts[0].slice(1), 10)
      ivHex = parts[1]
      authTagHex = parts[2]
      encrypted = parts.slice(3).join(":")
    } else if (parts.length === 3) {
      version = 0
      ivHex = parts[0]
      authTagHex = parts[1]
      encrypted = parts[2]
    } else {
      throw new Error("Format de texte chiffré invalide")
    }

    const keyEntry = this.keys.find((k) => k.version === version)
    if (!keyEntry) {
      throw new Error(`Clé de version ${version} introuvable pour le déchiffrement`)
    }

    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")
    const decipher = crypto.createDecipheriv(ALGORITHM, keyEntry.key, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  }

  isEncrypted(value: string | null | undefined): boolean {
    if (!value) return false
    if (value.startsWith("v") && value.split(":").length >= 4) return true
    const parts = value.split(":")
    return parts.length === 3 && /^[0-9a-f]{32}$/i.test(parts[0]) && /^[0-9a-f]{32}$/i.test(parts[1])
  }

  reencryptToLatest(ciphertext: string): string | null {
    if (!this.isEncrypted(ciphertext)) return null
    const parts = ciphertext.split(":")
    let version: number
    if (ciphertext.startsWith("v")) {
      version = parseInt(parts[0].slice(1), 10)
    } else {
      version = 0
    }
    if (version === this.activeVersion) return null
    const plaintext = this.decrypt(ciphertext)
    return this.encrypt(plaintext)
  }
}
