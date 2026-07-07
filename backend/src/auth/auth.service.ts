import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { User } from "./user.entity"
import { PasswordResetToken } from "./password-reset.entity"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"
import { UserRole } from "../common/decorators/roles.decorator"

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepository: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } })
    if (existing) throw new ConflictException("Cet email est déjà utilisé")

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(dto.password, salt)

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      professionalStatus: dto.role === UserRole.PATIENT ? "verified" : "pending",
    })

    await this.userRepository.save(user)
    const token = this.generateToken(user)
    return { user: this.sanitizeUser(user), token }
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException("Email ou mot de passe incorrect")

    if (!user.isActive) throw new ForbiddenException("Compte désactivé")

    if (user.role !== UserRole.PATIENT && user.professionalStatus !== "verified") {
      throw new ForbiddenException(
        "Compte professionnel en attente de vérification. Veuillez contacter l'administration."
      )
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) throw new UnauthorizedException("Email ou mot de passe incorrect")

    user.lastLoginAt = new Date()
    await this.userRepository.save(user)

    const token = this.generateToken(user)
    return { user: this.sanitizeUser(user), token }
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
    if (!user) throw new NotFoundException("Aucun compte trouvé avec cet email")

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await this.resetTokenRepository.save(
      this.resetTokenRepository.create({ userId: user.id, token, expiresAt })
    )

    return { message: "Email de réinitialisation envoyé", token }
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.resetTokenRepository.findOne({
      where: { token, isUsed: false },
      relations: ["user"],
    })

    if (!resetToken) throw new BadRequestException("Token invalide")
    if (new Date() > resetToken.expiresAt) throw new BadRequestException("Token expiré")

    resetToken.isUsed = true
    await this.resetTokenRepository.save(resetToken)

    const salt = await bcrypt.genSalt(12)
    resetToken.user.password = await bcrypt.hash(newPassword, salt)
    await this.userRepository.save(resetToken.user)

    return { message: "Mot de passe réinitialisé avec succès" }
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      professionalStatus: user.professionalStatus,
    }
    return this.jwtService.sign(payload)
  }

  sanitizeUser(user: User) {
    const { password, ...rest } = user
    return rest
  }
}
