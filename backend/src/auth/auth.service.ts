import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, DataSource } from "typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { User } from "./user.entity"
import { PasswordResetToken } from "./password-reset.entity"
import { RefreshToken } from "./refresh-token.entity"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"
import { UserRole } from "../common/decorators/roles.decorator"
import { AuditService } from "../audit/audit.service"
import { AuditAction } from "../audit/audit.entity"
import { ProfessionalService } from "../professionals/professional.service"
import { PatientRecord } from "../patients/patient.entity"
import { MailService } from "../mail/mail.service"
import { TokenBlacklistService } from "./blacklist.service"
import { EncryptionService } from "../crypto/encryption.service"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15
const REFRESH_TOKEN_DAYS = 30

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PatientRecord)
    private readonly patientRecordRepository: Repository<PatientRecord>,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
    private readonly professionalService: ProfessionalService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly blacklistService: TokenBlacklistService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async getStats() {
    const totalUsers = await this.userRepository.count()
    const usersByRole = await this.userRepository
      .createQueryBuilder("user")
      .select("user.role", "role")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.role")
      .getRawMany()

    const activeUsers = await this.userRepository.count({ where: { isActive: true } })
    const pendingProfessionals = await this.professionalService.findPending().then((v) => v.length)

    const totalPatients = await this.dataSource
      .getRepository("patient_records")
      .count()

    return {
      totalUsers,
      activeUsers,
      pendingProfessionals,
      totalPatients,
      usersByRole,
    }
  }

  private validatePasswordComplexity(password: string) {
    const errors: string[] = []
    if (password.length < 8) errors.push("8 caractères minimum")
    if (!/[A-Z]/.test(password)) errors.push("une majuscule requise")
    if (!/[a-z]/.test(password)) errors.push("une minuscule requise")
    if (!/[0-9]/.test(password)) errors.push("un chiffre requis")
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("un caractère spécial requis")
    if (errors.length) throw new BadRequestException("Mot de passe faible : " + errors.join(", "))
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } })
    if (existing) throw new ConflictException("Cet email est déjà utilisé")

    this.validatePasswordComplexity(dto.password)

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(dto.password, salt)

    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      nom: dto.nom,
      prenom: dto.prenom,
      role: dto.role,
      telephone: dto.telephone,
      professionalLicenseNumber: dto.professionalLicenseNumber,
      hospital: dto.establishment,
      professionalStatus: dto.role === UserRole.PATIENT ? "verified" : "pending",
    })

    await this.userRepository.save(user)

    if (user.role === UserRole.PATIENT) {
      const sensitiveData: Record<string, string> = { nom: dto.nom, prenom: dto.prenom }

      const record = this.patientRecordRepository.create({
        nom: dto.nom,
        prenom: dto.prenom,
        userId: user.id,
        isActive: true,
        encryptedData: this.encryptionService.encrypt(JSON.stringify(sensitiveData)),
      })
      await this.patientRecordRepository.save(record)
    }

    if (user.role !== UserRole.PATIENT) {
      await this.professionalService.createVerification(
        user.id,
        dto.professionalLicenseNumber || "",
        dto.establishment,
      )
    }

    const accessToken = this.generateToken(user)
    const refreshToken = await this.generateRefreshToken(user)
    return { user: this.sanitizeUser(user), accessToken, refreshToken }
  }

  async login(dto: LoginDto, ip?: string) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException("Email ou mot de passe incorrect")

    if (!user.isActive) throw new ForbiddenException("Compte désactivé")

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
      throw new ForbiddenException(`Compte verrouillé. Réessayez dans ${remaining} minute(s).`)
    }

    if (user.role !== UserRole.PATIENT && user.professionalStatus !== "verified") {
      throw new ForbiddenException(
        "Compte professionnel en attente de vérification. Veuillez contacter l'administration."
      )
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
      }
      await this.userRepository.save(user)
      throw new UnauthorizedException("Email ou mot de passe incorrect")
    }

    user.failedLoginAttempts = 0
    user.lockedUntil = null
    user.lastLoginAt = new Date()
    await this.userRepository.save(user)

    await this.auditService.log({
      action: AuditAction.CONNEXION,
      userId: user.id,
      details: "Connexion réussie",
      ipAddress: ip,
    })

    const accessToken = this.generateToken(user)
    const refreshToken = await this.generateRefreshToken(user)
    return { user: this.sanitizeUser(user), accessToken, refreshToken }
  }

  async adminLogin(dto: LoginDto, ip?: string) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException("Email ou mot de passe incorrect")

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Accès réservé aux administrateurs")
    }

    if (!user.isActive) throw new ForbiddenException("Compte administrateur désactivé")

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
      throw new ForbiddenException(`Compte verrouillé. Réessayez dans ${remaining} minute(s).`)
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
      }
      await this.userRepository.save(user)
      throw new UnauthorizedException("Email ou mot de passe incorrect")
    }

    user.failedLoginAttempts = 0
    user.lockedUntil = null
    user.lastLoginAt = new Date()
    await this.userRepository.save(user)

    await this.auditService.log({
      action: AuditAction.CONNEXION,
      userId: user.id,
      details: "Connexion admin réussie",
      ipAddress: ip,
    })

    const accessToken = this.generateToken(user)
    const refreshToken = await this.generateRefreshToken(user)
    return { user: this.sanitizeUser(user), accessToken, refreshToken }
  }

  async verifyProfessional(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) throw new ForbiddenException("Utilisateur introuvable")
    user.professionalStatus = "verified"
    await this.userRepository.save(user)
    return this.sanitizeUser(user)
  }

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } })
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } })

    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    if (user) {
      await this.resetTokenRepository.save(
        this.resetTokenRepository.create({ user, token: hashedToken, expiresAt })
      )
      this.mailService.sendPasswordReset(email, rawToken)
    }

    return { token: rawToken, expiresAt: expiresAt.toISOString(), message: "Si cet email existe, un lien de réinitialisation a été envoyé." }
  }

  async resetPassword(rawToken: string, newPassword: string) {
    this.validatePasswordComplexity(newPassword)

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    this.logger.log(`Looking up token hash: ${hashedToken.substring(0, 16)}...`)
    const resetToken = await this.resetTokenRepository.findOne({
      where: { token: hashedToken, isUsed: false },
      relations: ["user"],
    })

    if (!resetToken) throw new BadRequestException("Token invalide ou déjà utilisé")
    this.logger.log(`Token found for user: ${resetToken.user?.id}`)
    if (new Date() > resetToken.expiresAt) throw new BadRequestException("Token expiré")

    resetToken.isUsed = true
    await this.resetTokenRepository.save(resetToken)
    this.logger.log("Token marked as used")

    const salt = await bcrypt.genSalt(12)
    resetToken.user.password = await bcrypt.hash(newPassword, salt)
    resetToken.user.failedLoginAttempts = 0
    resetToken.user.lockedUntil = null
    await this.userRepository.save(resetToken.user)
    this.logger.log("Password updated")

    return { message: "Mot de passe réinitialisé avec succès" }
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      professionalStatus: user.professionalStatus,
      tokenVersion: user.tokenVersion,
      jti: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
    }
    return this.jwtService.sign(payload)
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const rawToken = crypto.randomBytes(40).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000)

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        user,
        tokenHash,
        expiresAt,
      })
    )

    return rawToken
  }

  async refreshAccessToken(rawRefreshToken: string) {
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex")
    const stored = await this.refreshTokenRepository.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ["user"],
    })

    if (!stored) throw new UnauthorizedException("Refresh token invalide")
    if (new Date() > stored.expiresAt) throw new UnauthorizedException("Refresh token expiré")

    stored.isRevoked = true
    await this.refreshTokenRepository.save(stored)

    const user = stored.user
    if (!user.isActive) throw new ForbiddenException("Compte désactivé")

    const accessToken = this.generateToken(user)
    const newRefreshToken = await this.generateRefreshToken(user)

    return { accessToken, refreshToken: newRefreshToken }
  }

  async logout(rawRefreshToken: string, jti?: string) {
    if (!rawRefreshToken) return
    const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex")
    await this.refreshTokenRepository.update({ tokenHash, isRevoked: false }, { isRevoked: true })
    if (jti) this.blacklistService.add(jti)
  }

  async logoutAll(userId: string) {
    await this.refreshTokenRepository.update({ user: { id: userId }, isRevoked: false }, { isRevoked: true })
    await this.userRepository.increment({ id: userId }, "tokenVersion", 1)
    this.blacklistService.clear()
  }

  sanitizeUser(user: User) {
    const { password, ...rest } = user
    return rest
  }

  // --- Admin endpoints ---

  async findAllUsers() {
    const users = await this.userRepository.find({ order: { createdAt: "DESC" } })
    return users.map((u) => this.sanitizeUser(u))
  }

  async toggleUserActive(id: string) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException("Utilisateur introuvable")
    user.isActive = !user.isActive
    await this.userRepository.save(user)
    return this.sanitizeUser(user)
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException("Utilisateur introuvable")
    await this.resetTokenRepository.delete({ user: { id } })
    await this.refreshTokenRepository.delete({ user: { id } })
    await this.userRepository.delete(id)
    return { message: "Utilisateur supprimé avec succès" }
  }

  async resetAdminPassword(secret: string) {
    if (secret !== "EASYHEALTH_ADMIN_RESET_2026") {
      throw new UnauthorizedException("Code secret invalide")
    }

    let user = await this.userRepository.findOne({ where: { email: "admin@easyhealth.bj" } })

    if (!user) {
      const salt = await bcrypt.genSalt(12)
      user = this.userRepository.create({
        email: "admin@easyhealth.bj",
        password: await bcrypt.hash("Admin@2026!", salt),
        nom: "Administrateur",
        prenom: "EasyHealth",
        role: UserRole.ADMIN,
        professionalStatus: "verified",
        isActive: true,
      })
      await this.userRepository.save(user)
      return { message: "Compte admin créé avec succès" }
    }

    const salt = await bcrypt.genSalt(12)
    user.password = await bcrypt.hash("Admin@2026!", salt)
    user.failedLoginAttempts = 0
    user.lockedUntil = null
    await this.userRepository.save(user)

    return { message: "Mot de passe admin réinitialisé avec succès" }
  }
}
